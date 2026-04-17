<template>
  <div class="dash-card">
    <h2 class="dash-title">Rageclicks</h2>
    <p class="dash-help">Frustrated visitors clicking repeatedly in the same spot. Often points to broken buttons, dead links, or unclear CTAs that look clickable but aren't.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!d?.total" title="No rageclicks detected" description="Rageclick data will appear here if PostHog detects frustrated clicking patterns." />
    <div v-else>
      <div class="grid grid-cols-2 gap-3 sm:gap-4" style="margin-bottom: 24px;">
        <StatBox :value="d.total" label="Total Rageclicks" accent />
        <StatBox :value="d.users" label="Frustrated People" />
      </div>

      <div v-if="d.byPage.length">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">By Page</p>
        <div v-for="(row, i) in d.byPage" :key="i" class="flex items-center justify-between" :style="{ padding: '8px 0', borderBottom: i < d.byPage.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <span style="font-size: 14px; color: var(--dash-text-body);">{{ row[0] || '—' }}</span>
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row[1] }} <span style="font-weight: 400; color: var(--dash-text-faint);">from {{ row[2] }} people</span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data: d, pending, error, refresh } = useFetch(() => `/api/posthog/rageclicks?days=${period.value}`, { watch: [period, refreshKey] })
</script>
