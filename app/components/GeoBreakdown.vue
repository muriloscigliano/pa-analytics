<template>
  <div class="dash-card">
    <h2 class="dash-title">Geographic</h2>
    <p class="dash-help">Where visitors are located based on their IP address. Shows city-level breakdown with pageview counts.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-for="(loc, i) in locations" :key="i" class="flex flex-wrap items-center justify-between gap-2" :style="{ padding: '14px 0', borderBottom: i < locations.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <div class="flex items-center gap-3">
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); min-width: 40px;" class="tabular-nums">{{ i + 1 }}</span>
          <div>
            <p style="font-size: 14px; font-weight: 500; color: var(--dash-text-body);">{{ loc.city || 'Unknown' }}</p>
            <p style="font-size: 14px; color: var(--dash-text-ghost); margin-top: 1px;">{{ loc.country }}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span style="font-size: 14px; color: var(--dash-text-faint);">{{ loc.users }} users</span>
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ loc.pageviews.toLocaleString() }}</span>
        </div>
      </div>
      <EmptyState v-if="locations.length === 0" title="Waiting for location data" description="Geographic breakdown shows where visitors are located based on their IP address. Data will appear once visitors start browsing." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/geo?days=${period.value}`, { watch: [period, refreshKey] })
const locations = computed(() => ((data.value as any)?.results ?? []).map(([country, city, pageviews, users]: [string, string, number, number]) => ({ country, city, pageviews, users })))
</script>
