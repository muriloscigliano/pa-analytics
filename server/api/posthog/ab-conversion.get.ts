export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['variant', 'visitors', 'form_submitters', 'submissions', 'conversion_rate'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      if(properties.ab_variant IS NULL OR properties.ab_variant = '', 'none', properties.ab_variant) AS variant,
      uniqIf(person_id, event = '$pageview') AS visitors,
      uniqIf(person_id, event = 'form_submitted') AS form_submitters,
      countIf(event = 'form_submitted') AS submissions,
      least(round(uniqIf(person_id, event = 'form_submitted') * 100.0 / greatest(uniqIf(person_id, event = '$pageview'), 1), 1), 100) AS conversion_rate
    FROM events
    WHERE timestamp >= now() - INTERVAL ${days} DAY
      AND event IN ('$pageview', 'form_submitted')
    GROUP BY variant ORDER BY visitors DESC
  `)
})
