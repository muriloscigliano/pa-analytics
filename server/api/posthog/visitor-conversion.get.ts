export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['visitor_type', 'visitors', 'form_submitters', 'submissions', 'conversion_rate'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      if(properties.visitor_type IS NULL OR properties.visitor_type = '', 'unknown', properties.visitor_type) AS visitor_type,
      uniqIf(person_id, event = '$pageview') AS visitors,
      uniqIf(person_id, event = 'form_submitted') AS form_submitters,
      countIf(event = 'form_submitted') AS submissions,
      least(round(uniqIf(person_id, event = 'form_submitted') * 100.0 / greatest(uniqIf(person_id, event = '$pageview'), 1), 1), 100) AS conversion_rate
    FROM events
    WHERE timestamp >= now() - INTERVAL ${days} DAY
      AND event IN ('$pageview', 'form_submitted')
    GROUP BY visitor_type ORDER BY visitors DESC
  `)
})
