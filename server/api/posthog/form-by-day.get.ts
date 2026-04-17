export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['day_num', 'submissions', 'submitters', 'visitors'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      toDayOfWeek(timestamp) AS day_num,
      countIf(event = 'form_submitted') AS submissions,
      count(DISTINCT if(event = 'form_submitted', person_id, NULL)) AS submitters,
      count(DISTINCT if(event = '$pageview', person_id, NULL)) AS visitors
    FROM events
    WHERE event IN ('form_submitted', '$pageview')
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY day_num ORDER BY day_num
  `)
})
