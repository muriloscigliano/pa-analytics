export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  const days = Number(getQuery(event).days) || 30

  if (!isPostHogConfigured()) {
    return { columns: ['device', 'pageviews', 'form_submits', 'form_submitters', 'signups', 'phone_calls', 'users'], results: [] }
  }

  return await queryPostHog(`
    SELECT properties.$device_type AS device,
      countIf(event = '$pageview') AS pageviews,
      countIf(event = 'form_submitted') AS form_submits,
      uniqIf(person_id, event = 'form_submitted') AS form_submitters,
      countIf(event = 'signup_completed_server') AS signups,
      countIf(event = 'phone_cta_clicked') AS phone_calls,
      count(DISTINCT person_id) AS users
    FROM events WHERE timestamp >= now() - INTERVAL ${days} DAY
      AND event IN ('$pageview', 'form_submitted', 'signup_completed_server', 'phone_cta_clicked')
    GROUP BY device ORDER BY pageviews DESC
  `)
})
