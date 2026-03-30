export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['event_type', 'link_name', 'destination', 'menu_source', 'clicks', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT event AS event_type, properties.link_name AS link_name,
      properties.destination AS destination, properties.menu_source AS menu_source,
      count() AS clicks, count(DISTINCT person_id) AS users
    FROM events WHERE event IN ('menu_link_clicked', 'header_cta_clicked')
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY event_type, link_name, destination, menu_source ORDER BY clicks DESC LIMIT 30
  `)
})
