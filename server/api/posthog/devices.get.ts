export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.devices
  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    SELECT properties.$device_type AS device, properties.$browser AS browser, properties.$os AS os,
      count() AS pageviews, count(DISTINCT person_id) AS users
    FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY device, browser, os ORDER BY pageviews DESC LIMIT 20
  `)
})
