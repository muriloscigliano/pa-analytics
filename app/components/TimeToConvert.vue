<template>
  <div class="dash-card">
    <h2 class="dash-title">Time to Convert</h2>
    <p class="dash-help">How long from a visitor's first pageview to their first form submission. Helps understand the consideration period — shorter times suggest strong intent, longer times may indicate hesitation or need for more info.</p>
    <LoadingSpinner v-if="pending || pendingPages" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <ErrorAlert v-else-if="errorPages" :message="errorPages.message" @retry="refreshPages" />
    <EmptyState v-else-if="!stats && !pageStats" title="No conversions yet" description="Time-to-convert data will appear here once visitors start submitting forms (form_submitted events)." />
    <div v-else>
      <!-- Time stats -->
      <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" style="margin-bottom: 28px;">
        <div v-for="(s, i) in timeCards" :key="'t-' + i" style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 16px; text-align: center;">
          <p style="font-size: 14px; color: var(--dash-text-muted); margin-bottom: 8px;">{{ s.label }}</p>
          <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ s.value }}</p>
          <p style="font-size: 14px; color: var(--dash-text-ghost); margin-top: 4px;">{{ s.unit }}</p>
        </div>
      </div>

      <!-- Pages before convert -->
      <div v-if="pageStats">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px;">Pages Before Conversion</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div v-for="(s, i) in pageCards" :key="'p-' + i" style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 16px; text-align: center;">
            <p style="font-size: 14px; color: var(--dash-text-muted); margin-bottom: 8px;">{{ s.label }}</p>
            <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ s.value }}</p>
            <p style="font-size: 14px; color: var(--dash-text-ghost); margin-top: 4px;">{{ s.unit }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/time-to-convert?days=${period.value}`, { watch: [period, refreshKey] })
const { data: pagesData, pending: pendingPages, error: errorPages, refresh: refreshPages } = useFetch(() => `/api/posthog/pages-before-convert?days=${period.value}`, { watch: [period, refreshKey] })

const stats = computed(() => {
  const r = (data.value as any)?.results?.[0]
  if (!r || r[4] === 0) return null
  return { avg: r[0], median: r[1], min: r[2], max: r[3], converters: r[4] }
})

const pageStats = computed(() => {
  const r = (pagesData.value as any)?.results?.[0]
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

const timeCards = computed(() => {
  if (!stats.value) return []
  return [
    { label: 'Average', value: formatTime(stats.value.avg), unit: timeUnit(stats.value.avg) },
    { label: 'Median', value: formatTime(stats.value.median), unit: timeUnit(stats.value.median) },
    { label: 'Fastest', value: formatTime(stats.value.min), unit: timeUnit(stats.value.min) },
    { label: 'Converters', value: stats.value.converters, unit: 'people' },
  ]
})

const pageCards = computed(() => {
  if (!pageStats.value) return []
  return [
    { label: 'Avg Pages', value: Math.round(pageStats.value.avg * 10) / 10, unit: 'pages' },
    { label: 'Median Pages', value: Math.round(pageStats.value.median), unit: 'pages' },
    { label: 'Min / Max', value: `${pageStats.value.min}–${pageStats.value.max}`, unit: 'pages' },
    { label: 'Converters', value: pageStats.value.converters, unit: 'people' },
  ]
})
</script>
