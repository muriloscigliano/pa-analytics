export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['avg_pages', 'median_pages', 'min_pages', 'max_pages', 'converters'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT round(avg(pv_count), 1) AS avg_pages, round(quantile(0.5)(pv_count), 0) AS median_pages,
      min(pv_count) AS min_pages, max(pv_count) AS max_pages, count() AS converters
    FROM (
      SELECT person_id, countIf(event = '$pageview') AS pv_count
      FROM events WHERE timestamp >= now() - INTERVAL ${days} DAY
        AND person_id IN (
          SELECT DISTINCT person_id FROM events
          WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
        )
      GROUP BY person_id
    )
  `)
})
