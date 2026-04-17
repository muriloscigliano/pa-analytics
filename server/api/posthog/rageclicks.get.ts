export default defineEventHandler(async (event): Promise<{ total: number; users: number; byPage: any[] }> => {
  if (!isPostHogConfigured()) return { total: 0, users: 0, byPage: [] }
  const days = Number(getQuery(event).days) || 30
  const byPage = await queryPostHog(`
    SELECT
      properties.$pathname AS page,
      count() AS clicks,
      count(DISTINCT person_id) AS users
    FROM events
    WHERE event = '$rageclick'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY page
    ORDER BY clicks DESC
    LIMIT 10
  `)
  const totals = await queryPostHog(`
    SELECT count() AS total, count(DISTINCT person_id) AS users
    FROM events
    WHERE event = '$rageclick'
      AND timestamp >= now() - INTERVAL ${days} DAY
  `)
  const [total = 0, users = 0] = totals.results?.[0] ?? []
  return { total, users, byPage: byPage.results ?? [] }
})
