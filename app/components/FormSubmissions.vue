<template>
  <div class="dash-card">
    <h2 class="dash-title">Form Submissions</h2>
    <p class="dash-help">Form submissions captured automatically — signup, contact, partnership, and waitlist forms. Shows which pages and forms convert visitors.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="Object.keys(grouped).length > 0">
        <div v-for="(group, page) in grouped" :key="page" style="margin-bottom: 24px;">
          <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px;">{{ page || '/' }}</p>
          <div>
            <div v-for="(form, i) in group" :key="i" class="flex flex-wrap items-center justify-between gap-1" :style="{ padding: '14px 0', borderBottom: i < group.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
              <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ form.buttonText || 'Submit' }}</span>
              <div class="flex items-center gap-4">
                <span style="font-size: 14px; color: var(--dash-text-faint);">{{ form.users }} users</span>
                <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ form.submissions }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else title="Waiting for form submissions" description="Signup, contact, partnership, and waitlist form submissions will appear here automatically once visitors start submitting forms on the website." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/form-submissions?days=${period.value}`, { watch: [period, refreshKey] })

const grouped = computed(() => {
  const results = (data.value as any)?.results ?? []
  const groups: Record<string, Array<{ buttonText: string; submissions: number; users: number }>> = {}
  for (const [page, buttonText, submissions, users] of results) {
    const key = page || '/'
    if (!groups[key]) groups[key] = []
    groups[key].push({ buttonText, submissions, users })
  }
  return groups
})
</script>
