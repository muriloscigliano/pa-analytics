export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.trafficSources
  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    SELECT properties.$referring_domain AS referrer, properties.visitor_type AS visitor_type,
      count() AS visits, count(DISTINCT person_id) AS users
    FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY referrer, visitor_type ORDER BY visits DESC LIMIT 20
  `)
})
