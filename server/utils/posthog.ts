export function getPostHogConfig() {
  const config = useRuntimeConfig()
  return {
    apiKey: config.posthogPersonalApiKey as string,
    projectId: config.posthogProjectId as string,
    host: config.posthogHost as string,
  }
}

export function isPostHogConfigured(): boolean {
  const { apiKey, projectId } = getPostHogConfig()
  return !!(apiKey && projectId && apiKey !== 'phx_your_key_here')
}

export async function queryPostHog(hogql: string): Promise<{ results: any[]; columns: string[] }> {
  const { apiKey, projectId, host } = getPostHogConfig()

  if (!apiKey || !projectId || apiKey === 'phx_your_key_here') {
    throw createError({ statusCode: 500, message: 'PostHog credentials not configured' })
  }

  const response = await $fetch<any>(`${host}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: {
      query: {
        kind: 'HogQLQuery',
        query: hogql,
      },
    },
  })

  return response
}
