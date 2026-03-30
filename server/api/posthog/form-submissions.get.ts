export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.formSubmissions

  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT
      properties.form_type AS form_type,
      replaceRegexpAll(properties.$pathname, '(.+)/+$', '\\1') AS page,
      count() AS submissions,
      count(DISTINCT person_id) AS users
    FROM events
    WHERE event = 'form_submitted'
      AND timestamp >= now() - INTERVAL ${days} DAY
      AND properties.$pathname NOT LIKE '%.png'
      AND properties.$pathname NOT LIKE '%.jpg'
      AND properties.$pathname NOT LIKE '%.svg'
      AND properties.$pathname NOT LIKE '%.webp'
      AND properties.$pathname NOT LIKE '%.pdf'
    GROUP BY form_type, page
    ORDER BY submissions DESC
    LIMIT 30
  `)
})
