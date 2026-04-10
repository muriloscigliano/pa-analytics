<template>
  <div class="dash-card">
    <h2 class="dash-title">Traffic Source → Conversion</h2>
    <p class="dash-help">Which traffic sources actually convert. Shows referral domains ranked by volume with conversion rates — helps identify which channels bring quality traffic, not just volume.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!rows.length" title="No source data yet" description="Traffic source conversion data will appear here once pageviews and form submissions are captured." />
    <div v-else>
      <div v-for="(r, i) in rows" :key="i" class="flex flex-wrap items-center justify-between gap-2" :style="{ padding: '14px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <div class="flex items-center gap-3" style="min-width: 0;">
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-body);">{{ r.source }}</span>
          <span style="font-size: 14px; color: var(--dash-text-faint);">{{ r.users }} users</span>
        </div>
        <div class="flex items-center gap-4">
          <span style="font-size: 14px; color: var(--dash-text-muted);">{{ r.pageviews.toLocaleString() }} views</span>
          <span style="font-size: 14px; color: var(--dash-text-muted);">{{ r.conversions }} conv.</span>
          <span v-if="r.phoneCalls" style="font-size: 14px; color: var(--dash-text-muted);">{{ r.phoneCalls }} calls</span>
          <span :class="['pill', r.rate > 0 ? 'pill-success' : 'pill-neutral']">{{ r.rate }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/source-conversion?days=${period.value}`, { watch: [period, refreshKey] })
const rows = computed(() => ((data.value as any)?.results ?? []).map(([source, pageviews, conversions, users, rate, phoneCalls]: [string, number, number, number, number, number]) => ({ source, pageviews, conversions, users, rate, phoneCalls: phoneCalls || 0 })))
</script>
