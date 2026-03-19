export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.webVitals
  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    SELECT avg(properties.$web_vitals_FCP_value) AS avg_fcp,
      avg(properties.$web_vitals_LCP_value) AS avg_lcp,
      avg(properties.$web_vitals_CLS_value) AS avg_cls,
      avg(properties.$web_vitals_INP_value) AS avg_inp,
      count() AS samples
    FROM events WHERE event = '$web_vitals' AND timestamp >= now() - INTERVAL ${days} DAY
  `)
})
