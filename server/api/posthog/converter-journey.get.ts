export default defineEventHandler(async (event) => {
  if (!isPostHogConfigured()) return { positions: [], sections: {}, totalConverters: 0, avgSteps: 0 }
  const days = Number(getQuery(event).days) || 30

  const [journeyData, sectionsData, totalData, formData] = await Promise.all([
    // Get page sequence per converter (deduped consecutive same pages)
    queryPostHog(`
      SELECT person_id,
        groupArray(
          if(replaceRegexpAll(properties.$pathname, '/+$', '') = '', '/',
            replaceRegexpAll(properties.$pathname, '/+$', ''))
        ) AS pages
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= now() - INTERVAL ${days} DAY
        AND properties.$pathname != '/welcome'
        AND properties.$pathname != '/signup'
        AND properties.$pathname NOT LIKE '%.png'
        AND person_id IN (
          SELECT DISTINCT person_id FROM events
          WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
        )
      GROUP BY person_id
    `),

    // Sections viewed by converters per page
    queryPostHog(`
      SELECT
        if(replaceRegexpAll(properties.page, '/+$', '') = '', '/',
          replaceRegexpAll(properties.page, '/+$', '')) AS page,
        properties.section_name AS section,
        count() AS views
      FROM events
      WHERE event = 'section_viewed'
        AND timestamp >= now() - INTERVAL ${days} DAY
        AND properties.page != '/welcome'
        AND properties.page != '/signup'
        AND person_id IN (
          SELECT DISTINCT person_id FROM events
          WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
        )
      GROUP BY page, section ORDER BY page, views DESC
    `),

    // Total converters
    queryPostHog(`
      SELECT count(DISTINCT person_id) AS total
      FROM events WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
    `),

    // Where forms were submitted (page + form type)
    queryPostHog(`
      SELECT
        if(replaceRegexpAll(properties.$pathname, '/+$', '') = '', '/',
          replaceRegexpAll(properties.$pathname, '/+$', '')) AS page,
        properties.form_type AS form_type,
        count() AS submissions,
        count(DISTINCT person_id) AS users
      FROM events
      WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY page, form_type ORDER BY submissions DESC
    `),
  ])

  // Use raw page sequences (matches Page Depth counting)
  const journeys: string[][] = journeyData.results.map(([, pages]: [string, string[]]) => pages)

  // Build position data: which pages appear at position 1, 2, 3, etc.
  const maxSteps = Math.min(Math.max(...journeys.map(j => j.length)), 6)
  const positions: Array<{ position: number; pages: Array<{ page: string; count: number; pct: number }> }> = []

  for (let pos = 0; pos < maxSteps; pos++) {
    const pageCounts: Record<string, number> = {}
    let totalAtPosition = 0
    for (const j of journeys) {
      if (j.length > pos) {
        pageCounts[j[pos]] = (pageCounts[j[pos]] || 0) + 1
        totalAtPosition++
      }
    }
    positions.push({
      position: pos + 1,
      pages: Object.entries(pageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([page, count]) => ({
          page,
          count,
          pct: Math.round((count / totalAtPosition) * 100),
        })),
    })
  }

  // Build sections map
  const sections: Record<string, Array<{ name: string; count: number }>> = {}
  for (const [page, section, views] of sectionsData.results) {
    if (!sections[page]) sections[page] = []
    sections[page].push({ name: section, count: views })
  }

  // Build form submission breakdown
  const formSubmissions = formData.results.map(([page, formType, submissions, users]: [string, string, number, number]) => ({
    page, formType, submissions, users,
  }))

  const totalConverters = totalData.results?.[0]?.[0] ?? 0
  const avgSteps = journeys.length > 0
    ? Math.round((journeys.reduce((s, j) => s + j.length, 0) / journeys.length) * 10) / 10
    : 0

  return { positions, sections, totalConverters, avgSteps, formSubmissions }
})
