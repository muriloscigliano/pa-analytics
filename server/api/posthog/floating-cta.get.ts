export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['label', 'clicks', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT properties.cta_label AS label, count() AS clicks, count(DISTINCT person_id) AS users
    FROM events WHERE event = 'cta_clicked' AND properties.cta_location = 'mobile_floating_cta'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY label ORDER BY clicks DESC
  `)
})
