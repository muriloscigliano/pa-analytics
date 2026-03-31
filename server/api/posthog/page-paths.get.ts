export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  const days = Number(getQuery(event).days) || 30

  if (!isPostHogConfigured()) {
    return { columns: ['from_page', 'to_page', 'transitions', 'users'], results: [] }
  }

  return await queryPostHog(`
    SELECT from_page, to_page, count() AS transitions, count(DISTINCT pid) AS users
    FROM (
      SELECT person_id AS pid,
        if(replaceRegexpAll(properties.$prev_pageview_pathname, '/+$', '') = '', '/',
          replaceRegexpAll(properties.$prev_pageview_pathname, '/+$', '')) AS from_page,
        if(replaceRegexpAll(properties.$pathname, '/+$', '') = '', '/',
          replaceRegexpAll(properties.$pathname, '/+$', '')) AS to_page
      FROM events
      WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
        AND properties.$prev_pageview_pathname IS NOT NULL
        AND properties.$prev_pageview_pathname != ''
        AND properties.$pathname NOT LIKE '%.png'
        AND properties.$pathname != '/welcome'
    )
    WHERE from_page != to_page
    GROUP BY from_page, to_page
    ORDER BY transitions DESC LIMIT 20
  `)
})
