export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.menuNavigation
  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    SELECT properties.$el_text AS menu_item,
      elements_chain_href AS link_to,
      properties.$pathname AS from_page,
      count() AS clicks,
      count(DISTINCT person_id) AS users
    FROM events WHERE event = '$autocapture'
      AND elements_chain_href != ''
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY menu_item, link_to, from_page ORDER BY clicks DESC LIMIT 30
  `)
})
