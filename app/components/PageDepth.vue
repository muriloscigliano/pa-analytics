<template>
  <div class="dash-card">
    <h2 class="dash-title">Page Depth & Conversion</h2>
    <p class="dash-help">How many pages visitors view per session and how that correlates with conversion. Do people who browse more pages convert at a higher rate?</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!rows.length" title="Waiting for depth data" description="Page depth data will appear once pageview events start flowing." />
    <div v-else>
      <!-- Header -->
      <div class="hidden sm:flex items-center" style="padding: 0 0 10px; border-bottom: 1px solid var(--dash-border-row); margin-bottom: 4px;">
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 100px;">Pages</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); flex: 1;">Distribution</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 80px; text-align: right;">Visitors</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 90px; text-align: right;">Converted</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 80px; text-align: right;">Rate</span>
      </div>
      <div v-for="(r, i) in rows" :key="i" :style="{ borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <!-- Desktop -->
        <div class="hidden sm:flex items-center" style="padding: 10px 0;">
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); width: 100px;" class="tabular-nums">{{ r.label }}</span>
          <div style="flex: 1; padding-right: 12px;">
            <div class="progress-track" style="height: 8px;"><div class="progress-fill" :style="{ width: r.pct + '%' }" /></div>
          </div>
          <span style="font-size: 14px; color: var(--dash-text-body); width: 80px; text-align: right;" class="tabular-nums">{{ r.visitors }}</span>
          <span style="font-size: 14px; color: var(--dash-text-body); width: 90px; text-align: right;" class="tabular-nums">{{ r.submitters }}</span>
          <span :style="{ fontSize: '14px', fontWeight: 600, color: r.rate > 0 ? '#C4343A' : 'var(--dash-text-ghost)', width: '80px', textAlign: 'right' }" class="tabular-nums">{{ r.rate }}%</span>
        </div>
        <!-- Mobile -->
        <div class="sm:hidden" style="padding: 10px 0;">
          <div class="flex items-center justify-between mb-1">
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ r.label }}</span>
            <span :style="{ fontSize: '14px', fontWeight: 600, color: r.rate > 0 ? '#C4343A' : 'var(--dash-text-ghost)' }" class="tabular-nums">{{ r.rate }}% conv.</span>
          </div>
          <div class="progress-track mb-2" style="height: 6px;"><div class="progress-fill" :style="{ width: r.pct + '%' }" /></div>
          <div class="flex items-center gap-4" style="font-size: 14px; color: var(--dash-text-faint);">
            <span class="tabular-nums">{{ r.visitors }} visitors</span>
            <span class="tabular-nums">{{ r.submitters }} converted</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/page-depth?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() => {
  const results = (data.value as any)?.results ?? []
  const max = Math.max(...results.map((r: any[]) => r[1]), 1)
  return results.map(([pages, visitors, submitters, rate]: [number, number, number, number]) => ({
    label: pages >= 10 ? '10+' : `${pages} page${pages !== 1 ? 's' : ''}`,
    visitors, submitters, rate,
    pct: Math.round((visitors / max) * 100),
  }))
})
</script>
