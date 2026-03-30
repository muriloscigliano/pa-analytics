export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.scrollDepth
  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    SELECT replaceRegexpAll(properties.$prev_pageview_pathname, '(.+)/+$', '\\1') AS page,
      round(avg(properties.$prev_pageview_max_scroll_percentage) * 100, 1) AS avg_scroll_pct,
      round(avg(properties.$prev_pageview_duration), 1) AS avg_duration_sec,
      round(avg(properties.$prev_pageview_max_content_percentage) * 100, 1) AS avg_content_pct,
      count() AS samples
    FROM events WHERE event = '$pageview' AND properties.$prev_pageview_pathname != ''
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY page ORDER BY samples DESC LIMIT 20
  `)
})
