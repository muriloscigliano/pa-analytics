<template>
  <div class="dash-card">
    <h2 class="dash-title">Time to Convert</h2>
    <p class="dash-help">How long from a visitor's first pageview to their first form submission. Helps understand the consideration period — shorter times suggest strong intent, longer times may indicate hesitation or need for more info.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!stats" title="No conversions yet" description="Time-to-convert data will appear here once visitors start submitting forms (form_submitted events)." />
    <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-6">
      <div v-for="(s, i) in statCards" :key="i" style="text-align: center;">
        <p style="font-size: 14px; color: var(--dash-text-muted); margin-bottom: 8px;">{{ s.label }}</p>
        <p style="font-size: 28px; font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ s.value }}</p>
        <p style="font-size: 14px; color: var(--dash-text-ghost); margin-top: 4px;">{{ s.unit }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/time-to-convert?days=${period.value}`, { watch: [period, refreshKey] })

const stats = computed(() => {
  const r = (data.value as any)?.results?.[0]
  if (!r || r[4] === 0) return null
  return { avg: r[0], median: r[1], min: r[2], max: r[3], converters: r[4] }
})

function formatTime(mins: number) {
  if (mins < 1) return '<1'
  if (mins < 60) return Math.round(mins).toString()
  if (mins < 1440) return `${Math.round(mins / 60)}h`
  return `${Math.round(mins / 1440)}d`
}

function timeUnit(mins: number) {
  if (mins < 60) return 'minutes'
  if (mins < 1440) return 'hours'
  return 'days'
}

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    { label: 'Average', value: formatTime(stats.value.avg), unit: timeUnit(stats.value.avg) },
    { label: 'Median', value: formatTime(stats.value.median), unit: timeUnit(stats.value.median) },
    { label: 'Fastest', value: formatTime(stats.value.min), unit: timeUnit(stats.value.min) },
    { label: 'Converters', value: stats.value.converters, unit: 'people' },
  ]
})
</script>
