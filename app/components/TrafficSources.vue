<template>
  <div class="dash-card">
    <h2 class="dash-title">Traffic Sources</h2>
    <p class="dash-help">Where visitors come from. "Direct" means they typed the URL or used a bookmark. Other entries show the referring website.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else class="space-y-3">
      <div v-for="(s, i) in sources" :key="i">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <span style="font-size: 14px; color: var(--dash-text-body);">{{ s.referrer === '$direct' ? 'Direct' : s.referrer }}</span>
            <span class="pill pill-neutral">{{ s.visitorType }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span style="font-size: 14px; color: var(--dash-text-faint);">{{ s.users }} users</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ s.visits }}</span>
          </div>
        </div>
        <div class="progress-track"><div class="progress-fill" :style="{ width: s.pct + '%' }" /></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const period = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/traffic-sources?days=${period.value}`, { watch: [period] })
const sources = computed(() => {
  const r = (data.value as any)?.results ?? []; const max = r[0]?.[2] || 1
  return r.map(([referrer, visitorType, visits, users]: [string, string, number, number]) => ({ referrer, visitorType, visits, users, pct: Math.round((visits / max) * 100) }))
})
</script>
