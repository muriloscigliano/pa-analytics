<template>
  <div class="dash-card">
    <h2 class="dash-title">Lead Quality Signals</h2>
    <p class="dash-help">What payment types leads need and promo code usage rate. Helps understand the quality and intent of incoming leads.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="rows.length > 0">
        <div v-for="(row, i) in rows" :key="i" class="flex flex-wrap items-center justify-between gap-1" :style="{ padding: '14px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <div class="flex items-center gap-3">
            <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ row.payment_use || 'Not specified' }}</span>
            <span class="pill" :class="row.has_promo ? 'pill-success' : 'pill-neutral'">{{ row.has_promo ? 'Promo' : 'No promo' }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span style="font-size: 14px; color: var(--dash-text-faint);">{{ row.users }} users</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.submissions }}</span>
          </div>
        </div>
      </div>
      <EmptyState v-else title="Waiting for form data" description="Lead quality signals will appear once form_submitted events include payment_use and promo code data." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/form-quality?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() =>
  ((data.value as any)?.results ?? []).map(([payment_use, has_promo, submissions, users]: [string, boolean, number, number]) => ({
    payment_use, has_promo, submissions, users,
  }))
)
</script>
