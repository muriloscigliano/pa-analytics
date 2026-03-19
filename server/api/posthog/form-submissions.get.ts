export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.formSubmissions
  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    SELECT properties.$pathname AS page,
      properties.$el_text AS button_text,
      count() AS submissions,
      count(DISTINCT person_id) AS users
    FROM events WHERE event = '$autocapture'
      AND properties.$event_type = 'submit'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY page, button_text ORDER BY submissions DESC LIMIT 20
  `)
})
