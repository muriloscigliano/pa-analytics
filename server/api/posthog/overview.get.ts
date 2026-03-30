export default defineEventHandler(async (event) => {
  if (!isPostHogConfigured()) return MOCK.overview
  const days = Number(getQuery(event).days) || 30

  const [pageviews, uniqueUsers, formSubmissions, signups] = await Promise.all([
    queryPostHog(`SELECT count() AS total FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY`),
    queryPostHog(`SELECT count(DISTINCT person_id) AS total FROM events WHERE timestamp >= now() - INTERVAL ${days} DAY`),
    queryPostHog(`SELECT count() AS total, count(DISTINCT person_id) AS unique_users FROM events WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY`),
    queryPostHog(`SELECT count() AS total FROM events WHERE event = 'signup_completed_server' AND timestamp >= now() - INTERVAL ${days} DAY`),
  ])

  return {
    pageviews: pageviews.results?.[0]?.[0] ?? 0,
    uniqueUsers: uniqueUsers.results?.[0]?.[0] ?? 0,
    formSubmissions: formSubmissions.results?.[0]?.[0] ?? 0,
    formSubmitters: formSubmissions.results?.[0]?.[1] ?? 0,
    signups: signups.results?.[0]?.[0] ?? 0,
  }
})
