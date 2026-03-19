export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.trafficSources

  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      if(properties.nav_source IS NULL OR properties.nav_source = '', 'direct', properties.nav_source) AS nav_source,
      count() AS visits,
      count(DISTINCT person_id) AS users
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY nav_source
    ORDER BY visits DESC
    LIMIT 20
  `)
})
