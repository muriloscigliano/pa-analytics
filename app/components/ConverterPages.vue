<template>
  <div class="dash-card">
    <h2 class="dash-title">Top Pages for 3-5 Page Converters</h2>
    <p class="dash-help">Which pages do your best converters visit? These are the pages viewed by visitors who browsed 3-5 pages and submitted a form — your highest-converting segment.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!rows.length" title="Not enough converter data" description="This section needs visitors who view 3-5 pages and submit a form. More conversion data is needed." />
    <div v-else>
      <div v-for="(r, i) in rows" :key="i" class="flex items-center gap-3" :style="{ padding: '12px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <span style="font-size: 14px; color: var(--dash-text-ghost); min-width: 24px;" class="tabular-nums">{{ i + 1 }}</span>
        <span style="font-size: 14px; color: var(--dash-text-body); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ r.page || '/' }}</span>
        <div class="hidden sm:block" style="width: 140px;">
          <div class="progress-track" style="height: 6px;"><div class="progress-fill" :style="{ width: r.pct + '%' }" /></div>
        </div>
        <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); min-width: 40px; text-align: right;" class="tabular-nums">{{ r.views }}</span>
        <span style="font-size: 14px; color: var(--dash-text-faint); min-width: 70px; text-align: right;" class="tabular-nums">{{ r.converters }} people</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/converter-pages?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() => {
  const results = (data.value as any)?.results ?? []
  const max = results[0]?.[1] || 1
  return results.map(([page, views, converters]: [string, number, number]) => ({
    page, views, converters, pct: Math.round((views / max) * 100),
  }))
})
</script>
