export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['hour', 'submissions', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      toHour(timestamp) AS hour,
      count() AS submissions,
      count(DISTINCT person_id) AS users
    FROM events
    WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY hour ORDER BY hour
  `)
})
