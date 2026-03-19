<template>
  <div class="dash-card">
    <h2 class="dash-title">Mobile vs Desktop Conversion</h2>
    <p class="dash-help">Compares how desktop and mobile visitors convert. Shows if your mobile experience needs improvement — a lower mobile conversion rate may indicate UX friction on smaller screens.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!rows.length" title="No conversion data yet" description="Conversion data will appear here once form_submitted and signup events start flowing." />
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div v-for="(r, i) in rows" :key="i" style="padding: 24px; border-radius: 16px; border: 1px solid var(--dash-border-card); background: var(--dash-bg-inset);">
        <div class="flex items-center gap-2" style="margin-bottom: 16px;">
          <span class="pill pill-neutral">{{ r.device || 'Unknown' }}</span>
          <span style="font-size: 14px; color: var(--dash-text-faint);">{{ r.users }} users</span>
        </div>
        <div style="margin-bottom: 12px;">
          <span style="font-size: 14px; color: var(--dash-text-muted);">Pageviews</span>
          <span style="font-size: 20px; font-weight: 700; color: var(--dash-text-primary); margin-left: 8px;" class="tabular-nums">{{ r.pageviews.toLocaleString() }}</span>
        </div>
        <div style="margin-bottom: 12px;">
          <span style="font-size: 14px; color: var(--dash-text-muted);">Form Submits</span>
          <span style="font-size: 20px; font-weight: 700; color: var(--dash-text-primary); margin-left: 8px;" class="tabular-nums">{{ r.forms }}</span>
        </div>
        <div style="margin-bottom: 12px;">
          <span style="font-size: 14px; color: var(--dash-text-muted);">Signups</span>
          <span style="font-size: 20px; font-weight: 700; color: var(--dash-text-primary); margin-left: 8px;" class="tabular-nums">{{ r.signups }}</span>
        </div>
        <div>
          <span style="font-size: 14px; color: var(--dash-text-muted);">Conversion Rate</span>
          <span :class="['pill', r.rate > 0 ? 'pill-success' : 'pill-neutral']" style="margin-left: 8px;">{{ r.rate }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/device-conversion?days=${period.value}`, { watch: [period, refreshKey] })
const rows = computed(() => ((data.value as any)?.results ?? []).map(([device, pageviews, forms, signups, users]: [string, number, number, number, number]) => ({
  device, pageviews, forms, signups, users,
  rate: pageviews > 0 ? Math.round((forms / pageviews) * 1000) / 10 : 0,
})))
</script>
