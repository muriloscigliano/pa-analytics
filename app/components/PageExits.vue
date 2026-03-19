<template>
  <div class="dash-card">
    <h2 class="dash-title">Page Exits</h2>
    <p class="dash-help">Where visitors leave your site. High exit counts on key pages may indicate problems. Duration shows how long they stayed before leaving.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-for="(row, i) in rows" :key="i" class="flex flex-wrap items-center justify-between gap-2" :style="{ padding: '14px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <div class="flex items-center gap-3">
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); min-width: 40px;" class="tabular-nums">{{ i + 1 }}</span>
          <span style="font-size: 14px; color: var(--dash-text-body);">{{ row.page || '/' }}</span>
        </div>
        <div class="flex items-center gap-3 sm:gap-6 flex-wrap">
          <div class="text-right">
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.exits }}</span>
            <span style="font-size: 14px; color: var(--dash-text-ghost); margin-left: 4px;">exits</span>
          </div>
          <div class="text-right">
            <span style="font-size: 14px; color: var(--dash-text-body);" class="tabular-nums">{{ formatDuration(row.avgDuration) }}</span>
            <span style="font-size: 14px; color: var(--dash-text-ghost); margin-left: 4px;">avg</span>
          </div>
          <span style="font-size: 14px; color: var(--dash-text-faint);">{{ row.users }} users</span>
        </div>
      </div>
      <EmptyState v-if="rows.length === 0" title="Waiting for exit data" description="Page exit tracking shows where visitors leave and how long they stayed. Data will appear once visitors start browsing and leaving pages." />
    </div>
  </div>
</template>

<script setup lang="ts">
const period = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/page-exits?days=${period.value}`, { watch: [period] })

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}m ${secs}s`
}

const rows = computed(() =>
  ((data.value as any)?.results ?? []).map(([page, exits, avgDuration, users]: [string, number, number, number]) => ({
    page, exits, avgDuration, users,
  }))
)
</script>
