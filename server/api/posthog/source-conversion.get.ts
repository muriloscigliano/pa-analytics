export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  const days = Number(getQuery(event).days) || 30

  if (!isPostHogConfigured()) {
    return { columns: ['source', 'pageviews', 'conversions', 'users', 'conversion_rate', 'phone_calls'], results: [] }
  }

  return await queryPostHog(`
    SELECT
      if(properties.$referring_domain = '', 'Direct', properties.$referring_domain) AS source,
      countIf(event = '$pageview') AS pageviews,
      countIf(event = 'form_submitted') AS conversions,
      count(DISTINCT person_id) AS users,
      round(countIf(event = 'form_submitted') * 100.0 / greatest(countIf(event = '$pageview'), 1), 1) AS conversion_rate,
      countIf(event = 'phone_cta_clicked') AS phone_calls
    FROM events
    WHERE timestamp >= now() - INTERVAL ${days} DAY
      AND event IN ('$pageview', 'form_submitted', 'phone_cta_clicked')
      AND properties.$referring_domain NOT LIKE '%localhost%'
    GROUP BY source ORDER BY pageviews DESC LIMIT 15
  `)
})
