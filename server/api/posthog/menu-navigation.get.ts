export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.menuNavigation

  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      event AS event_type,
      properties.link_text AS link_text,
      properties.link_url AS link_url,
      properties.$pathname AS from_page,
      count() AS clicks,
      count(DISTINCT person_id) AS users
    FROM events
    WHERE event IN ('menu_link_clicked', 'header_cta_clicked')
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY event_type, link_text, link_url, from_page
    ORDER BY clicks DESC
    LIMIT 30
  `)
})
