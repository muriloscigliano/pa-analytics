<template>
  <div class="dash-card">
    <h2 class="dash-title">Traffic Sources</h2>
    <p class="dash-help">Where visitors actually come from — paid search, organic, social, direct. Paid is detected by gclid/msclkid on the landing URL, since ad clicks often strip the referrer. Existing customers who came just to log in are filtered out, matching Entry Pages.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!sources.length" title="Waiting for traffic" description="Traffic breakdown will appear once pageview events start flowing." />
    <div v-else>
      <div v-for="(s, i) in sources" :key="i" :style="{ padding: '14px 0', borderBottom: i < sources.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <div class="flex items-center justify-between" style="margin-bottom: 8px;">
          <div class="flex items-center gap-2">
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-body);">{{ s.channel }}</span>
            <span style="font-size: 14px; color: var(--dash-text-ghost);" class="tabular-nums">{{ s.share }}%</span>
          </div>
          <div class="flex items-center gap-4 flex-wrap justify-end">
            <span style="font-size: 14px; color: var(--dash-text-faint);" class="tabular-nums">{{ s.converters }} converters</span>
            <span style="font-size: 14px; font-weight: 600;" :style="{ color: s.isBestRate ? 'var(--dash-accent)' : 'var(--dash-text-body)' }" class="tabular-nums">{{ s.rate }}%</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); min-width: 60px; text-align: right;" class="tabular-nums">{{ s.visitors.toLocaleString() }}</span>
          </div>
        </div>
        <div class="progress-track"><div class="progress-fill" :style="{ width: s.pct + '%', background: s.isBestRate ? 'var(--dash-accent)' : undefined }" /></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/traffic-sources?days=${period.value}`, { watch: [period, refreshKey] })

const sources = computed(() => {
  const rows = ((data.value as any)?.results ?? []) as [string, number, number, number][]
  if (!rows.length) return []
  const maxVisitors = rows[0]?.[1] || 1
  const totalVisitors = rows.reduce((s, r) => s + (r[1] || 0), 0) || 1
  const maxRate = Math.max(...rows.map(r => r[3] || 0), 0)
  return rows.map(([channel, visitors, converters, rate]) => ({
    channel, visitors, converters, rate,
    pct: Math.round((visitors / maxVisitors) * 100),
    share: Math.round((visitors / totalVisitors) * 100),
    isBestRate: rate === maxRate && rate > 0,
  }))
})
</script>
