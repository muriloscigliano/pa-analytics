<template>
  <div class="dash-card">
    <h2 class="dash-title">Page Flow Explorer</h2>
    <p class="dash-help">Where do visitors go from each page? Select a starting page to see where people navigate next.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!flows.length" title="No flow data yet" description="Page flow data will appear once visitors start navigating between pages." />
    <div v-else>
      <!-- Context stats -->
      <div v-if="stats.totalVisitors" class="grid grid-cols-3 gap-3 sm:gap-4" style="margin-bottom: 24px;">
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ stats.totalVisitors }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Total Visitors</p>
        </div>
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ stats.singlePage }} <span style="font-size: 14px; font-weight: 400; color: var(--dash-text-ghost);">({{ singlePct }}%)</span></p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Bounced (1 page)</p>
        </div>
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: #C4343A;" class="tabular-nums">{{ stats.multiPage }} <span style="font-size: 14px; font-weight: 400; color: var(--dash-text-ghost);">({{ multiPct }}%)</span></p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Navigated (2+ pages)</p>
        </div>
      </div>

      <!-- Page filter -->
      <div style="margin-bottom: 24px;">
        <div class="flex flex-wrap gap-2">
          <button
            @click="selectedPage = ''"
            :style="{
              fontSize: '14px', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', border: '1px solid ' + (!selectedPage ? '#C4343A' : 'var(--dash-border-card)'),
              background: !selectedPage ? 'rgba(196,52,58,0.08)' : 'var(--dash-bg-inset)',
              color: !selectedPage ? '#C4343A' : 'var(--dash-text-body)', fontWeight: !selectedPage ? 600 : 400
            }"
          >All pages</button>
          <button
            v-for="p in topPages" :key="p.page"
            @click="selectedPage = p.page"
            :style="{
              fontSize: '14px', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', border: '1px solid ' + (selectedPage === p.page ? '#C4343A' : 'var(--dash-border-card)'),
              background: selectedPage === p.page ? 'rgba(196,52,58,0.08)' : 'var(--dash-bg-inset)',
              color: selectedPage === p.page ? '#C4343A' : 'var(--dash-text-body)', fontWeight: selectedPage === p.page ? 600 : 400
            }"
          >{{ p.page }}</button>
        </div>
      </div>

      <!-- Table header -->
      <div class="hidden sm:flex items-center" style="padding: 0 0 10px; border-bottom: 1px solid var(--dash-border-row); margin-bottom: 4px;">
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 200px;">From</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 40px; text-align: center;"></span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); flex: 1;">To</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 80px; text-align: right;">Visits</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 70px; text-align: right;">People</span>
        <span style="font-size: 14px; color: var(--dash-text-ghost); width: 60px; text-align: right;">Share</span>
      </div>

      <!-- Flow rows -->
      <div v-for="(flow, i) in flows" :key="i" :style="{ borderBottom: i < flows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
        <!-- Desktop -->
        <div class="hidden sm:flex items-center" style="padding: 10px 0;">
          <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-body); width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ flow.from }}</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 40px; text-align: center;">→</span>
          <div style="flex: 1; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ flow.to }}</span>
          </div>
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); width: 80px; text-align: right;" class="tabular-nums">{{ flow.transitions }}</span>
          <span style="font-size: 14px; color: var(--dash-text-faint); width: 70px; text-align: right;" class="tabular-nums">{{ flow.users }}</span>
          <span style="font-size: 14px; color: var(--dash-text-faint); width: 60px; text-align: right;" class="tabular-nums">{{ flow.pct }}%</span>
        </div>
        <!-- Mobile -->
        <div class="sm:hidden" style="padding: 10px 0;">
          <div class="flex items-center justify-between mb-1">
            <span style="font-size: 14px; color: var(--dash-text-body);">{{ flow.from }}</span>
            <span style="font-size: 14px; color: var(--dash-text-faint);" class="tabular-nums">{{ flow.pct }}%</span>
          </div>
          <div class="flex items-center gap-2">
            <span style="font-size: 14px; color: var(--dash-text-ghost);">→</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);">{{ flow.to }}</span>
            <span style="font-size: 14px; color: var(--dash-text-faint);" class="tabular-nums">{{ flow.transitions }}x · {{ flow.users }} ppl</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const selectedPage = ref('')

const { data, pending, error, refresh } = useFetch(
  () => `/api/posthog/page-flow?days=${period.value}${selectedPage.value ? '&from=' + encodeURIComponent(selectedPage.value) : ''}`,
  { watch: [period, refreshKey, selectedPage] }
)

const stats = computed(() => (data.value as any)?.stats ?? { totalVisitors: 0, singlePage: 0, multiPage: 0 })

const singlePct = computed(() => {
  if (!stats.value.totalVisitors) return '0'
  return Math.round((stats.value.singlePage / stats.value.totalVisitors) * 100)
})

const multiPct = computed(() => {
  if (!stats.value.totalVisitors) return '0'
  return Math.round((stats.value.multiPage / stats.value.totalVisitors) * 100)
})

const topPages = computed(() => {
  const pages = (data.value as any)?.pages ?? []
  return pages.slice(0, 8)
})

const flows = computed(() => {
  const raw = (data.value as any)?.flows ?? []
  const max = raw[0]?.transitions || 1
  return raw.map((f: any) => ({
    ...f,
    pct: Math.round((f.transitions / max) * 100),
  }))
})
</script>
