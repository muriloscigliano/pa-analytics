<template>
  <div class="dash-card">
    <h2 class="dash-title">Peak Traffic Hours</h2>
    <p class="dash-help">When visitors browse your site throughout the day (Sydney time). Helps decide when to run ads, publish content, or schedule maintenance windows.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!hourData.some(h => h.pageviews > 0)" title="Waiting for traffic data" description="Hourly traffic data will appear once pageviews start flowing." />
    <div v-else>
      <!-- Peak stats -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4" style="margin-bottom: 24px;">
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: #C4343A;" class="tabular-nums">{{ peakWindow }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Busiest Window</p>
        </div>
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ peakWindowViews }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Views in Window</p>
        </div>
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ quietHour }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Quietest Hour</p>
        </div>
      </div>

      <!-- Hour rows grouped by time blocks -->
      <div v-for="(block, bi) in timeBlocks" :key="bi" style="margin-bottom: 16px;">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">{{ block.label }}</p>
        <div v-for="(h, i) in block.hours" :key="h.hour" class="flex items-center gap-3" :style="{ padding: '6px 0', borderBottom: i < block.hours.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <span style="font-size: 14px; color: var(--dash-text-ghost); min-width: 44px;" class="tabular-nums">{{ h.label }}</span>
          <div style="flex: 1;">
            <div class="progress-track" style="height: 6px;"><div class="progress-fill" :style="{ width: h.pct + '%', background: h.isPeak ? '#C4343A' : undefined }" /></div>
          </div>
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); min-width: 32px; text-align: right;" class="tabular-nums">{{ h.pageviews || '-' }}</span>
          <span style="font-size: 14px; color: var(--dash-text-faint); min-width: 60px; text-align: right;" class="tabular-nums">{{ h.users }} users</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/traffic-by-hour?days=${period.value}`, { watch: [period, refreshKey] })

const hourData = computed(() => {
  const results = (data.value as any)?.results ?? []
  const map: Record<number, { pageviews: number; users: number }> = {}
  for (const [hour, pageviews, users] of results) {
    map[hour] = { pageviews, users }
  }
  const max = Math.max(...Object.values(map).map(v => v.pageviews), 1)
  return Array.from({ length: 24 }, (_, i) => {
    const d = map[i] || { pageviews: 0, users: 0 }
    return { hour: i, label: `${i.toString().padStart(2, '0')}:00`, pageviews: d.pageviews, users: d.users, pct: Math.round((d.pageviews / max) * 100), isPeak: d.pageviews === max && d.pageviews > 0 }
  })
})

const timeBlocks = computed(() => [
  { label: 'Morning (6am–12pm)', hours: hourData.value.slice(6, 12) },
  { label: 'Afternoon (12pm–6pm)', hours: hourData.value.slice(12, 18) },
  { label: 'Evening (6pm–12am)', hours: hourData.value.slice(18, 24) },
  { label: 'Night (12am–6am)', hours: hourData.value.slice(0, 6) },
])

function findBestWindow(data: Array<{ hour: number; pageviews: number }>, size: number) {
  let bestStart = 0, bestSum = 0
  for (let i = 0; i <= 24 - size; i++) {
    const sum = data.slice(i, i + size).reduce((s, h) => s + h.pageviews, 0)
    if (sum > bestSum) { bestSum = sum; bestStart = i }
  }
  return { start: bestStart, end: bestStart + size, total: bestSum }
}

const bestWindow = computed(() => findBestWindow(hourData.value, 4))

const peakWindow = computed(() => {
  const w = bestWindow.value
  return `${w.start.toString().padStart(2, '0')}:00–${w.end.toString().padStart(2, '0')}:00`
})

const peakWindowViews = computed(() => bestWindow.value.total)

const quietHour = computed(() => {
  const active = hourData.value.filter(h => h.pageviews > 0)
  if (!active.length) return '-'
  const quiet = active.reduce((best, h) => h.pageviews < best.pageviews ? h : best, active[0])
  return quiet.label
})
</script>
