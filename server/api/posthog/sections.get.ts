export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return MOCK.sections
  const days = Number(getQuery(event).days) || 30

  return await queryPostHog(`
    SELECT properties.section_name AS section, replaceRegexpAll(properties.page, '(.+)/+$', '\\1') AS page, count() AS views, count(DISTINCT person_id) AS unique_users
    FROM events WHERE event = 'section_viewed' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY section, page ORDER BY views DESC LIMIT 50
  `)
})
