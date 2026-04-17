<template>
  <div class="dash-card">
    <h2 class="dash-title">Submissions by Day</h2>
    <p class="dash-help">Which days of the week get the most form submissions, and the conversion rate (submitters / visitors) for each day. Helps plan follow-up timing.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!dayData.some(d => d.submissions > 0)" title="Waiting for form data" description="Day-of-week breakdown will appear once form_submitted events start flowing." />
    <div v-else>
      <div v-for="(d, i) in dayData" :key="d.name" class="flex items-center gap-4" :style="{ padding: '10px 0', borderBottom: i < dayData.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <span style="font-size: 14px; color: var(--dash-text-body); min-width: 36px;">{{ d.name }}</span>
        <div style="flex: 1;">
          <div class="progress-track" style="height: 8px;"><div class="progress-fill" :style="{ width: d.pct + '%', background: d.isMax ? 'var(--dash-accent)' : undefined }" /></div>
        </div>
        <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); min-width: 32px; text-align: right;" class="tabular-nums">{{ d.submissions }}</span>
        <span style="font-size: 14px; color: var(--dash-text-faint); min-width: 64px; text-align: right;" class="tabular-nums">{{ d.visitors }} visits</span>
        <span style="font-size: 14px; font-weight: 600; min-width: 56px; text-align: right;" :style="{ color: d.isBestRate ? 'var(--dash-accent)' : 'var(--dash-text-primary)' }" class="tabular-nums">{{ d.rate }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/form-by-day?days=${period.value}`, { watch: [period, refreshKey] })

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const dayData = computed(() => {
  const results = (data.value as any)?.results ?? []
  const map: Record<number, { submissions: number; submitters: number; visitors: number }> = {}
  for (const [dayNum, submissions, submitters, visitors] of results) {
    map[dayNum] = { submissions, submitters, visitors }
  }
  const max = Math.max(...Object.values(map).map(v => v.submissions), 1)
  const base = dayNames.map((name, i) => {
    const d = map[i + 1] || { submissions: 0, submitters: 0, visitors: 0 }
    const rate = d.visitors > 0 ? Math.round((d.submitters / d.visitors) * 1000) / 10 : 0
    return {
      name,
      submissions: d.submissions,
      submitters: d.submitters,
      visitors: d.visitors,
      rate,
      pct: Math.round((d.submissions / max) * 100),
      isMax: d.submissions === max && d.submissions > 0,
      isBestRate: false,
    }
  })
  const maxRate = Math.max(...base.map(d => d.rate), 0)
  return base.map(d => ({ ...d, isBestRate: d.rate === maxRate && maxRate > 0 }))
})
</script>
