<template>
  <div class="dash-card">
    <h2 class="dash-title">Traffic Source ROI</h2>
    <p class="dash-help">Where visitors come from and what they do. "Converted" = submitted a form. "Logins" = existing customers who clicked Login. High login % on Paid Search means ad money spent bringing back existing customers.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!channels.length" title="No traffic data yet" description="Traffic source data will appear once visitors start arriving." />
    <div v-else>
      <!-- Table header -->
      <div class="hidden sm:flex items-center" style="padding: 0 0 10px; border-bottom: 1px solid var(--dash-border-row); margin-bottom: 4px;">
        <span style="font-size: 14px; color: var(--dash-text-ghost); flex: 1;">Source</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 70px; text-align: right;">Visitors</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 80px; text-align: right;">Converted</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 60px; text-align: right;">Conv%</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 70px; text-align: right;">Logins</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 70px; text-align: right;">Login%</span>
      </div>

      <div v-for="(ch, i) in channels" :key="i" :style="{ borderBottom: i < channels.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <!-- Desktop -->
        <div class="hidden sm:flex items-center" style="padding: 12px 0;">
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); flex: 1;">{{ ch.channel }}</span>
          <span style="font-size: 14px; color: var(--dash-text-body); width: 70px; text-align: right;" class="tabular-nums">{{ ch.visitors }}</span>
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); width: 80px; text-align: right;" class="tabular-nums">{{ ch.converters }}</span>
          <span style="font-size: 14px; color: var(--dash-text-faint); width: 60px; text-align: right;" class="tabular-nums">{{ ch.convRate }}%</span>
          <span style="font-size: 14px; color: var(--dash-text-body); width: 70px; text-align: right;" class="tabular-nums">{{ ch.loggers }}</span>
          <span :style="{ fontSize: '14px', fontWeight: 600, color: ch.loginRate > 30 ? '#C4343A' : 'var(--dash-text-faint)', width: '70px', textAlign: 'right' }" class="tabular-nums">{{ ch.loginRate }}%</span>
        </div>
        <!-- Mobile -->
        <div class="sm:hidden" style="padding: 10px 0;">
          <div class="flex items-center justify-between mb-1">
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);">{{ ch.channel }}</span>
            <span :style="{ fontSize: '14px', fontWeight: 600, color: ch.loginRate > 30 ? '#C4343A' : 'var(--dash-text-faint)' }" class="tabular-nums">{{ ch.loginRate }}% login</span>
          </div>
          <div class="flex items-center gap-4" style="font-size: 14px; color: var(--dash-text-faint);">
            <span class="tabular-nums">{{ ch.visitors }} visitors</span>
            <span class="tabular-nums">{{ ch.converters }} converted ({{ ch.convRate }}%)</span>
            <span class="tabular-nums">{{ ch.loggers }} logins</span>
          </div>
        </div>
      </div>
      <!-- Totals row -->
      <div v-if="totals.visitors" class="hidden sm:flex items-center" style="padding: 12px 0; border-top: 2px solid var(--dash-border-card); margin-top: 4px;">
        <span style="font-size: 14px; font-weight: 700; color: var(--dash-text-primary); flex: 1;">Total (unique)</span>
        <span style="font-size: 14px; font-weight: 700; color: var(--dash-text-primary); width: 70px; text-align: right;" class="tabular-nums">{{ totals.visitors }}</span>
        <span style="font-size: 14px; font-weight: 700; color: var(--dash-text-primary); width: 80px; text-align: right;" class="tabular-nums">{{ totals.converters }}</span>
        <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); width: 60px; text-align: right;" class="tabular-nums">{{ totals.convRate }}%</span>
        <span style="font-size: 14px; font-weight: 700; color: var(--dash-text-primary); width: 70px; text-align: right;" class="tabular-nums">{{ totals.loggers }}</span>
        <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); width: 70px; text-align: right;" class="tabular-nums">{{ totals.loginRate }}%</span>
      </div>

      <!-- Campaign breakdown -->
      <div v-if="campaigns.length > 0" style="margin-top: 28px;">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">Paid Search by Campaign</p>
        <p style="font-size: 14px; color: var(--dash-text-ghost); margin-bottom: 12px;">Google Ads campaign IDs with landing pages. Match campaign IDs in your Google Ads dashboard to see names and spend.</p>

        <div class="hidden sm:flex items-center" style="padding: 0 0 10px; border-bottom: 1px solid var(--dash-border-row); margin-bottom: 4px;">
          <span style="font-size: 14px; color: var(--dash-text-ghost); flex: 1;">Campaign</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 160px;">Landing Page</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 70px; text-align: right;">Visitors</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 70px; text-align: right;">Conv.</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 60px; text-align: right;">Conv%</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 70px; text-align: right;">Logins</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 70px; text-align: right;">Login%</span>
        </div>

        <div v-for="(c, i) in campaigns" :key="i" :style="{ borderBottom: i < campaigns.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <div class="hidden sm:flex items-center" style="padding: 10px 0;">
            <div style="flex: 1; min-width: 0;">
              <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ c.campaignName || c.campaignId }}</span>
              <span v-if="c.campaignName" style="font-size: 12px; color: var(--dash-text-ghost); margin-left: 6px;" class="tabular-nums">#{{ c.campaignId }}</span>
            </div>
            <span style="font-size: 14px; color: var(--dash-text-body); width: 160px; text-align: left;">{{ c.landingPage }}</span>
            <span style="font-size: 14px; color: var(--dash-text-body); width: 70px; text-align: right;" class="tabular-nums">{{ c.visitors }}</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); width: 70px; text-align: right;" class="tabular-nums">{{ c.converters }}</span>
            <span style="font-size: 14px; color: var(--dash-text-faint); width: 60px; text-align: right;" class="tabular-nums">{{ c.convRate }}%</span>
            <span style="font-size: 14px; color: var(--dash-text-body); width: 70px; text-align: right;" class="tabular-nums">{{ c.loggers }}</span>
            <span :style="{ fontSize: '14px', fontWeight: 600, color: c.loginRate > 30 ? '#C4343A' : 'var(--dash-text-faint)', width: '70px', textAlign: 'right' }" class="tabular-nums">{{ c.loginRate }}%</span>
          </div>
          <div class="sm:hidden" style="padding: 10px 0;">
            <div class="flex items-center justify-between mb-1">
              <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ c.campaignName || c.campaignId }}</span>
              <span :style="{ fontSize: '14px', fontWeight: 600, color: c.loginRate > 30 ? '#C4343A' : 'var(--dash-text-faint)' }" class="tabular-nums">{{ c.loginRate }}% login</span>
            </div>
            <div class="flex items-center gap-3" style="font-size: 14px; color: var(--dash-text-faint);">
              <span>{{ c.landingPage }}</span>
              <span class="tabular-nums">{{ c.visitors }} vis</span>
              <span class="tabular-nums">{{ c.converters }} conv ({{ c.convRate }}%)</span>
              <span class="tabular-nums">{{ c.loggers }} login</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/ad-roi?days=${period.value}`, { watch: [period, refreshKey] })
const channels = computed(() => (data.value as any)?.channels ?? [])
const campaigns = computed(() => (data.value as any)?.campaigns ?? [])
const totals = computed(() => (data.value as any)?.totals ?? {})
</script>
