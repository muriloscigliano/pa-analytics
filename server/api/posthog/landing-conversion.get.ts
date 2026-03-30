export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['landing_page', 'submissions', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT properties.landing_page AS landing_page, count() AS submissions, count(DISTINCT person_id) AS users
    FROM events WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY landing_page ORDER BY submissions DESC LIMIT 15
  `)
})
