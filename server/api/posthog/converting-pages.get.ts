export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['page', 'views', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT if(replaceRegexpAll(properties.$pathname, '/+$', '') = '', '/', replaceRegexpAll(properties.$pathname, '/+$', '')) AS page, count() AS views, count(DISTINCT person_id) AS users
    FROM events
    WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
      AND properties.$pathname NOT LIKE '%.png'
      AND properties.$pathname NOT LIKE '%.jpg'
      AND properties.$pathname NOT LIKE '%.svg'
      AND properties.$pathname NOT LIKE '%.webp'
      AND properties.$pathname NOT LIKE '%.pdf'
      AND properties.$pathname != '/welcome'
      AND person_id IN (
        SELECT DISTINCT person_id FROM events
        WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
      )
    GROUP BY page ORDER BY views DESC LIMIT 15
  `)
})
