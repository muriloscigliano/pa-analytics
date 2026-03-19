export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.navSources
  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    SELECT properties.$pathname AS page,
      properties.$referring_domain AS source,
      count() AS visits,
      count(DISTINCT person_id) AS users
    FROM events WHERE event = '$pageview'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY page, source ORDER BY page, visits DESC LIMIT 50
  `)
})
