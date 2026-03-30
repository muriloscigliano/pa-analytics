<template>
  <div class="dash-card">
    <h2 class="dash-title">Submissions by Day</h2>
    <p class="dash-help">Which days of the week get the most form submissions. Helps plan follow-up timing and understand when prospects are most active.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!dayData.some(d => d.submissions > 0)" title="Waiting for form data" description="Day-of-week breakdown will appear once form_submitted events start flowing." />
    <div v-else>
      <div v-for="(d, i) in dayData" :key="d.name" class="flex items-center gap-4" :style="{ padding: '10px 0', borderBottom: i < dayData.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <span style="font-size: 14px; color: var(--dash-text-body); min-width: 36px;">{{ d.name }}</span>
        <div style="flex: 1;">
          <div class="progress-track" style="height: 8px;"><div class="progress-fill" :style="{ width: d.pct + '%', background: d.isMax ? '#C4343A' : undefined }" /></div>
        </div>
        <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); min-width: 32px; text-align: right;" class="tabular-nums">{{ d.submissions }}</span>
        <span style="font-size: 14px; color: var(--dash-text-faint); min-width: 60px; text-align: right;" class="tabular-nums">{{ d.users }} people</span>
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
  const map: Record<number, { submissions: number; users: number }> = {}
  for (const [dayNum, submissions, users] of results) {
    map[dayNum] = { submissions, users }
  }
  const max = Math.max(...Object.values(map).map(v => v.submissions), 1)
  return dayNames.map((name, i) => {
    const d = map[i + 1] || { submissions: 0, users: 0 }
    return { name, submissions: d.submissions, users: d.users, pct: Math.round((d.submissions / max) * 100), isMax: d.submissions === max && d.submissions > 0 }
  })
})
</script>
