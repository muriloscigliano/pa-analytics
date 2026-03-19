export default defineEventHandler(async (event) => {
  if (!isPostHogConfigured()) return MOCK.funnel

  const days = Number(getQuery(event).days) || 30
  const { apiKey, projectId, host } = getPostHogConfig()
  const response = await $fetch<any>(`${host}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: {
      query: {
        kind: 'FunnelsQuery',
        series: [
          { kind: 'EventsNode', event: '$pageview', custom_name: 'Page View' },
          { kind: 'EventsNode', event: 'form_submitted', custom_name: 'Form Submitted' },
          { kind: 'EventsNode', event: 'signup_completed_server', custom_name: 'Signup Completed' },
        ],
        dateRange: { date_from: `-${days}d` },
        funnelsFilter: { funnelWindowInterval: 14, funnelWindowIntervalUnit: 'day' },
      },
    },
  })
  return response.results ?? response
})
