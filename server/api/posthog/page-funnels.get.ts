export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  const days = Number(getQuery(event).days) || 30

  if (!isPostHogConfigured()) {
    return { columns: ['page', 'views', 'forms', 'signups', 'form_rate'], results: [] }
  }

  return await queryPostHog(`
    SELECT properties.$pathname AS page,
      countIf(event = '$pageview') AS views,
      countIf(event = 'form_submitted') AS forms,
      countIf(event = 'signup_completed_server') AS signups,
      round(countIf(event = 'form_submitted') * 100.0 / greatest(countIf(event = '$pageview'), 1), 1) AS form_rate
    FROM events
    WHERE timestamp >= now() - INTERVAL ${days} DAY
      AND event IN ('$pageview', 'form_submitted', 'signup_completed_server')
    GROUP BY page ORDER BY views DESC LIMIT 15
  `)
})
