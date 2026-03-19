export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.geo
  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    SELECT properties.$geoip_country_name AS country, properties.$geoip_city_name AS city,
      count() AS pageviews, count(DISTINCT person_id) AS users
    FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY country, city ORDER BY pageviews DESC LIMIT 20
  `)
})
