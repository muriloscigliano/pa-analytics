export default defineEventHandler(async (event) => {
  if (!isPostHogConfigured()) return { flows: [], pages: [], stats: { totalVisitors: 0, singlePage: 0, multiPage: 0 } }
  const days = Number(getQuery(event).days) || 30
  const from = getQuery(event).from as string || ''

  const fromFilter = from
    ? `AND from_page = '${from}'`
    : ''

  const [flowsData, pagesData, depthData] = await Promise.all([
    // Page-to-page transitions using window function (works with SPA)
    queryPostHog(`
      SELECT from_page, to_page, count() AS transitions, count(DISTINCT pid) AS users
      FROM (
        SELECT person_id AS pid,
          if(replaceRegexpAll(properties.$pathname, '/+$', '') = '', '/',
            replaceRegexpAll(properties.$pathname, '/+$', '')) AS from_page,
          if(replaceRegexpAll(
            leadInFrame(properties.$pathname, 1) OVER (PARTITION BY person_id ORDER BY timestamp),
            '/+$', '') = '', '/',
            replaceRegexpAll(
              leadInFrame(properties.$pathname, 1) OVER (PARTITION BY person_id ORDER BY timestamp),
              '/+$', ''))
          AS to_page
        FROM events
        WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
          AND properties.$pathname != '/welcome'
          AND properties.$pathname NOT LIKE '%.png'
      )
      WHERE to_page != '' AND to_page IS NOT NULL
        AND from_page != to_page
        AND to_page != '/welcome'
        ${fromFilter}
      GROUP BY from_page, to_page
      ORDER BY transitions DESC LIMIT 30
    `),

    // Pages for filter dropdown
    queryPostHog(`
      SELECT
        if(replaceRegexpAll(properties.$pathname, '/+$', '') = '', '/',
          replaceRegexpAll(properties.$pathname, '/+$', '')) AS page,
        count() AS views
      FROM events
      WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
        AND properties.$pathname != '/welcome'
        AND properties.$pathname NOT LIKE '%.png'
      GROUP BY page ORDER BY views DESC LIMIT 20
    `),

    // Visitor depth stats
    queryPostHog(`
      SELECT
        count() AS total_visitors,
        countIf(pv = 1) AS single_page,
        countIf(pv >= 2) AS multi_page
      FROM (
        SELECT person_id, countIf(event = '$pageview') AS pv
        FROM events
        WHERE timestamp >= now() - INTERVAL ${days} DAY AND event = '$pageview'
        GROUP BY person_id
      )
    `),
  ])

  return {
    flows: flowsData.results.map(([from, to, transitions, users]: [string, string, number, number]) => ({
      from, to, transitions, users,
    })),
    pages: pagesData.results.map(([page, views]: [string, number]) => ({ page, views })),
    stats: {
      totalVisitors: depthData.results?.[0]?.[0] ?? 0,
      singlePage: depthData.results?.[0]?.[1] ?? 0,
      multiPage: depthData.results?.[0]?.[2] ?? 0,
    },
  }
})
