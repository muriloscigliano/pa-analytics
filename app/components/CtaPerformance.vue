<template>
  <div class="dash-card">
    <h2 class="dash-title">CTA Performance</h2>
    <p class="dash-help">All CTA button clicks tracked across the site. Shows which button labels, page locations, and destinations drive the most engagement.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="rows.length > 0">
        <div v-for="(row, i) in rows" :key="i" class="flex flex-wrap items-center justify-between gap-1" :style="{ padding: '14px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ row.label }}</span>
            <span v-if="row.location" style="font-size: 14px; color: var(--dash-text-ghost);">@ {{ row.location }}</span>
            <span v-if="row.destination" style="font-size: 14px; color: var(--dash-text-ghost);">→ {{ row.destination }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span style="font-size: 14px; color: var(--dash-text-faint);">{{ row.users }} users</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.clicks }}</span>
          </div>
        </div>
      </div>
      <EmptyState v-else title="Waiting for CTA clicks" description="CTA click data will appear here once the cta_clicked event starts firing from the website." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/cta-performance?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() =>
  ((data.value as any)?.results ?? []).map(([label, location, destination, clicks, users]: [string, string, string, number, number]) => ({
    label, location, destination, clicks, users,
  }))
)
</script>
