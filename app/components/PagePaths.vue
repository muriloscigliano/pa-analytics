<template>
  <div class="dash-card">
    <h2 class="dash-title">User Journeys</h2>
    <p class="dash-help">Most common page-to-page transitions. Shows how visitors navigate through your site — which pages lead to which. Higher transition counts reveal your most-used navigation paths.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!paths.length" title="No journey data yet" description="Page transitions will appear here once visitors navigate between multiple pages." />
    <div v-else>
      <div v-for="(p, i) in paths" :key="i" class="flex flex-wrap items-center justify-between gap-2" :style="{ padding: '14px 0', borderBottom: i < paths.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <div class="flex items-center gap-2 flex-wrap" style="min-width: 0;">
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-body);">{{ p.from }}</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost);">→</span>
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-body);">{{ p.to }}</span>
        </div>
        <div class="flex items-center gap-4">
          <span style="font-size: 14px; color: var(--dash-text-faint);">{{ p.users }} users</span>
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ p.transitions }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/page-paths?days=${period.value}`, { watch: [period, refreshKey] })
const paths = computed(() => ((data.value as any)?.results ?? []).map(([from, to, transitions, users]: [string, string, number, number]) => ({ from, to, transitions, users })))
</script>
