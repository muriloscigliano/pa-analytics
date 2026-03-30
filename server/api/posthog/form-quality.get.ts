export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['payment_use', 'has_promo', 'submissions', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT properties.payment_use AS payment_use, properties.has_promo_code AS has_promo,
      count() AS submissions, count(DISTINCT person_id) AS users
    FROM events WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY payment_use, has_promo ORDER BY submissions DESC
  `)
})
