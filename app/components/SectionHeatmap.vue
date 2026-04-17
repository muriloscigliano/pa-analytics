<template>
  <div class="dash-card">
    <h2 class="dash-title">Section Engagement Heatmap</h2>
    <p class="dash-help">Visual heatmap of which sections get the most views across all pages. Darker red = more views. Helps decide which content to prioritise and where to place key CTAs.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!sections.length" title="No section data yet" description="Section engagement heatmap will populate once section_viewed events start flowing." />
    <div v-else>
      <!-- Group by page -->
      <div v-for="(group, gi) in grouped" :key="gi" :style="{ marginBottom: gi < grouped.length - 1 ? '28px' : '0' }">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-muted); margin-bottom: 14px;">{{ group.page }}</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div
            v-for="(s, si) in group.items"
            :key="si"
            style="border-radius: 12px; border: 1px solid var(--dash-border-card); padding: 16px; position: relative; overflow: hidden;"
          >
            <!-- Heat background -->
            <div :style="{ position: 'absolute', inset: 0, background: 'var(--dash-accent)', opacity: opacity(s.views), borderRadius: '12px', pointerEvents: 'none' }" />
            <div style="position: relative;">
              <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); margin-bottom: 10px; line-height: 1.3;">{{ s.section }}</p>
              <div class="flex items-center justify-between">
                <span style="font-size: 22px; font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ s.views }}</span>
                <span style="font-size: 14px; color: var(--dash-text-faint);">{{ s.users }}u</span>
              </div>
            </div>
          </div>
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

const grouped = computed(() => {
  const map = new Map<string, any[]>()
  for (const s of sections.value) {
    if (!map.has(s.page)) map.set(s.page, [])
    map.get(s.page)!.push(s)
  }
  return Array.from(map.entries()).map(([page, items]) => ({ page, items }))
})

function opacity(views: number) {
  return (0.06 + (views / maxViews.value) * 0.35).toFixed(2)
}
</script>
