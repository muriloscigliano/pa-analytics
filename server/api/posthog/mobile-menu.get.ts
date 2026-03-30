export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['day', 'action', 'toggles'], results: [] }
  const days = Number(getQuery(event).days) || 30
  return await queryPostHog(`
    SELECT toDate(timestamp) AS day, properties.action AS action, count() AS toggles
    FROM events WHERE event = 'mobile_menu_toggled' AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY day, action ORDER BY day
  `)
})
