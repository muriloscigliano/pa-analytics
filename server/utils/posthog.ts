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

interface QueryResult { results: any[]; columns: string[] }

const CACHE_TTL_MS = 5 * 60 * 1000
const cache = new Map<string, { value: QueryResult; expires: number }>()
const inflight = new Map<string, Promise<QueryResult>>()

async function fetchPostHog(hogql: string): Promise<QueryResult> {
  const { apiKey, projectId, host } = getPostHogConfig()

  if (!apiKey || !projectId || apiKey === 'phx_your_key_here') {
    throw createError({ statusCode: 500, message: 'PostHog credentials not configured' })
  }

  return await $fetch<QueryResult>(`${host}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: { query: { kind: 'HogQLQuery', query: hogql } },
    retry: 2,
    retryDelay: 400,
  })
}

export async function queryPostHog(hogql: string): Promise<QueryResult> {
  const key = hogql
  const now = Date.now()

  const cached = cache.get(key)
  if (cached && cached.expires > now) return cached.value

  const existing = inflight.get(key)
  if (existing) return existing

  const promise = fetchPostHog(hogql)
    .then(value => {
      cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS })
      return value
    })
    .finally(() => inflight.delete(key))

  inflight.set(key, promise)
  return promise
}
