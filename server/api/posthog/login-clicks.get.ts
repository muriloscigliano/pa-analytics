export default defineEventHandler(async (event) => {
  if (!isPostHogConfigured()) return { byDevice: { columns: ['device', 'clicks', 'users'], results: [] }, totalVisitors: 0 }
  const days = Number(getQuery(event).days) || 30

  const [byDevice, visitors] = await Promise.all([
    queryPostHog(`
      SELECT properties.$device_type AS device, count() AS clicks, count(DISTINCT person_id) AS users
      FROM events WHERE event = 'login_clicked' AND timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY device ORDER BY clicks DESC
    `),
    queryPostHog(`
      SELECT count(DISTINCT person_id) AS total
      FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
    `),
  ])

  return {
    byDevice,
    totalVisitors: visitors.results?.[0]?.[0] ?? 0,
  }
})
