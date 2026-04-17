<template>
  <div class="dash-card">
    <h2 class="dash-title">Peak Traffic Days</h2>
    <p class="dash-help">Which days of the week get the most visitors and form submissions. Helps schedule campaigns and content updates.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!dayData.some(d => d.pageviews > 0)" title="Waiting for traffic data" description="Daily traffic patterns will appear once pageviews start flowing." />
    <div v-else>
      <!-- Peak stats -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4" style="margin-bottom: 24px;">
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: var(--dash-accent);">{{ peakDay }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Busiest Day</p>
        </div>
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ peakViews }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Peak Day Views</p>
        </div>
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: var(--dash-text-primary);">{{ quietDay }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Quietest Day</p>
        </div>
      </div>

      <!-- Day rows -->
      <div v-for="(d, i) in dayData" :key="i" class="flex items-center gap-3" :style="{ padding: '10px 0', borderBottom: i < dayData.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <span style="font-size: 14px; color: var(--dash-text-body); min-width: 90px; font-weight: 500;">{{ d.name }}</span>
        <div style="flex: 1;">
          <div class="progress-track" style="height: 6px;"><div class="progress-fill" :style="{ width: d.pct + '%', background: d.isPeak ? 'var(--dash-accent)' : undefined }" /></div>
        </div>
        <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); min-width: 48px; text-align: right;" class="tabular-nums">{{ d.pageviews.toLocaleString() }}</span>
        <span style="font-size: 14px; color: var(--dash-text-faint); min-width: 64px; text-align: right;" class="tabular-nums">{{ d.users }} users</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); min-width: 56px; text-align: right;" class="tabular-nums">{{ d.forms }} forms</span>
        <span style="font-size: 14px; font-weight: 600; min-width: 56px; text-align: right;" :style="{ color: d.isBestRate ? 'var(--dash-accent)' : 'var(--dash-text-primary)' }" class="tabular-nums">{{ d.rate }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/traffic-by-day?days=${period.value}`, { watch: [period, refreshKey] })

const dayData = computed(() => {
  const results = (data.value as any)?.results ?? []
  const map: Record<number, { pageviews: number; users: number; forms: number }> = {}
  for (const [dow, pageviews, users, forms] of results) {
    map[dow] = { pageviews, users, forms }
  }
  const max = Math.max(...Object.values(map).map(v => v.pageviews), 1)
  const base = Array.from({ length: 7 }, (_, i) => {
    const d = map[i + 1] || { pageviews: 0, users: 0, forms: 0 }
    const rate = d.users > 0 ? Math.round((d.forms / d.users) * 1000) / 10 : 0
    return {
      dow: i + 1,
      name: DAY_NAMES[i],
      pageviews: d.pageviews,
      users: d.users,
      forms: d.forms,
      rate,
      pct: Math.round((d.pageviews / max) * 100),
      isPeak: d.pageviews === max && d.pageviews > 0,
      isBestRate: false,
    }
  })
  const maxRate = Math.max(...base.map(d => d.rate), 0)
  return base.map(d => ({ ...d, isBestRate: d.rate === maxRate && maxRate > 0 }))
})

const peakDay = computed(() => {
  const peak = dayData.value.reduce((best, d) => d.pageviews > best.pageviews ? d : best, dayData.value[0])
  return peak?.name || '-'
})

const peakViews = computed(() => {
  const peak = dayData.value.reduce((best, d) => d.pageviews > best.pageviews ? d : best, dayData.value[0])
  return peak?.pageviews.toLocaleString() || '0'
})

const quietDay = computed(() => {
  const active = dayData.value.filter(d => d.pageviews > 0)
  if (!active.length) return '-'
  return active.reduce((best, d) => d.pageviews < best.pageviews ? d : best, active[0]).name
})
</script>
