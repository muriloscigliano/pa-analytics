<template>
  <div class="dash-card">
    <h2 class="dash-title">Phone Number Clicks</h2>
    <p class="dash-help">Visitors who tapped the phone number in the drawer/menu. Tracks call intent from the marketing site.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!d?.total" title="No phone clicks yet" description="Phone number click data will appear here once visitors start tapping the call number in the drawer." />
    <div v-else>
      <!-- Summary -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4" style="margin-bottom: 24px;">
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: #C4343A;" class="tabular-nums">{{ d.total }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 6px;">Total Clicks</p>
        </div>
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ d.users }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 6px;">Unique People</p>
        </div>
      </div>

      <!-- By Page -->
      <div v-if="d.byPage.length" style="margin-bottom: 20px;">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">By Page</p>
        <div v-for="(r, i) in d.byPage" :key="i" class="flex items-center justify-between" :style="{ padding: '8px 0', borderBottom: i < d.byPage.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <span style="font-size: 14px; color: var(--dash-text-body);">{{ r.page }}</span>
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ r.clicks }} <span style="font-weight: 400; color: var(--dash-text-faint);">from {{ r.users }} people</span></span>
        </div>
      </div>

      <!-- By Device + Source inline -->
      <div class="grid grid-cols-2 gap-4">
        <div v-if="d.byDevice.length">
          <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">By Device</p>
          <div v-for="(r, i) in d.byDevice" :key="i" class="flex items-center justify-between" :style="{ padding: '6px 0', borderBottom: i < d.byDevice.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
            <span style="font-size: 14px; color: var(--dash-text-body);">{{ r.device }}</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ r.clicks }}</span>
          </div>
        </div>
        <div v-if="d.bySource.length">
          <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">By Source</p>
          <div v-for="(r, i) in d.bySource" :key="i" class="flex items-center justify-between" :style="{ padding: '6px 0', borderBottom: i < d.bySource.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
            <span style="font-size: 14px; color: var(--dash-text-body);">{{ r.source }}</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ r.clicks }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data: d, pending, error, refresh } = useFetch(() => `/api/posthog/phone-calls?days=${period.value}`, { watch: [period, refreshKey] })
</script>
