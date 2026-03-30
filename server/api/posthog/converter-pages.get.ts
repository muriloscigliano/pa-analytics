export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['page', 'views', 'converters'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      replaceRegexpAll(properties.$pathname, '(.+)/+$', '\\1') AS page,
      count() AS views,
      count(DISTINCT person_id) AS converters
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - INTERVAL ${days} DAY
      AND properties.$pathname NOT LIKE '%.png'
      AND properties.$pathname NOT LIKE '%.jpg'
      AND properties.$pathname NOT LIKE '%.svg'
      AND properties.$pathname != '/welcome'
      AND person_id IN (
        SELECT DISTINCT person_id FROM events
        WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
      )
      AND person_id IN (
        SELECT person_id FROM (
          SELECT person_id, countIf(event = '$pageview') AS pv
          FROM events
          WHERE timestamp >= now() - INTERVAL ${days} DAY AND event = '$pageview'
          GROUP BY person_id
          HAVING pv >= 3 AND pv <= 5
        )
      )
    GROUP BY page ORDER BY views DESC LIMIT 15
  `)
})
