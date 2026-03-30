export default defineEventHandler(async (event) => {
  if (!isPostHogConfigured()) return MOCK.topPages

  const query = getQuery(event)
  const days = Number(query.days) || 7
  const limit = Number(query.limit) || 10
  return await queryPostHog(`
    SELECT replaceRegexpAll(properties.$current_url, '/+$', '') AS url, count() AS views, count(DISTINCT person_id) AS unique_visitors
    FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
      AND properties.$current_url NOT LIKE '%.png'
      AND properties.$current_url NOT LIKE '%.jpg'
      AND properties.$current_url NOT LIKE '%.svg'
      AND properties.$current_url NOT LIKE '%.webp'
      AND properties.$current_url NOT LIKE '%.pdf'
    GROUP BY url ORDER BY views DESC LIMIT ${limit}
  `)
})
