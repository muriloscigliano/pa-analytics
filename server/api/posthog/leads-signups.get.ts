export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.leadsSignups

  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      toDate(timestamp) AS day,
      countIf(event = 'form_submitted') AS leads,
      countIf(event = 'signup_completed_server') AS signups
    FROM events
    WHERE event IN ('form_submitted', 'signup_completed_server')
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY day
    ORDER BY day
  `)
})
