<template>
  <div class="dash-card">
    <h2 class="dash-title">Navigation Engagement</h2>
    <p class="dash-help">Menu link clicks and header CTA clicks. Shows which navigation items drive the most traffic, broken down by event type.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="rows.length > 0">
        <div v-for="(row, i) in rows" :key="i" class="flex flex-wrap items-center justify-between gap-1" :style="{ padding: '14px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <div class="flex items-center gap-3">
            <span class="pill pill-neutral">{{ row.eventType === 'header_cta_clicked' ? 'CTA' : 'Menu' }}</span>
            <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ row.linkText || 'Link' }}</span>
            <span v-if="row.linkUrl" style="font-size: 14px; color: var(--dash-text-ghost);">→ {{ row.linkUrl }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span style="font-size: 14px; color: var(--dash-text-faint);">{{ row.users }} users</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.clicks }}</span>
          </div>
        </div>
      </div>
      <EmptyState v-else title="Waiting for navigation clicks" description="Menu link clicks and header CTA clicks will appear here once the menu_link_clicked and header_cta_clicked events start firing from the website." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/menu-navigation?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() =>
  ((data.value as any)?.results ?? []).map(([eventType, linkText, linkUrl, fromPage, clicks, users]: [string, string, string, string, number, number]) => ({
    eventType, linkText, linkUrl, fromPage, clicks, users,
  }))
)
</script>
