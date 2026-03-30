<template>
  <div class="dash-card">
    <h2 class="dash-title">Mobile Floating CTA</h2>
    <p class="dash-help">Performance of the mobile floating CTA button. Shows if the sticky CTA drives additional engagement on mobile.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="rows.length > 0">
        <div v-for="(row, i) in rows" :key="i" class="flex flex-wrap items-center justify-between gap-1" :style="{ padding: '14px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ row.label }}</span>
          <div class="flex items-center gap-4">
            <span style="font-size: 14px; color: var(--dash-text-faint);">{{ row.users }} users</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.clicks }}</span>
          </div>
        </div>
      </div>
      <EmptyState v-else title="Waiting for floating CTA data" description="Floating CTA clicks will appear once mobile visitors start tapping the sticky button." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/floating-cta?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() =>
  ((data.value as any)?.results ?? []).map(([label, clicks, users]: [string, number, number]) => ({
    label, clicks, users,
  }))
)
</script>
