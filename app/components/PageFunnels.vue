<template>
  <div class="dash-card">
    <h2 class="dash-title">Page Conversion Funnels</h2>
    <p class="dash-help">Conversion performance per landing page. Shows which pages drive the most form submissions and signups — helps identify high-performing pages and pages that need better CTAs or content.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!pages.length" title="No funnel data yet" description="Per-page funnel data will appear here once form_submitted and signup events start flowing alongside pageviews." />
    <div v-else>
      <div v-for="(p, i) in pages" :key="i" :style="{ padding: '16px 0', borderBottom: i < pages.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <div class="flex flex-wrap items-center justify-between gap-2" style="margin-bottom: 8px;">
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-body);">{{ p.page }}</span>
          <span :class="['pill', p.formRate > 0 ? 'pill-success' : 'pill-neutral']">{{ p.formRate }}% form rate</span>
        </div>
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <span style="font-size: 14px; color: var(--dash-text-muted);">Views</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ p.views.toLocaleString() }}</span>
          </div>
          <span style="color: var(--dash-text-ghost);">→</span>
          <div class="flex items-center gap-2">
            <span style="font-size: 14px; color: var(--dash-text-muted);">Forms</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ p.forms }}</span>
          </div>
          <span style="color: var(--dash-text-ghost);">→</span>
          <div class="flex items-center gap-2">
            <span style="font-size: 14px; color: var(--dash-text-muted);">Signups</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ p.signups }}</span>
          </div>
        </div>
        <!-- Mini progress bar -->
        <div class="progress-track" style="margin-top: 10px;">
          <div class="progress-fill" :style="{ width: p.formRate + '%' }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/page-funnels?days=${period.value}`, { watch: [period, refreshKey] })
const pages = computed(() => ((data.value as any)?.results ?? []).map(([page, views, forms, signups, formRate]: [string, number, number, number, number]) => ({ page, views, forms, signups, formRate })))
</script>
