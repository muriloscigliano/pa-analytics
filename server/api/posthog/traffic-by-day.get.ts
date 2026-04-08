export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['dow', 'pageviews', 'users', 'forms'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      toDayOfWeek(timestamp) AS dow,
      countIf(event = '$pageview') AS pageviews,
      count(DISTINCT person_id) AS users,
      countIf(event = 'form_submitted') AS forms
    FROM events
    WHERE event IN ('$pageview', 'form_submitted')
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY dow
    ORDER BY dow
  `)
})
