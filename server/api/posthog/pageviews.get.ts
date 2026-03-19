export default defineEventHandler(async (event) => {
  if (!isPostHogConfigured()) return MOCK.pageviews

  const query = getQuery(event)
  const days = Number(query.days) || 30
  return await queryPostHog(`
    SELECT toDate(timestamp) AS day, count() AS views
    FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY day ORDER BY day
  `)
})
