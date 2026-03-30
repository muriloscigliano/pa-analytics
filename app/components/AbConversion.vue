<template>
  <div class="dash-card">
    <h2 class="dash-title">A/B Variant Conversion</h2>
    <p class="dash-help">Which homepage variant drives more form submissions. Compares conversion rates across A/B test variants to find the winner.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!rows.length" title="Waiting for A/B data" description="A/B variant conversion will appear once form_submitted events include the ab_variant property." />
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div v-for="(r, i) in rows" :key="i" style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 16px; padding: 24px;">
          <div class="flex items-center justify-between" style="margin-bottom: 16px;">
            <p style="font-size: 16px; font-weight: 600; color: var(--dash-text-primary);">{{ r.variant }}</p>
            <span v-if="r.isBest && r.rate > 0" style="font-size: 12px; font-weight: 600; color: #C4343A; background: rgba(196,52,58,0.1); padding: 2px 8px; border-radius: 20px;">BEST</span>
          </div>
          <div style="text-align: center; margin-bottom: 16px;">
            <p style="font-size: clamp(24px, 5vw, 36px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ r.rate }}%</p>
            <p style="font-size: 14px; color: var(--dash-text-faint);">conversion rate</p>
          </div>
          <div class="flex items-center justify-between" style="padding: 8px 0; border-top: 1px solid var(--dash-border-row);">
            <span style="font-size: 14px; color: var(--dash-text-muted);">Visitors</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ r.visitors.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between" style="padding: 8px 0;">
            <span style="font-size: 14px; color: var(--dash-text-muted);">Conversions</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ r.submitters }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/ab-conversion?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() => {
  const results = ((data.value as any)?.results ?? []).map(([variant, visitors, submitters, submissions, rate]: [string, number, number, number, number]) => ({
    variant, visitors, submitters, submissions, rate, isBest: false,
  }))
  if (results.length > 0) {
    const maxRate = Math.max(...results.map((r: any) => r.rate))
    results.forEach((r: any) => { r.isBest = r.rate === maxRate && maxRate > 0 })
  }
  return results
})
</script>
