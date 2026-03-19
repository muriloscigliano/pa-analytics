<template>
  <div class="dash-card">
    <h2 class="dash-title">Visitor Types</h2>
    <p class="dash-help">Breakdown of new vs returning visitors. Shows how each group engages — pageviews, clicks, and sections they scrolled through.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else class="space-y-6">
      <div v-for="(v, i) in visitors" :key="i">
        <div class="flex items-center justify-between mb-4">
          <p style="font-size: 16px; font-weight: 600; color: var(--dash-text-primary); text-transform: capitalize;">{{ v.type || 'Unknown' }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint);">{{ v.users }} users</p>
        </div>
        <div class="grid grid-cols-3 gap-2 sm:gap-4">
          <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
            <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ v.pageviews }}</p>
            <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 6px;">Pageviews</p>
          </div>
          <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
            <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ v.clicks }}</p>
            <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 6px;">Clicks</p>
          </div>
          <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
            <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ v.sectionsViewed }}</p>
            <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 6px;">Sections</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const period = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/visitor-types?days=${period.value}`, { watch: [period] })
const visitors = computed(() => ((data.value as any)?.results ?? []).map(([type, pageviews, users, clicks, sectionsViewed]: [string, number, number, number, number]) => ({ type, pageviews, users, clicks, sectionsViewed })))
</script>
