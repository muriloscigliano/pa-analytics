export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['label', 'location', 'destination', 'clicks', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      event AS event_type,
      if(properties.cta_label IS NULL OR properties.cta_label = '', event, properties.cta_label) AS label,
      count() AS clicks,
      count(DISTINCT person_id) AS users
    FROM events
    WHERE event IN ('header_cta_clicked', 'welcome_cta_clicked')
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY event_type, label ORDER BY clicks DESC LIMIT 30
  `)
})
