<template>
  <div class="dash-card">
    <h2 class="dash-title">Traffic Sources</h2>
    <p class="dash-help">How visitors navigate to pages — desktop menu, mobile menu, or direct URL. Shows which navigation method drives the most visits.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="sources.length > 0">
        <div v-for="(s, i) in sources" :key="i" :style="{ padding: '14px 0', borderBottom: i < sources.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <div class="flex items-center justify-between" style="margin-bottom: 8px;">
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-body);">{{ formatSource(s.navSource) }}</span>
            <div class="flex items-center gap-4">
              <span style="font-size: 14px; color: var(--dash-text-faint);">{{ s.users }} users</span>
              <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ s.visits.toLocaleString() }}</span>
            </div>
          </div>
          <div class="progress-track"><div class="progress-fill" :style="{ width: s.pct + '%' }" /></div>
        </div>
      </div>
      <EmptyState v-else title="Waiting for navigation data" description="Traffic source breakdown (desktop menu, mobile menu, direct) will appear once the nav_source property starts being sent with pageview events." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/traffic-sources?days=${period.value}`, { watch: [period, refreshKey] })

function formatSource(source: string): string {
  const labels: Record<string, string> = {
    menu_desktop: 'Desktop Menu',
    menu_mobile: 'Mobile Menu',
    direct: 'Direct',
    header_cta: 'Header CTA',
  }
  return labels[source] || source
}

const sources = computed(() => {
  const r = (data.value as any)?.results ?? []
  const max = r[0]?.[1] || 1
  return r.map(([navSource, visits, users]: [string, number, number]) => ({
    navSource, visits, users, pct: Math.round((visits / max) * 100),
  }))
})
</script>
