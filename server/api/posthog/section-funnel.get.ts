export default defineEventHandler(async (event) => {
  if (!isPostHogConfigured()) return []
  const days = Number(getQuery(event).days) || 30
  const { apiKey, projectId, host } = getPostHogConfig()
  const response = await $fetch<any>(`${host}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: {
      query: {
        kind: 'FunnelsQuery',
        series: [
          { kind: 'EventsNode', event: 'section_viewed', custom_name: 'Section Viewed' },
          { kind: 'EventsNode', event: 'header_cta_clicked', custom_name: 'CTA Clicked' },
          { kind: 'EventsNode', event: 'form_submitted', custom_name: 'Form Submitted' },
        ],
        dateRange: { date_from: `-${days}d` },
        funnelsFilter: { funnelWindowInterval: 14, funnelWindowIntervalUnit: 'day' },
      },
    },
  })
  return response.results ?? response
})
