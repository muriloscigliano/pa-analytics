export default defineEventHandler(async (event) => {
  if (!isPostHogConfigured()) return { journeys: [], summary: {} }
  const days = Number(getQuery(event).days) || 30

  // Get all events for converters, ordered by person and time
  const data = await queryPostHog(`
    SELECT
      person_id,
      event,
      if(replaceRegexpAll(
        if(event = '$pageview', properties.$pathname,
          if(event = 'section_viewed', properties.page, properties.$pathname)
        ), '/+$', '') = '', '/',
        replaceRegexpAll(
        if(event = '$pageview', properties.$pathname,
          if(event = 'section_viewed', properties.page, properties.$pathname)
        ), '/+$', '')
      ) AS page,
      if(event = 'section_viewed', properties.section_name, '') AS section_name,
      if(event = 'form_submitted', properties.form_type, '') AS form_type,
      timestamp
    FROM events
    WHERE timestamp >= now() - INTERVAL ${days} DAY
      AND event IN ('$pageview', 'section_viewed', 'form_submitted')
      AND person_id IN (
        SELECT DISTINCT person_id FROM events
        WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY
      )
    ORDER BY person_id, timestamp
    LIMIT 5000
  `)

  // Process into journeys per person
  const personEvents: Record<string, Array<{ event: string; page: string; section: string; formType: string }>> = {}
  for (const [personId, evt, page, section, formType] of data.results) {
    if (!personEvents[personId]) personEvents[personId] = []
    personEvents[personId].push({ event: evt, page: page || '/', section, formType })
  }

  // Build journey summaries
  const journeys = Object.entries(personEvents).map(([personId, events]) => {
    const steps: Array<{ page: string; sections: string[]; action?: string }> = []
    let currentPage = ''
    let currentSections: string[] = []

    for (const e of events) {
      if (e.event === '$pageview') {
        if (currentPage) {
          steps.push({ page: currentPage, sections: [...currentSections] })
        }
        currentPage = e.page
        currentSections = []
      } else if (e.event === 'section_viewed') {
        if (!currentSections.includes(e.section)) {
          currentSections.push(e.section)
        }
      } else if (e.event === 'form_submitted') {
        if (currentPage) {
          steps.push({ page: currentPage, sections: [...currentSections], action: `form: ${e.formType}` })
        }
        currentPage = ''
        currentSections = []
      }
    }
    if (currentPage) {
      steps.push({ page: currentPage, sections: [...currentSections] })
    }

    return { personId, steps }
  })

  // Aggregate: which pages appear most in converter journeys + which sections on each page
  const pageSectionCounts: Record<string, Record<string, number>> = {}
  const pageOrder: Record<string, number[]> = {}

  for (const j of journeys) {
    j.steps.forEach((step, i) => {
      if (!pageSectionCounts[step.page]) pageSectionCounts[step.page] = {}
      if (!pageOrder[step.page]) pageOrder[step.page] = []
      pageOrder[step.page].push(i)
      for (const s of step.sections) {
        pageSectionCounts[step.page][s] = (pageSectionCounts[step.page][s] || 0) + 1
      }
    })
  }

  // Build summary: pages sorted by avg position in journey, with top sections
  const summary = Object.entries(pageSectionCounts)
    .map(([page, sections]) => ({
      page,
      avgPosition: pageOrder[page].reduce((a, b) => a + b, 0) / pageOrder[page].length,
      appearances: pageOrder[page].length,
      sections: Object.entries(sections)
        .sort(([, a], [, b]) => b - a)
        .map(([name, count]) => ({ name, count })),
    }))
    .sort((a, b) => a.avgPosition - b.avgPosition)

  return {
    totalConverters: journeys.length,
    avgSteps: journeys.length > 0
      ? Math.round((journeys.reduce((s, j) => s + j.steps.length, 0) / journeys.length) * 10) / 10
      : 0,
    summary,
    // Include up to 10 sample journeys for display
    sampleJourneys: journeys.slice(0, 10).map(j => j.steps),
  }
})
