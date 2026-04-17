interface NavSide {
  summary: { total: number; users: number }
  categories: Array<{ name: string; opens: number; users: number }>
  links: Array<{ link_name: string | null; destination: string | null; clicks: number; users: number }>
  conversion: { clickers: number; converters: number; rate: number }
}

export default defineEventHandler(async (event): Promise<{ mobile: NavSide; desktop: NavSide }> => {
  const empty: NavSide = { summary: { total: 0, users: 0 }, categories: [], links: [], conversion: { clickers: 0, converters: 0, rate: 0 } }
  if (!isPostHogConfigured()) return { mobile: empty, desktop: { ...empty } }
  const days = Number(getQuery(event).days) || 30

  const [mobileSummary, desktopCats, mobileLinks, desktopLinks, mobileConv, desktopConv] = await Promise.all([
    queryPostHog(`
      SELECT count() AS total, count(DISTINCT person_id) AS users
      FROM events
      WHERE event = 'mobile_menu_toggled' AND properties.action = 'opened'
        AND timestamp >= now() - INTERVAL ${days} DAY
    `),
    queryPostHog(`
      SELECT properties.menu_name AS name, count() AS opens, count(DISTINCT person_id) AS users
      FROM events
      WHERE event = 'menu_opened' AND properties.menu_type = 'desktop_mega_menu'
        AND timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY name ORDER BY opens DESC LIMIT 8
    `),
    queryPostHog(`
      SELECT properties.link_name AS link_name, properties.destination AS destination,
        count() AS clicks, count(DISTINCT person_id) AS users
      FROM events
      WHERE event = 'menu_link_clicked' AND properties.menu_source = 'mobile_menu'
        AND timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY link_name, destination ORDER BY clicks DESC LIMIT 8
    `),
    queryPostHog(`
      SELECT properties.link_name AS link_name, properties.destination AS destination,
        count() AS clicks, count(DISTINCT person_id) AS users
      FROM events
      WHERE event = 'menu_link_clicked' AND properties.menu_source = 'desktop_mega_menu'
        AND timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY link_name, destination ORDER BY clicks DESC LIMIT 8
    `),
    queryPostHog(`
      SELECT count(DISTINCT person_id) AS clickers,
        count(DISTINCT if(person_id IN (
          SELECT person_id FROM events WHERE event = 'form_submitted'
            AND timestamp >= now() - INTERVAL ${days} DAY
        ), person_id, NULL)) AS converters
      FROM events
      WHERE event = 'menu_link_clicked' AND properties.menu_source = 'mobile_menu'
        AND timestamp >= now() - INTERVAL ${days} DAY
    `),
    queryPostHog(`
      SELECT count(DISTINCT person_id) AS clickers,
        count(DISTINCT if(person_id IN (
          SELECT person_id FROM events WHERE event = 'form_submitted'
            AND timestamp >= now() - INTERVAL ${days} DAY
        ), person_id, NULL)) AS converters
      FROM events
      WHERE event = 'menu_link_clicked' AND properties.menu_source = 'desktop_mega_menu'
        AND timestamp >= now() - INTERVAL ${days} DAY
    `),
  ])

  const mapLinks = (rows: any[]) => rows.map(([link_name, destination, clicks, users]: any[]) => ({ link_name, destination, clicks, users }))
  const mapCats = (rows: any[]) => rows.map(([name, opens, users]: any[]) => ({ name: name || 'Menu', opens, users }))
  const buildConv = (rows: any[]) => {
    const [clickers = 0, converters = 0] = rows[0] ?? []
    const rate = clickers > 0 ? Math.round((converters / clickers) * 1000) / 10 : 0
    return { clickers, converters, rate }
  }

  const [mTotal = 0, mUsers = 0] = mobileSummary.results?.[0] ?? []
  const desktopOpenCounts = desktopCats.results ?? []
  const dTotal = desktopOpenCounts.reduce((s: number, r: any[]) => s + (r[1] as number), 0)
  const dUsers = desktopOpenCounts.length ? Math.max(...desktopOpenCounts.map((r: any[]) => r[2] as number)) : 0

  return {
    mobile: {
      summary: { total: mTotal, users: mUsers },
      categories: [],
      links: mapLinks(mobileLinks.results ?? []),
      conversion: buildConv(mobileConv.results ?? []),
    },
    desktop: {
      summary: { total: dTotal, users: dUsers },
      categories: mapCats(desktopOpenCounts),
      links: mapLinks(desktopLinks.results ?? []),
      conversion: buildConv(desktopConv.results ?? []),
    },
  }
})
