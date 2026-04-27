export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['channel', 'visitors', 'converters', 'rate'], results: [] }

  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    WITH first_touch AS (
      SELECT
        person_id,
        argMin(properties.$current_url, timestamp) AS landing_url,
        argMin(properties.$referring_domain, timestamp) AS ref
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= now() - INTERVAL ${days} DAY
        AND properties.$referring_domain NOT LIKE '%localhost%'
        AND person_id NOT IN (
          SELECT DISTINCT person_id FROM events
          WHERE event = 'login_clicked' AND timestamp >= now() - INTERVAL ${days} DAY
        )
      GROUP BY person_id
    ),
    classified AS (
      SELECT person_id,
        multiIf(
          landing_url LIKE '%gclid%' OR landing_url LIKE '%gad_source%' OR landing_url LIKE '%msclkid%', 'Paid Search',
          ref LIKE '%google%' OR ref LIKE '%bing%' OR ref LIKE '%yahoo%' OR ref LIKE '%duckduckgo%', 'Organic Search',
          ref LIKE '%facebook%' OR ref LIKE '%instagram%' OR ref LIKE '%linkedin%' OR ref LIKE '%twitter%' OR ref LIKE '%t.co%', 'Social',
          ref = '$direct' OR ref = '' OR ref IS NULL, 'Direct',
          ref LIKE '%payadvantage%', 'Internal',
          'Referral'
        ) AS channel
      FROM first_touch
    )
    SELECT
      channel,
      count() AS visitors,
      countIf(person_id IN (
        SELECT DISTINCT person_id FROM events
        WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
      )) AS converters,
      round(countIf(person_id IN (
        SELECT DISTINCT person_id FROM events
        WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
      )) * 100.0 / greatest(count(), 1), 1) AS rate
    FROM classified
    GROUP BY channel
    ORDER BY visitors DESC
  `)
})
