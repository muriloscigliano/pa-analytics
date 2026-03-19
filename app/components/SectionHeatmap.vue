<template>
  <div class="dash-card">
    <h2 class="dash-title">Section Engagement Heatmap</h2>
    <p class="dash-help">Visual heatmap of which sections get the most views across all pages. Darker red = more views. Helps decide which content to prioritise and where to place key CTAs.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!sections.length" title="No section data yet" description="Section engagement heatmap will populate once section_viewed events start flowing." />
    <div v-else class="flex flex-wrap gap-3">
      <div
        v-for="(s, i) in sections"
        :key="i"
        :style="{
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid var(--dash-border-card)',
          background: `rgba(196, 52, 58, ${opacity(s.views)})`,
          minWidth: '140px',
        }"
      >
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); margin-bottom: 4px;">{{ s.section }}</p>
        <p style="font-size: 14px; color: var(--dash-text-muted);">{{ s.page }}</p>
        <div class="flex items-center gap-3" style="margin-top: 8px;">
          <span style="font-size: 18px; font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ s.views }}</span>
          <span style="font-size: 14px; color: var(--dash-text-faint);">{{ s.users }} users</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/sections?days=${period.value}`, { watch: [period, refreshKey] })

const sections = computed(() => ((data.value as any)?.results ?? []).map(([section, page, views, users]: [string, string, number, number]) => ({ section, page, views, users })))

const maxViews = computed(() => Math.max(...sections.value.map((s: any) => s.views), 1))

function opacity(views: number) {
  return (0.08 + (views / maxViews.value) * 0.45).toFixed(2)
}
</script>
