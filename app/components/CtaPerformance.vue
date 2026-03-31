<template>
  <div class="dash-card">
    <h2 class="dash-title">CTA Performance</h2>
    <p class="dash-help">Header and welcome page CTA button clicks. Shows which buttons drive the most engagement.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="rows.length > 0">
        <div v-for="(row, i) in rows" :key="i" class="flex flex-wrap items-center justify-between gap-2" :style="{ padding: '14px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <div class="flex items-center gap-3">
            <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ row.label }}</span>
            <span style="font-size: 13px; color: var(--dash-text-ghost); border: 1px solid var(--dash-border-card); padding: 1px 8px; border-radius: 4px;">{{ row.eventType === 'header_cta_clicked' ? 'Header' : 'Welcome' }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span style="font-size: 14px; color: var(--dash-text-faint);" class="tabular-nums">{{ row.users }} users</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.clicks }}</span>
          </div>
        </div>
      </div>
      <EmptyState v-else title="Waiting for CTA clicks" description="CTA click data will appear once header_cta_clicked and welcome_cta_clicked events start firing." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/cta-performance?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() =>
  ((data.value as any)?.results ?? []).map(([eventType, label, clicks, users]: [string, string, number, number]) => ({
    eventType, label, clicks, users,
  }))
)
</script>
