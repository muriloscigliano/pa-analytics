<template>
  <div class="dash-card">
    <h2 class="dash-title">New vs Returning Conversion</h2>
    <p class="dash-help">Do returning visitors convert better than new ones? Shows how many visitors of each type submitted a form and the conversion rate for each.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!rows.length" title="Waiting for visitor data" description="New vs returning conversion data will appear once form_submitted events start flowing alongside the visitor_type property." />
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div v-for="(r, i) in rows" :key="i" style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 16px; padding: 24px;">
          <div class="flex items-center justify-between" style="margin-bottom: 16px;">
            <p style="font-size: 16px; font-weight: 600; color: var(--dash-text-primary); text-transform: capitalize;">{{ r.type }}</p>
            <span :style="{ fontSize: '14px', fontWeight: 600, color: r.rate > 0 ? '#C4343A' : 'var(--dash-text-ghost)' }" class="tabular-nums">{{ r.rate }}% conv.</span>
          </div>
          <div class="flex items-center justify-between" style="padding: 8px 0; border-bottom: 1px solid var(--dash-border-row);">
            <span style="font-size: 14px; color: var(--dash-text-muted);">Visitors</span>
            <span style="font-size: 16px; font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ r.visitors.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between" style="padding: 8px 0; border-bottom: 1px solid var(--dash-border-row);">
            <span style="font-size: 14px; color: var(--dash-text-muted);">Submitted Forms</span>
            <span style="font-size: 16px; font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ r.submissions }} <span style="font-size: 14px; font-weight: 400; color: var(--dash-text-ghost);">from {{ r.submitters }} people</span></span>
          </div>
          <!-- Conversion bar -->
          <div style="margin-top: 12px;">
            <div class="progress-track"><div class="progress-fill" :style="{ width: Math.min(r.rate, 100) + '%' }" /></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/visitor-conversion?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() =>
  ((data.value as any)?.results ?? []).map(([type, visitors, submitters, submissions, rate]: [string, number, number, number, number]) => ({
    type, visitors, submitters, submissions, rate,
  }))
)
</script>
