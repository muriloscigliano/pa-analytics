export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['page', 'entries', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      replaceRegexpAll(first_page, '/+$', '') AS page,
      count() AS entries,
      count(DISTINCT pid) AS users
    FROM (
      SELECT person_id AS pid,
        argMin(properties.$pathname, timestamp) AS first_page
      FROM events
      WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
        AND properties.$pathname NOT LIKE '%.png'
        AND properties.$pathname NOT LIKE '%.jpg'
        AND properties.$pathname NOT LIKE '%.svg'
      GROUP BY person_id
    )
    GROUP BY page ORDER BY entries DESC LIMIT 15
  `)
})
