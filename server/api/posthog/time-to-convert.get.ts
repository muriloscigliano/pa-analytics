export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  const days = Number(getQuery(event).days) || 30

  if (!isPostHogConfigured()) {
    return { columns: ['avg_minutes', 'median_minutes', 'min_minutes', 'max_minutes', 'converters'], results: [] }
  }

  return await queryPostHog(`
    SELECT
      round(avg(minutes_to_convert), 1) AS avg_minutes,
      round(quantile(0.5)(minutes_to_convert), 1) AS median_minutes,
      round(min(minutes_to_convert), 1) AS min_minutes,
      round(max(minutes_to_convert), 1) AS max_minutes,
      count() AS converters
    FROM (
      SELECT
        person_id,
        dateDiff('minute', min(timestamp), minIf(timestamp, event = 'form_submitted')) AS minutes_to_convert
      FROM events
      WHERE timestamp >= now() - INTERVAL ${days} DAY
        AND event IN ('$pageview', 'form_submitted')
      GROUP BY person_id
      HAVING minIf(timestamp, event = 'form_submitted') IS NOT NULL
    )
  `)
})
