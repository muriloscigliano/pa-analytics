export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.formSubmissions

  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      properties.form_type AS form_type,
      properties.$pathname AS page,
      count() AS submissions,
      count(DISTINCT person_id) AS users
    FROM events
    WHERE event = 'form_submitted'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY form_type, page
    ORDER BY submissions DESC
    LIMIT 30
  `)
})
