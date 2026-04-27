interface ElementRow { label: string; clicks: number; users: number }
type HeatmapType = 'click' | 'rageclick' | 'change' | 'submit'

export default defineEventHandler(async (event): Promise<{
  page: string
  type: HeatmapType
  totalEvents: number
  totalUsers: number
  elements: ElementRow[]
  pages: Array<{ page: string; clicks: number }>
}> => {
  const empty = { page: '/', type: 'click' as HeatmapType, totalEvents: 0, totalUsers: 0, elements: [], pages: [] }
  if (!isPostHogConfigured()) return empty

  const query = getQuery(event)
  const days = Number(query.days) || 30
  const page = String(query.page || '/')
  const type = (String(query.type || 'click')) as HeatmapType

  const whereByType: Record<HeatmapType, string> = {
    click: `event = '$autocapture' AND properties.$event_type = 'click'`,
    rageclick: `event = '$rageclick'`,
    change: `event = '$autocapture' AND properties.$event_type = 'change'`,
    submit: `event = '$autocapture' AND properties.$event_type = 'submit'`,
  }
  const whereClause = whereByType[type] || whereByType.click

  const pageMatch = `if(replaceRegexpAll(properties.$pathname, '/+$', '') = '', '/', replaceRegexpAll(properties.$pathname, '/+$', '')) = '${page.replace(/'/g, "''")}'`

  const [pagesRes, totalsRes, elementsRes] = await Promise.all([
    queryPostHog(`
      SELECT
        if(replaceRegexpAll(properties.$pathname, '/+$', '') = '', '/', replaceRegexpAll(properties.$pathname, '/+$', '')) AS page,
        count() AS clicks
      FROM events
      WHERE ${whereClause}
        AND timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY page
      ORDER BY clicks DESC
      LIMIT 25
    `),
    queryPostHog(`
      SELECT count() AS clicks, count(DISTINCT person_id) AS users
      FROM events
      WHERE ${whereClause}
        AND ${pageMatch}
        AND timestamp >= now() - INTERVAL ${days} DAY
    `),
    queryPostHog(`
      SELECT
        coalesce(nullIf(properties.$el_text, ''), '(unlabeled element)') AS label,
        count() AS clicks,
        count(DISTINCT person_id) AS users
      FROM events
      WHERE ${whereClause}
        AND ${pageMatch}
        AND timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY label
      ORDER BY clicks DESC
      LIMIT 25
    `),
  ])

  const [totalEvents = 0, totalUsers = 0] = totalsRes.results?.[0] ?? []

  function normalize(raw: string): string {
    const trimmed = String(raw || '').replace(/\s+/g, ' ').trim()
    if (!trimmed) return '(unlabeled element)'
    const tokens = trimmed.split(' ')
    const letterSpaced = tokens.length >= 3 && tokens.every(t => t.length === 1 && /[A-Za-z]/.test(t))
    return letterSpaced ? tokens.join('') : trimmed
  }

  // Normalize letter-spaced labels and merge duplicates
  const normMap = new Map<string, ElementRow>()
  for (const [rawLabel, clicks, users] of (elementsRes.results ?? []) as any[]) {
    const label = normalize(rawLabel)
    const existing = normMap.get(label)
    if (existing) {
      existing.clicks += clicks
      existing.users = Math.max(existing.users, users)
    } else {
      normMap.set(label, { label, clicks, users })
    }
  }
  const elements = [...normMap.values()].sort((a, b) => b.clicks - a.clicks).slice(0, 15)

  const pages = (pagesRes.results ?? []).map(([p, c]: any[]) => ({ page: p || '/', clicks: c }))

  return { page, type, totalEvents, totalUsers, elements, pages }
})
