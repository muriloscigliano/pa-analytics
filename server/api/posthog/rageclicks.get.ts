interface ElementHit { text: string; clicks: number; users: number }
interface PageIssue {
  page: string
  clicks: number
  users: number
  elements: ElementHit[]
}
interface Conversion {
  rageclickers: number
  rageclickerConverters: number
  rageclickerRate: number
  baselineUsers: number
  baselineConverters: number
  baselineRate: number
  lift: number
}

export default defineEventHandler(async (event): Promise<{
  total: number
  users: number
  pages: PageIssue[]
  conversion: Conversion
}> => {
  const empty = {
    total: 0, users: 0, pages: [],
    conversion: { rageclickers: 0, rageclickerConverters: 0, rageclickerRate: 0, baselineUsers: 0, baselineConverters: 0, baselineRate: 0, lift: 0 },
  }
  if (!isPostHogConfigured()) return empty

  const days = Number(getQuery(event).days) || 30

  const [totals, rowsRes, convRes] = await Promise.all([
    queryPostHog(`
      SELECT count() AS total, count(DISTINCT person_id) AS users
      FROM events
      WHERE event = '$rageclick' AND timestamp >= now() - INTERVAL ${days} DAY
    `),
    queryPostHog(`
      SELECT
        replaceRegexpAll(properties.$pathname, '/+$', '') AS page,
        coalesce(nullIf(properties.$el_text, ''), '(unlabeled)') AS text,
        count() AS clicks,
        count(DISTINCT person_id) AS users
      FROM events
      WHERE event = '$rageclick' AND timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY page, text
      ORDER BY users DESC, clicks DESC
      LIMIT 50
    `),
    queryPostHog(`
      WITH ragers AS (
        SELECT DISTINCT person_id FROM events
        WHERE event = '$rageclick' AND timestamp >= now() - INTERVAL ${days} DAY
      ),
      submitters AS (
        SELECT DISTINCT person_id FROM events
        WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
      )
      SELECT
        (SELECT count() FROM ragers) AS rageclickers,
        (SELECT count() FROM ragers WHERE person_id IN (SELECT person_id FROM submitters)) AS rager_converters,
        (SELECT count(DISTINCT person_id) FROM events
          WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
          AND person_id NOT IN (SELECT person_id FROM ragers)) AS baseline,
        (SELECT count(DISTINCT person_id) FROM events
          WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
          AND person_id NOT IN (SELECT person_id FROM ragers)
          AND person_id IN (SELECT person_id FROM submitters)) AS baseline_converters
    `),
  ])

  const [total = 0, users = 0] = totals.results?.[0] ?? []

  const pageMap = new Map<string, PageIssue>()
  for (const [pagePath, text, clicks, usersN] of (rowsRes.results ?? []) as any[]) {
    const page = pagePath || '/'
    const existing = pageMap.get(page) ?? { page, clicks: 0, users: 0, elements: [] }
    existing.clicks += clicks
    existing.users = Math.max(existing.users, usersN)
    existing.elements.push({ text, clicks, users: usersN })
    pageMap.set(page, existing)
  }
  const pages = [...pageMap.values()]
    .map(p => ({ ...p, elements: p.elements.slice(0, 3) }))
    .sort((a, b) => b.users - a.users || b.clicks - a.clicks)

  const [rageclickers = 0, ragerConverters = 0, baseline = 0, baselineConverters = 0] = convRes.results?.[0] ?? []
  const rageclickerRate = rageclickers > 0 ? Math.round((ragerConverters / rageclickers) * 1000) / 10 : 0
  const baselineRate = baseline > 0 ? Math.round((baselineConverters / baseline) * 1000) / 10 : 0
  const lift = baselineRate > 0 ? Math.round((rageclickerRate / baselineRate) * 10) / 10 : 0

  return {
    total, users, pages,
    conversion: {
      rageclickers,
      rageclickerConverters: ragerConverters,
      rageclickerRate,
      baselineUsers: baseline,
      baselineConverters,
      baselineRate,
      lift,
    },
  }
})
