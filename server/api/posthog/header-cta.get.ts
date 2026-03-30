export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['label', 'device', 'clicks', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT properties.cta_label AS label, properties.device_context AS device,
      count() AS clicks, count(DISTINCT person_id) AS users
    FROM events WHERE event = 'header_cta_clicked' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY label, device ORDER BY clicks DESC
  `)
})
