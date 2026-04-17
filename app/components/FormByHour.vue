<template>
  <div class="dash-card">
    <h2 class="dash-title">Submissions by Hour</h2>
    <p class="dash-help">Which hours of the day get the most form submissions (Sydney time). Helps understand when prospects are most likely to sign up.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!hourData.some(h => h.submissions > 0)" title="Waiting for form data" description="Hourly breakdown will appear once form_submitted events start flowing." />
    <div v-else>
      <!-- Peak stats -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4" style="margin-bottom: 20px;">
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: var(--dash-accent);" class="tabular-nums">{{ peakWindow }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Busiest Window</p>
        </div>
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ peakWindowSubmissions }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">In Window</p>
        </div>
      </div>
      <!-- Hour rows grouped by time blocks -->
      <div v-for="(block, bi) in timeBlocks" :key="bi" style="margin-bottom: 16px;">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">{{ block.label }}</p>
        <div v-for="(h, i) in block.hours" :key="h.hour" class="flex items-center gap-3" :style="{ padding: '6px 0', borderBottom: i < block.hours.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <span style="font-size: 14px; color: var(--dash-text-ghost); min-width: 44px;" class="tabular-nums">{{ h.label }}</span>
          <div style="flex: 1;">
            <div class="progress-track" style="height: 6px;"><div class="progress-fill" :style="{ width: h.pct + '%', background: h.isPeak ? 'var(--dash-accent)' : undefined }" /></div>
          </div>
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); min-width: 24px; text-align: right;" class="tabular-nums">{{ h.submissions || '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/form-by-hour?days=${period.value}`, { watch: [period, refreshKey] })

const hourData = computed(() => {
  const results = (data.value as any)?.results ?? []
  const map: Record<number, number> = {}
  for (const [hour, submissions] of results) {
    map[hour] = submissions
  }
  const max = Math.max(...Object.values(map), 1)
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: `${i.toString().padStart(2, '0')}:00`,
    submissions: map[i] || 0,
    pct: Math.round(((map[i] || 0) / max) * 100),
    isPeak: (map[i] || 0) === max && (map[i] || 0) > 0,
  }))
})

const timeBlocks = computed(() => [
  { label: 'Morning (6am–12pm)', hours: hourData.value.slice(6, 12) },
  { label: 'Afternoon (12pm–6pm)', hours: hourData.value.slice(12, 18) },
  { label: 'Evening (6pm–12am)', hours: hourData.value.slice(18, 24) },
  { label: 'Night (12am–6am)', hours: hourData.value.slice(0, 6) },
])

function findBestWindow(data: Array<{ hour: number; submissions: number }>, size: number) {
  let bestStart = 0, bestSum = 0
  for (let i = 0; i <= 24 - size; i++) {
    const sum = data.slice(i, i + size).reduce((s, h) => s + h.submissions, 0)
    if (sum > bestSum) { bestSum = sum; bestStart = i }
  }
  return { start: bestStart, end: bestStart + size, total: bestSum }
}

const bestWindow = computed(() => findBestWindow(hourData.value, 4))

const peakWindow = computed(() => {
  const w = bestWindow.value
  return `${w.start.toString().padStart(2, '0')}:00–${w.end.toString().padStart(2, '0')}:00`
})

const peakWindowSubmissions = computed(() => bestWindow.value.total)
</script>
