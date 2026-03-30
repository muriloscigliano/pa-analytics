export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['page', 'views', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT properties.$pathname AS page, count() AS views, count(DISTINCT person_id) AS users
    FROM events
    WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
      AND person_id IN (
        SELECT DISTINCT person_id FROM events
        WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
      )
    GROUP BY page ORDER BY views DESC LIMIT 15
  `)
})
