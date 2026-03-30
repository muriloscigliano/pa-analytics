<template>
  <div class="dash-card">
    <h2 class="dash-title">CTA Clicks by Page</h2>
    <p class="dash-help">Which pages generate the most CTA engagement. Higher clicks = content that motivates action.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="rows.length > 0">
        <div v-for="(row, i) in rows" :key="i" :style="{ padding: '14px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <div class="flex flex-wrap items-center justify-between gap-1 mb-2">
            <span style="font-size: 14px; color: var(--dash-text-body);">{{ row.page || '/' }}</span>
            <div class="flex items-center gap-4">
              <span style="font-size: 14px; color: var(--dash-text-faint);">{{ row.signup_clicks }} signups</span>
              <span style="font-size: 14px; color: var(--dash-text-faint);">{{ row.users }} users</span>
              <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.clicks }}</span>
            </div>
          </div>
          <div class="progress-track" style="height: 4px;">
            <div class="progress-fill" :style="{ width: row.pct + '%' }" />
          </div>
        </div>
      </div>
      <EmptyState v-else title="Waiting for CTA data" description="Page-level CTA performance will appear once cta_clicked events start flowing." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/cta-by-location?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() => {
  const results = (data.value as any)?.results ?? []
  const max = results[0]?.[1] || 1
  return results.map(([page, clicks, signup_clicks, users]: [string, number, number, number]) => ({
    page, clicks, signup_clicks, users,
    pct: Math.round((clicks / max) * 100),
  }))
})
</script>
