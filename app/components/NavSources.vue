<template>
  <div class="dash-card">
    <h2 class="dash-title">Navigation Sources</h2>
    <p class="dash-help">How visitors find each page — direct visits, internal navigation, or external referrals. Helps understand which pages get organic traffic vs internal navigation.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-for="(group, page) in grouped" :key="page" style="margin-bottom: 24px;">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px;">{{ page || '/' }}</p>
        <div>
          <div v-for="(src, i) in group" :key="i" class="flex flex-wrap items-center justify-between gap-1" :style="{ padding: '14px 0', borderBottom: i < group.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
            <span style="font-size: 14px; color: var(--dash-text-body);">{{ src.source === '$direct' ? 'Direct' : src.source }}</span>
            <div class="flex items-center gap-4">
              <span style="font-size: 14px; color: var(--dash-text-faint);">{{ src.users }} users</span>
              <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ src.visits }}</span>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-if="Object.keys(grouped).length === 0" title="Waiting for navigation data" description="Shows how visitors find each page — direct visits, internal links, or external referrals. Data will appear once visitors start browsing." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/nav-sources?days=${period.value}`, { watch: [period, refreshKey] })

const grouped = computed(() => {
  const results = (data.value as any)?.results ?? []
  const groups: Record<string, Array<{ source: string; visits: number; users: number }>> = {}
  for (const [page, source, visits, users] of results) {
    const key = page || '/'
    if (!groups[key]) groups[key] = []
    groups[key].push({ source, visits, users })
  }
  return groups
})
</script>
