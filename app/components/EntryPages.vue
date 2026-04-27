<template>
  <div class="dash-card">
    <h2 class="dash-title">Entry Pages</h2>
    <p class="dash-help">The first page each visitor sees when they arrive, split by how they got there. Existing customers who just came to log in are filtered out.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!rows.length" title="Waiting for entry data" description="Entry page data will appear once pageview events start flowing." />
    <div v-else>
      <!-- Header -->
      <div class="entry-row entry-row--head">
        <span class="entry-row__th">Page</span>
        <span class="entry-row__th hidden sm:inline-block">Share</span>
        <span class="entry-row__th entry-row__th--right">Total</span>
        <span class="entry-row__th entry-row__th--right">Paid</span>
        <span class="entry-row__th entry-row__th--right">Organic</span>
        <span class="entry-row__th entry-row__th--right">Direct</span>
        <span class="entry-row__th entry-row__th--right">Other</span>
      </div>

      <div v-for="(r, i) in rows" :key="i" class="entry-row" :style="{ borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <span class="entry-row__page">{{ r.page }}</span>
        <div class="entry-row__bar hidden sm:block">
          <div class="progress-track" style="height: 6px;"><div class="progress-fill" :style="{ width: r.pct + '%' }" /></div>
        </div>
        <span class="entry-row__total tabular-nums">{{ r.total.toLocaleString() }}</span>
        <span class="entry-row__cell tabular-nums"><strong>{{ r.paid }}</strong> <span class="entry-row__pct">{{ r.paidPct }}%</span></span>
        <span class="entry-row__cell tabular-nums"><strong>{{ r.organic }}</strong> <span class="entry-row__pct">{{ r.organicPct }}%</span></span>
        <span class="entry-row__cell tabular-nums"><strong>{{ r.direct }}</strong> <span class="entry-row__pct">{{ r.directPct }}%</span></span>
        <span class="entry-row__cell tabular-nums"><strong>{{ r.other }}</strong> <span class="entry-row__pct">{{ r.otherPct }}%</span></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/entry-pages?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() => {
  const results = (data.value as any)?.results ?? []
  const max = results[0]?.[1] || 1
  return results.map(([page, total, paid, organic, direct, other]: any[]) => {
    const t = total || 1
    return {
      page: page || '/',
      total: total || 0,
      paid: paid || 0,
      organic: organic || 0,
      direct: direct || 0,
      other: other || 0,
      paidPct: Math.round(((paid || 0) / t) * 100),
      organicPct: Math.round(((organic || 0) / t) * 100),
      directPct: Math.round(((direct || 0) / t) * 100),
      otherPct: Math.round(((other || 0) / t) * 100),
      pct: Math.round(((total || 0) / max) * 100),
    }
  })
})
</script>

<style scoped>
.entry-row {
  display: grid;
  grid-template-columns: minmax(160px, 1.2fr) 120px 72px repeat(4, 90px);
  align-items: center;
  column-gap: 16px;
  padding: 12px 0;
}
.entry-row--head {
  padding: 0 0 10px;
  border-bottom: 1px solid var(--dash-border-row);
  margin-bottom: 4px;
}
.entry-row__th {
  font-size: 14px;
  color: var(--dash-text-ghost);
  font-weight: 500;
  letter-spacing: 0.02em;
}
.entry-row__th--right { text-align: right; }
.entry-row__page {
  font-size: 14px;
  color: var(--dash-text-body);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.entry-row__bar { width: 120px; }
.entry-row__total {
  font-size: 16px;
  font-weight: 700;
  color: var(--dash-accent);
  text-align: right;
}
.entry-row__cell {
  font-size: 14px;
  color: var(--dash-text-faint);
  text-align: right;
}
.entry-row__cell strong {
  color: var(--dash-text-primary);
  font-weight: 600;
}
.entry-row__pct {
  color: var(--dash-text-ghost);
  margin-left: 4px;
}

@media (max-width: 900px) {
  .entry-row {
    grid-template-columns: 1fr 60px repeat(4, 1fr);
    column-gap: 8px;
  }
  .entry-row__bar { display: none; }
  .entry-row__th:nth-of-type(2) { display: none; }
}
</style>
