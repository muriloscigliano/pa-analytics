export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.visitorTypes
  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    SELECT properties.visitor_type AS visitor_type, count() AS pageviews, count(DISTINCT person_id) AS users,
      countIf(event = '$autocapture') AS clicks, countIf(event = 'section_viewed') AS sections_viewed
    FROM events WHERE timestamp >= now() - INTERVAL ${days} DAY AND event IN ('$pageview', '$autocapture', 'section_viewed')
    GROUP BY visitor_type ORDER BY pageviews DESC
  `)
})
