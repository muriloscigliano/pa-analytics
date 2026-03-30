export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['from_page', 'transitions', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      replaceRegexpAll(prev_page, '(.+)/+$', '\\1') AS from_page,
      count() AS transitions,
      count(DISTINCT pid) AS users
    FROM (
      SELECT
        person_id AS pid,
        properties.$prev_pageview_pathname AS prev_page
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= now() - INTERVAL ${days} DAY
        AND replaceRegexpAll(properties.$pathname, '(.+)/+$', '\\1') = '/pricing'
        AND properties.$prev_pageview_pathname IS NOT NULL
        AND properties.$prev_pageview_pathname != ''
    )
    WHERE from_page != '/pricing' AND from_page != ''
    GROUP BY from_page ORDER BY transitions DESC LIMIT 15
  `)
})
