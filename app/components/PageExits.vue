<template>
  <div class="dash-card">
    <h2 class="dash-title">Page Exits</h2>
    <p class="dash-help">Where visitors leave your site. High exit counts on key pages may indicate problems. Duration shows how long they stayed before leaving.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <EmptyState v-if="rows.length === 0" title="Waiting for exit data" description="Page exit tracking shows where visitors leave and how long they stayed. Data will appear once visitors start browsing and leaving pages." />
      <div v-else>
        <!-- Header -->
        <div class="hidden sm:flex items-center" style="padding: 0 0 10px; border-bottom: 1px solid var(--dash-border-row); margin-bottom: 4px;">
          <span style="font-size: 14px; color: var(--dash-text-ghost); flex: 1;">Page</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 80px; text-align: right;">Exits</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 110px; text-align: right;">Avg Duration</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 80px; text-align: right;">Users</span>
        </div>
        <!-- Rows -->
        <div v-for="(row, i) in rows" :key="i" :style="{ borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <!-- Desktop -->
          <div class="hidden sm:flex items-center" style="padding: 12px 0;">
            <span style="font-size: 14px; color: var(--dash-text-body); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ row.page || '/' }}</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); width: 80px; text-align: right;" class="tabular-nums">{{ row.exits }}</span>
            <span style="font-size: 14px; color: var(--dash-text-body); width: 110px; text-align: right;" class="tabular-nums">{{ formatDuration(row.avgDuration) }}</span>
            <span style="font-size: 14px; color: var(--dash-text-faint); width: 80px; text-align: right;" class="tabular-nums">{{ row.users }}</span>
          </div>
          <!-- Mobile -->
          <div class="sm:hidden" style="padding: 12px 0;">
            <p style="font-size: 14px; color: var(--dash-text-body); margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ row.page || '/' }}</p>
            <div class="flex items-center gap-4" style="font-size: 14px; color: var(--dash-text-faint);">
              <span><span style="font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.exits }}</span> exits</span>
              <span class="tabular-nums">{{ formatDuration(row.avgDuration) }} avg</span>
              <span class="tabular-nums">{{ row.users }} users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/page-exits?days=${period.value}`, { watch: [period, refreshKey] })

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
