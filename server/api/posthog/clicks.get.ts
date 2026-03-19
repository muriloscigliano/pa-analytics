export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.clicks
  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    SELECT
      properties.$pathname AS page,
      properties.$el_text AS button_text,
      elements_chain_href AS link_to,
      count() AS clicks,
      count(DISTINCT person_id) AS users
    FROM events
    WHERE event = '$autocapture'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY page, button_text, link_to
    ORDER BY page, clicks DESC
    LIMIT 50
  `)
})
