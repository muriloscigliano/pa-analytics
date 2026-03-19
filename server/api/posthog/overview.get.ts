export default defineEventHandler(async (event) => {
  if (!isPostHogConfigured()) return MOCK.overview
  const days = Number(getQuery(event).days) || 30

  const [pageviews, uniqueUsers, signups] = await Promise.all([
    queryPostHog(`SELECT count() AS total FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY`),
    queryPostHog(`SELECT count(DISTINCT person_id) AS total FROM events WHERE timestamp >= now() - INTERVAL ${days} DAY`),
    queryPostHog(`SELECT count() AS total FROM events WHERE event = 'signup_completed' AND timestamp >= now() - INTERVAL ${days} DAY`),
  ])

  return {
    pageviews: pageviews.results?.[0]?.[0] ?? 0,
    uniqueUsers: uniqueUsers.results?.[0]?.[0] ?? 0,
    signups: signups.results?.[0]?.[0] ?? 0,
  }
})
