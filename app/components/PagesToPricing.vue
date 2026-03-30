<template>
  <div class="dash-card">
    <h2 class="dash-title">Pages Leading to Pricing</h2>
    <p class="dash-help">Which pages do visitors come from before reaching the Pricing page. Since pricing converts well organically, this shows what content drives people to check pricing.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!rows.length" title="No paths to pricing yet" description="This will show once visitors start navigating between pages and reaching the pricing page." />
    <div v-else>
      <div v-for="(r, i) in rows" :key="i" class="flex items-center gap-3" :style="{ padding: '12px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <span style="font-size: 14px; color: var(--dash-text-body); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ r.from || '/' }}</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost);">→ /pricing</span>
        <div class="hidden sm:block" style="width: 120px;">
          <div class="progress-track" style="height: 6px;"><div class="progress-fill" :style="{ width: r.pct + '%' }" /></div>
        </div>
        <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); min-width: 32px; text-align: right;" class="tabular-nums">{{ r.transitions }}</span>
        <span style="font-size: 14px; color: var(--dash-text-faint); min-width: 60px; text-align: right;" class="tabular-nums">{{ r.users }} users</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/pages-to-pricing?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() => {
  const results = (data.value as any)?.results ?? []
  const max = results[0]?.[1] || 1
  return results.map(([from, transitions, users]: [string, number, number]) => ({
    from, transitions, users, pct: Math.round((transitions / max) * 100),
  }))
})
</script>
