export default defineEventHandler(async (event) => {
  if (!isPostHogConfigured()) return { total: 0, users: 0, byPage: [], byDevice: [], bySource: [] }
  const days = Number(getQuery(event).days) || 30

  const [totals, byPage, byDevice, bySource] = await Promise.all([
    queryPostHog(`
      SELECT count() AS total, count(DISTINCT person_id) AS users
      FROM events WHERE event = 'phone_cta_clicked' AND timestamp >= now() - INTERVAL ${days} DAY
    `),
    queryPostHog(`
      SELECT
        if(replaceRegexpAll(properties.$pathname, '/+$', '') = '', '/', replaceRegexpAll(properties.$pathname, '/+$', '')) AS page,
        count() AS clicks, count(DISTINCT person_id) AS users
      FROM events WHERE event = 'phone_cta_clicked' AND timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY page ORDER BY clicks DESC LIMIT 10
    `),
    queryPostHog(`
      SELECT properties.$device_type AS device, count() AS clicks
      FROM events WHERE event = 'phone_cta_clicked' AND timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY device ORDER BY clicks DESC
    `),
    queryPostHog(`
      SELECT
        if(properties.$referring_domain = '' OR properties.$referring_domain = '$direct', 'Direct', properties.$referring_domain) AS source,
        count() AS clicks
      FROM events WHERE event = 'phone_cta_clicked' AND timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY source ORDER BY clicks DESC LIMIT 5
    `),
  ])

  const t = totals.results?.[0] || [0, 0]
  return {
    total: t[0],
    users: t[1],
    byPage: byPage.results.map(([page, clicks, users]: [string, number, number]) => ({ page, clicks, users })),
    byDevice: byDevice.results.map(([device, clicks]: [string, number]) => ({ device, clicks })),
    bySource: bySource.results.map(([source, clicks]: [string, number]) => ({ source, clicks })),
  }
})
