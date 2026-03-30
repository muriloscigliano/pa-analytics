export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['menu_name', 'menu_type', 'opens', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT properties.menu_name AS menu_name, properties.menu_type AS menu_type,
      count() AS opens, count(DISTINCT person_id) AS users
    FROM events WHERE event = 'menu_opened' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY menu_name, menu_type ORDER BY opens DESC
  `)
})
