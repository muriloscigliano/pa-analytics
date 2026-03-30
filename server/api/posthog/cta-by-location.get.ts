export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['page', 'clicks', 'signup_clicks', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT properties.cta_location AS page, count() AS clicks,
      countIf(properties.destination = '/signup' OR properties.destination LIKE '%modal%') AS signup_clicks,
      count(DISTINCT person_id) AS users
    FROM events WHERE event = 'cta_clicked' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY page ORDER BY clicks DESC LIMIT 15
  `)
})
