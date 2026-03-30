export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['label', 'location', 'destination', 'clicks', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT properties.cta_label AS label, properties.cta_location AS location,
      properties.destination AS destination, count() AS clicks, count(DISTINCT person_id) AS users
    FROM events WHERE event = 'cta_clicked' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY label, location, destination ORDER BY clicks DESC LIMIT 30
  `)
})
