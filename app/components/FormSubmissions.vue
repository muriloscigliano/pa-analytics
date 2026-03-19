<template>
  <div class="dash-card">
    <h2 class="dash-title">Form Submissions</h2>
    <p class="dash-help">Forms submitted by visitors — signup, contact, partnership, and inline signup. Grouped by form type and page where it was submitted.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="Object.keys(grouped).length > 0">
        <div v-for="(group, formType) in grouped" :key="formType" style="margin-bottom: 24px;">
          <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px;">{{ formType || 'Unknown' }}</p>
          <div>
            <div v-for="(form, i) in group" :key="i" class="flex flex-wrap items-center justify-between gap-1" :style="{ padding: '14px 0', borderBottom: i < group.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
              <span style="font-size: 14px; color: var(--dash-text-body);">{{ form.page || '/' }}</span>
              <div class="flex items-center gap-4">
                <span style="font-size: 14px; color: var(--dash-text-faint);">{{ form.users }} users</span>
                <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ form.submissions }}</span>
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
