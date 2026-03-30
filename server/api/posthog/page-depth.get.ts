export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['pages_viewed', 'visitors', 'form_submitters', 'conversion_rate'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      page_count AS pages_viewed,
      count() AS visitors,
      countIf(converted = 1) AS form_submitters,
      least(round(countIf(converted = 1) * 100.0 / greatest(count(), 1), 1), 100) AS conversion_rate
    FROM (
      SELECT
        person_id,
        countIf(event = '$pageview') AS page_count,
        if(countIf(event = 'form_submitted') > 0, 1, 0) AS converted
      FROM events
      WHERE timestamp >= now() - INTERVAL ${days} DAY
        AND event IN ('$pageview', 'form_submitted')
      GROUP BY person_id
    )
    GROUP BY pages_viewed ORDER BY pages_viewed
  `)
})
