<template>
  <div class="dash-card">
    <h2 class="dash-title">Traffic vs Conversion by Day</h2>
    <p class="dash-help">The busiest day isn't always the best converting day. Compare traffic volume (▲) against conversion rate (★) — when they don't match, it's a signal about visitor intent at different times of week.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!dayData.some(d => d.pageviews > 0)" title="Waiting for traffic data" description="Daily traffic patterns will appear once pageviews start flowing." />
    <div v-else>
      <!-- Two parallel stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" style="margin-bottom: 16px;">
        <StatBox :value="trafficLeader.name" :label="`▲ Most traffic · ${trafficLeader.pageviews.toLocaleString()} views, ${trafficLeader.rate}% rate`" />
        <StatBox :value="rateLeader.name" :label="`★ Best conversion · ${rateLeader.rate}% rate, ${rateLeader.pageviews.toLocaleString()} views`" accent />
      </div>

      <!-- Insight callout when peak day != best rate day -->
      <p v-if="insight" style="font-size: 14px; color: var(--dash-text-body); line-height: 1.55; padding: 12px 14px; background: var(--dash-accent-soft); border: 1px solid var(--dash-accent); border-radius: 8px; margin-bottom: 24px;">
        {{ insight }}
      </p>

      <!-- Day rows -->
      <div v-for="(d, i) in dayData" :key="i" class="flex items-center gap-3" :style="{ padding: '10px 0', borderBottom: i < dayData.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <span style="font-size: 14px; color: var(--dash-text-body); min-width: 110px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
          {{ d.name }}
          <span v-if="d.isPeak" style="font-size: 14px; color: var(--dash-text-faint);" title="Most traffic">▲</span>
          <span v-if="d.isBestRate" style="font-size: 14px; color: var(--dash-accent);" title="Best conversion">★</span>
        </span>
        <div style="flex: 1;">
          <div class="progress-track" style="height: 6px;"><div class="progress-fill" :style="{ width: d.pct + '%', background: d.isPeak ? 'var(--dash-text-faint)' : undefined }" /></div>
        </div>
        <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); min-width: 48px; text-align: right;" class="tabular-nums">{{ d.pageviews.toLocaleString() }}</span>
        <span style="font-size: 14px; color: var(--dash-text-faint); min-width: 64px; text-align: right;" class="tabular-nums">{{ d.users.toLocaleString() }} users</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); min-width: 56px; text-align: right;" class="tabular-nums">{{ d.forms }} forms</span>
        <span style="font-size: 14px; font-weight: 600; min-width: 56px; text-align: right;" :style="{ color: d.isBestRate ? 'var(--dash-accent)' : 'var(--dash-text-primary)' }" class="tabular-nums">{{ d.rate }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/traffic-by-day?days=${period.value}`, { watch: [period, refreshKey] })

const dayData = computed(() => {
  const results = (data.value as any)?.results ?? []
  const map: Record<number, { pageviews: number; users: number; forms: number }> = {}
  for (const [dow, pageviews, users, forms] of results) {
    map[dow] = { pageviews, users, forms }
  }
  const max = Math.max(...Object.values(map).map(v => v.pageviews), 1)
  const base = Array.from({ length: 7 }, (_, i) => {
    const d = map[i + 1] || { pageviews: 0, users: 0, forms: 0 }
    const rate = d.users > 0 ? Math.round((d.forms / d.users) * 1000) / 10 : 0
    return {
      dow: i + 1,
      name: DAY_NAMES[i],
      pageviews: d.pageviews,
      users: d.users,
      forms: d.forms,
      rate,
      pct: Math.round((d.pageviews / max) * 100),
      isPeak: false,
      isBestRate: false,
    }
  })
  const maxPv = Math.max(...base.map(d => d.pageviews), 0)
  const maxRate = Math.max(...base.map(d => d.rate), 0)
  return base.map(d => ({
    ...d,
    isPeak: d.pageviews === maxPv && d.pageviews > 0,
    isBestRate: d.rate === maxRate && maxRate > 0,
  }))
})

const trafficLeader = computed(() => {
  return dayData.value.reduce((best, d) => d.pageviews > best.pageviews ? d : best, dayData.value[0])
})

const rateLeader = computed(() => {
  const active = dayData.value.filter(d => d.users > 0)
  if (!active.length) return dayData.value[0]
  return active.reduce((best, d) => d.rate > best.rate ? d : best, active[0])
})

const insight = computed(() => {
  const t = trafficLeader.value
  const r = rateLeader.value
  if (!t || !r || t.name === r.name) return null
  const liftRatio = t.rate > 0 ? Math.round((r.rate / t.rate) * 10) / 10 : 0
  const trafficGapPct = t.pageviews > 0 ? Math.round((1 - r.pageviews / t.pageviews) * 100) : 0
  if (liftRatio < 1.2) return null
  return `${r.name} converts ${liftRatio}× better than ${t.name} despite getting ${trafficGapPct}% less traffic. Worth shifting some weekday spend toward weekend prospects, or investigating why weekday visitors aren't converting.`
})
</script>
