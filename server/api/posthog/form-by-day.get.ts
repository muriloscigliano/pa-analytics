export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['day_num', 'day_name', 'submissions', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      toDayOfWeek(timestamp) AS day_num,
      count() AS submissions,
      count(DISTINCT person_id) AS users
    FROM events
    WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY day_num ORDER BY day_num
  `)
})
