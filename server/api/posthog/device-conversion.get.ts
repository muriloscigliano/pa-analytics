export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  const days = Number(getQuery(event).days) || 30

  if (!isPostHogConfigured()) {
    return { columns: ['device', 'pageviews', 'form_submits', 'signups', 'users'], results: [] }
  }

  return await queryPostHog(`
    SELECT properties.$device_type AS device,
      countIf(event = '$pageview') AS pageviews,
      countIf(event = 'form_submitted') AS form_submits,
      countIf(event = 'signup_completed_server') AS signups,
      count(DISTINCT person_id) AS users
    FROM events WHERE timestamp >= now() - INTERVAL ${days} DAY
      AND event IN ('$pageview', 'form_submitted', 'signup_completed_server')
    GROUP BY device ORDER BY pageviews DESC
  `)
})
