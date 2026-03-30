<template>
  <div class="dash-card">
    <h2 class="dash-title">Header CTA</h2>
    <p class="dash-help">Header CTA performance split by device. Shows if mobile vs desktop users engage differently with top-of-page CTAs.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="rows.length > 0">
        <div v-for="(row, i) in rows" :key="i" class="flex flex-wrap items-center justify-between gap-1" :style="{ padding: '14px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <div class="flex items-center gap-3">
            <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ row.label }}</span>
            <span class="pill pill-neutral">{{ row.device }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span style="font-size: 14px; color: var(--dash-text-faint);">{{ row.users }} users</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.clicks }}</span>
          </div>
        </div>
      </div>
      <EmptyState v-else title="Waiting for header CTA data" description="Header CTA clicks will appear once header_cta_clicked events start firing." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/header-cta?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() =>
  ((data.value as any)?.results ?? []).map(([label, device, clicks, users]: [string, string, number, number]) => ({
    label, device, clicks, users,
  }))
)
</script>
