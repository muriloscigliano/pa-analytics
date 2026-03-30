<template>
  <div class="dash-card">
    <h2 class="dash-title">Landing Page Conversions</h2>
    <p class="dash-help">Which landing pages produce the most signups. Shows where converting visitors first arrive on the site.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="rows.length > 0">
        <div v-for="(row, i) in rows" :key="i" :style="{ padding: '14px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <div class="flex flex-wrap items-center justify-between gap-1 mb-2">
            <span style="font-size: 14px; color: var(--dash-text-body);">{{ row.landing_page || '/' }}</span>
            <div class="flex items-center gap-4">
              <span style="font-size: 14px; color: var(--dash-text-faint);">{{ row.users }} users</span>
              <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.submissions }}</span>
            </div>
          </div>
          <div class="progress-track" style="height: 4px;">
            <div class="progress-fill" :style="{ width: row.pct + '%' }" />
          </div>
        </div>
      </div>
      <EmptyState v-else title="Waiting for conversion data" description="Landing page conversion data will appear once form_submitted events include the landing_page property." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/landing-conversion?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() => {
  const results = (data.value as any)?.results ?? []
  const max = results[0]?.[1] || 1
  return results.map(([landing_page, submissions, users]: [string, number, number]) => ({
    landing_page, submissions, users,
    pct: Math.round((submissions / max) * 100),
  }))
})
</script>
