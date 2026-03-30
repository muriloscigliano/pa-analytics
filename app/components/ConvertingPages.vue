<template>
  <div class="dash-card">
    <h2 class="dash-title">Pages in Converting Sessions</h2>
    <p class="dash-help">Pages viewed by visitors who eventually submitted a form. Shows which content appears in successful conversion journeys.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="rows.length > 0">
        <div v-for="(row, i) in rows" :key="i" :style="{ padding: '14px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <div class="flex flex-wrap items-center justify-between gap-1 mb-2">
            <span style="font-size: 14px; color: var(--dash-text-body);">{{ row.page || '/' }}</span>
            <div class="flex items-center gap-4">
              <span style="font-size: 14px; color: var(--dash-text-faint);">{{ row.users }} users</span>
              <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.views }}</span>
            </div>
          </div>
          <div class="progress-track" style="height: 4px;">
            <div class="progress-fill" :style="{ width: row.pct + '%' }" />
          </div>
        </div>
      </div>
      <EmptyState v-else title="Waiting for conversion data" description="Converting session pages will appear once form_submitted events start flowing." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/converting-pages?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() => {
  const results = (data.value as any)?.results ?? []
  const max = results[0]?.[1] || 1
  return results.map(([page, views, users]: [string, number, number]) => ({
    page, views, users,
    pct: Math.round((views / max) * 100),
  }))
})
</script>
