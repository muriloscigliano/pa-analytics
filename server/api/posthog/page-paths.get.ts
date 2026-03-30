export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  const days = Number(getQuery(event).days) || 30

  if (!isPostHogConfigured()) {
    return { columns: ['from_page', 'to_page', 'transitions', 'users'], results: [] }
  }

  return await queryPostHog(`
    SELECT from_page, to_page, count() AS transitions, count(DISTINCT pid) AS users
    FROM (
      SELECT person_id AS pid,
        replaceRegexpAll(properties.$pathname, '/+$', '') AS from_page,
        replaceRegexpAll(leadInFrame(properties.$pathname, 1) OVER (PARTITION BY person_id ORDER BY timestamp), '/+$', '') AS to_page
      FROM events
      WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
        AND properties.$pathname NOT LIKE '%.png'
        AND properties.$pathname NOT LIKE '%.jpg'
        AND properties.$pathname NOT LIKE '%.svg'
        AND properties.$pathname NOT LIKE '%.webp'
        AND properties.$pathname NOT LIKE '%.pdf'
    )
    WHERE to_page != '' AND to_page IS NOT NULL AND from_page != to_page
    GROUP BY from_page, to_page
    ORDER BY transitions DESC LIMIT 20
  `)
})
