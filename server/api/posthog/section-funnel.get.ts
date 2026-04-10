export default defineEventHandler(async (event) => {
  if (!isPostHogConfigured()) return { columns: ['step', 'users'], results: [] }
  const days = Number(getQuery(event).days) || 30

  const [funnel, paths] = await Promise.all([
    queryPostHog(`
      SELECT step, users FROM (
        SELECT 1 AS pos, 'Section Viewed' AS step,
          count(DISTINCT person_id) AS users
        FROM events WHERE event = 'section_viewed' AND timestamp >= now() - INTERVAL ${days} DAY
        UNION ALL
        SELECT 2 AS pos, 'Header CTA Clicked' AS step,
          count(DISTINCT person_id) AS users
        FROM events WHERE event IN ('header_cta_clicked', 'welcome_cta_clicked', 'cta_clicked', 'phone_cta_clicked')
          AND timestamp >= now() - INTERVAL ${days} DAY
        UNION ALL
        SELECT 3 AS pos, 'Form Submitted' AS step,
          count(DISTINCT person_id) AS users
        FROM events WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
      )
      ORDER BY pos
    `),
    queryPostHog(`
      SELECT
        count(DISTINCT person_id) AS total_submitters,
        uniqIf(person_id, person_id IN (
          SELECT DISTINCT person_id FROM events
          WHERE event = 'section_viewed' AND timestamp >= now() - INTERVAL ${days} DAY
        ) AND person_id IN (
          SELECT DISTINCT person_id FROM events
          WHERE event IN ('header_cta_clicked', 'welcome_cta_clicked', 'cta_clicked', 'phone_cta_clicked') AND timestamp >= now() - INTERVAL ${days} DAY
        )) AS section_and_cta,
        uniqIf(person_id, person_id IN (
          SELECT DISTINCT person_id FROM events
          WHERE event = 'section_viewed' AND timestamp >= now() - INTERVAL ${days} DAY
        ) AND person_id NOT IN (
          SELECT DISTINCT person_id FROM events
          WHERE event IN ('header_cta_clicked', 'welcome_cta_clicked', 'cta_clicked', 'phone_cta_clicked') AND timestamp >= now() - INTERVAL ${days} DAY
        )) AS section_only,
        uniqIf(person_id, person_id NOT IN (
          SELECT DISTINCT person_id FROM events
          WHERE event = 'section_viewed' AND timestamp >= now() - INTERVAL ${days} DAY
        ) AND person_id IN (
          SELECT DISTINCT person_id FROM events
          WHERE event IN ('header_cta_clicked', 'welcome_cta_clicked', 'cta_clicked', 'phone_cta_clicked') AND timestamp >= now() - INTERVAL ${days} DAY
        )) AS cta_only,
        uniqIf(person_id, person_id NOT IN (
          SELECT DISTINCT person_id FROM events
          WHERE event = 'section_viewed' AND timestamp >= now() - INTERVAL ${days} DAY
        ) AND person_id NOT IN (
          SELECT DISTINCT person_id FROM events
          WHERE event IN ('header_cta_clicked', 'welcome_cta_clicked', 'cta_clicked', 'phone_cta_clicked') AND timestamp >= now() - INTERVAL ${days} DAY
        )) AS direct_submit
      FROM events WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
    `),
  ])

  const p = paths.results?.[0] || [0, 0, 0, 0, 0]
  return {
    ...funnel,
    submitterPaths: {
      total: p[0],
      sectionAndCta: p[1],
      sectionOnly: p[2],
      ctaOnly: p[3],
      direct: p[4],
    },
  }
})
