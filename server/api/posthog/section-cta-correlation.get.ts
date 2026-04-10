export default defineEventHandler(async (event): Promise<{ results: any[]; columns: string[] }> => {
  if (!isPostHogConfigured()) return { columns: ['section', 'page', 'section_views', 'cta_clickers', 'form_submitters', 'cta_rate'], results: [] }
  const days = Number(getQuery(event).days) || 30

  // For each section: how many people viewed it, how many of those also clicked a CTA, how many submitted a form
  return await queryPostHog(`
    SELECT
      section,
      page,
      section_viewers,
      cta_clickers,
      form_submitters,
      least(round(cta_clickers * 100.0 / greatest(section_viewers, 1), 1), 100) AS cta_rate,
      least(round(form_submitters * 100.0 / greatest(section_viewers, 1), 1), 100) AS form_rate
    FROM (
      SELECT
        properties.section_name AS section,
        if(replaceRegexpAll(properties.page, '/+$', '') = '', '/',
          replaceRegexpAll(properties.page, '/+$', '')) AS page,
        count(DISTINCT person_id) AS section_viewers,
        uniqIf(person_id,
          person_id IN (
            SELECT DISTINCT person_id FROM events
            WHERE event IN ('header_cta_clicked', 'cta_clicked', 'welcome_cta_clicked', 'phone_cta_clicked')
              AND timestamp >= now() - INTERVAL ${days} DAY
          )
        ) AS cta_clickers,
        uniqIf(person_id,
          person_id IN (
            SELECT DISTINCT person_id FROM events
            WHERE event = 'form_submitted'
              AND timestamp >= now() - INTERVAL ${days} DAY
          )
        ) AS form_submitters
      FROM events
      WHERE event = 'section_viewed'
        AND timestamp >= now() - INTERVAL ${days} DAY
        AND properties.page != '/welcome'
        AND properties.page != '/welcome/'
        AND properties.page != '/signup'
        AND properties.page != '/signup/'
      GROUP BY section, page
    )
    ORDER BY form_submitters DESC, cta_clickers DESC, section_viewers DESC
    LIMIT 30
  `)
})
