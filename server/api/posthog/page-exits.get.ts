export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.pageExits
  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    SELECT replaceRegexpAll(properties.$pathname, '/+$', '') AS page,
      count() AS exits,
      round(avg(properties.$prev_pageview_duration), 1) AS avg_duration_sec,
      count(DISTINCT person_id) AS users
    FROM events WHERE event = '$pageleave'
      AND timestamp >= now() - INTERVAL ${days} DAY
      AND properties.$pathname NOT LIKE '%.png'
      AND properties.$pathname NOT LIKE '%.jpg'
      AND properties.$pathname NOT LIKE '%.svg'
      AND properties.$pathname NOT LIKE '%.webp'
      AND properties.$pathname NOT LIKE '%.pdf'
    GROUP BY page ORDER BY exits DESC LIMIT 20
  `)
})
