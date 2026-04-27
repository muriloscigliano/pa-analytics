export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['page', 'total', 'paid', 'organic', 'direct', 'other'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    WITH first_touch AS (
      SELECT
        person_id,
        if(replaceRegexpAll(argMin(properties.$pathname, timestamp), '/+$', '') = '', '/',
           replaceRegexpAll(argMin(properties.$pathname, timestamp), '/+$', '')) AS page,
        argMin(properties.$current_url, timestamp) AS landing_url,
        argMin(properties.$referring_domain, timestamp) AS ref
      FROM events
      WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
        AND properties.$pathname NOT LIKE '%.png'
        AND properties.$pathname NOT LIKE '%.jpg'
        AND properties.$pathname NOT LIKE '%.svg'
        AND person_id NOT IN (
          SELECT DISTINCT person_id FROM events
          WHERE event = 'login_clicked' AND timestamp >= now() - INTERVAL ${days} DAY
        )
      GROUP BY person_id
    ),
    classified AS (
      SELECT page,
        multiIf(
          landing_url LIKE '%gclid%' OR landing_url LIKE '%gad_source%' OR landing_url LIKE '%msclkid%', 'paid',
          ref LIKE '%google%' OR ref LIKE '%bing%' OR ref LIKE '%yahoo%' OR ref LIKE '%duckduckgo%', 'organic',
          ref = '$direct' OR ref = '' OR ref IS NULL, 'direct',
          'other'
        ) AS channel
      FROM first_touch
    )
    SELECT
      page,
      count() AS total,
      countIf(channel = 'paid') AS paid,
      countIf(channel = 'organic') AS organic,
      countIf(channel = 'direct') AS direct,
      countIf(channel = 'other') AS other
    FROM classified
    WHERE page != '/welcome' AND page != '/signup'
    GROUP BY page ORDER BY total DESC LIMIT 15
  `)
})
