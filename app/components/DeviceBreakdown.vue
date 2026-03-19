<template>
  <div class="dash-card">
    <h2 class="dash-title">Devices</h2>
    <p class="dash-help">What devices and browsers visitors use. Helps understand if the site needs better mobile or specific browser optimisation.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-for="(d, i) in devices" :key="i" class="flex items-center justify-between" :style="{ padding: '14px 0', borderBottom: i < devices.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <div class="flex items-center gap-3">
          <span class="pill pill-neutral">{{ d.device }}</span>
          <span style="font-size: 14px; color: var(--dash-text-body);">{{ d.browser }}</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost);">{{ d.os }}</span>
        </div>
        <div class="flex items-center gap-4">
          <span style="font-size: 14px; color: var(--dash-text-faint);">{{ d.users }} users</span>
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ d.pageviews.toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const period = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/devices?days=${period.value}`, { watch: [period] })
const devices = computed(() => ((data.value as any)?.results ?? []).map(([device, browser, os, pageviews, users]: [string, string, string, number, number]) => ({ device, browser, os, pageviews, users })))
</script>
