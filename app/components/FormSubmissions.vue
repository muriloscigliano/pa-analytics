<template>
  <div class="dash-card">
    <h2 class="dash-title">Form Submissions</h2>
    <p class="dash-help">All form submissions grouped by type and page. "Submissions" = total times the form was sent (includes retries). "People" = unique visitors who submitted.</p>
    <LoadingSpinner v-if="pending || pendingDays" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <!-- Day of week breakdown -->
      <div v-if="dayData.length > 0" style="margin-bottom: 28px;">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 14px;">Submissions by Day</p>
        <div class="flex items-end gap-2" style="height: 80px;">
          <div v-for="d in dayData" :key="d.name" class="flex flex-col items-center flex-1">
            <span v-if="d.submissions > 0" style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); margin-bottom: 4px;" class="tabular-nums">{{ d.submissions }}</span>
            <div :style="{ height: d.pct + '%', minHeight: d.submissions > 0 ? '4px' : '2px', background: d.isMax ? '#C4343A' : 'var(--dash-border-card)', borderRadius: '3px', width: '100%' }" />
            <span style="font-size: 14px; color: var(--dash-text-ghost); margin-top: 6px;">{{ d.name }}</span>
          </div>
        </div>
      </div>

      <div v-if="Object.keys(grouped).length > 0">
        <div v-for="(group, formType) in grouped" :key="formType" style="margin-bottom: 24px;">
          <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px;">{{ formType || 'Unknown' }}</p>
          <div>
            <div v-for="(form, i) in group" :key="i" class="flex flex-wrap items-center justify-between gap-1" :style="{ padding: '14px 0', borderBottom: i < group.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
              <span style="font-size: 14px; color: var(--dash-text-body);">{{ form.page || '/' }}</span>
              <div class="flex items-center gap-4">
                <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ form.submissions }} <span style="font-weight: 400; color: var(--dash-text-ghost);">submissions</span></span>
                <span style="font-size: 14px; color: var(--dash-text-faint);" class="tabular-nums">{{ form.users }} <span style="color: var(--dash-text-ghost);">people</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else title="Waiting for form submissions" description="Signup, contact, partnership, and inline signup form submissions will appear here once the form_submitted event starts firing from the website." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/form-submissions?days=${period.value}`, { watch: [period, refreshKey] })
const { data: daysRaw, pending: pendingDays } = useFetch(() => `/api/posthog/form-by-day?days=${period.value}`, { watch: [period, refreshKey] })

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const dayData = computed(() => {
  const results = (daysRaw.value as any)?.results ?? []
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

const grouped = computed(() => {
  const results = (data.value as any)?.results ?? []
  const groups: Record<string, Array<{ page: string; submissions: number; users: number }>> = {}
  for (const [formType, page, submissions, users] of results) {
    const key = formType || 'unknown'
    if (!groups[key]) groups[key] = []
    groups[key].push({ page, submissions, users })
  }
  return groups
})
</script>
