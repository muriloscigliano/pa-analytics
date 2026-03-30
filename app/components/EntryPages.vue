<template>
  <div class="dash-card">
    <h2 class="dash-title">Entry Pages</h2>
    <p class="dash-help">The first page each visitor sees when they arrive on your site. Shows where people land — useful for understanding which pages attract new traffic vs internal navigation.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!rows.length" title="Waiting for entry data" description="Entry page data will appear once pageview events start flowing." />
    <div v-else>
      <div v-for="(r, i) in rows" :key="i" class="flex items-center gap-3" :style="{ padding: '12px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <span style="font-size: 14px; color: var(--dash-text-body); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ r.page || '/' }}</span>
        <div class="hidden sm:block" style="width: 160px;">
          <div class="progress-track" style="height: 6px;"><div class="progress-fill" :style="{ width: r.pct + '%' }" /></div>
        </div>
        <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); min-width: 40px; text-align: right;" class="tabular-nums">{{ r.entries }}</span>
        <span style="font-size: 14px; color: var(--dash-text-faint); min-width: 70px; text-align: right;" class="tabular-nums">{{ r.users }} people</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/entry-pages?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() => {
  const results = (data.value as any)?.results ?? []
  const max = results[0]?.[1] || 1
  return results.map(([page, entries, users]: [string, number, number]) => ({
    page, entries, users, pct: Math.round((entries / max) * 100),
  }))
})
</script>
