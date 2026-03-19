export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.abComparison
  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    SELECT properties.ab_variant AS variant, event, count() AS total, count(DISTINCT person_id) AS users
    FROM events WHERE timestamp >= now() - INTERVAL ${days} DAY AND properties.ab_variant != ''
    GROUP BY variant, event ORDER BY variant, total DESC
  `)
})
