<template>
  <div class="dash-card">
    <h2 class="dash-title">Click Heatmap</h2>
    <p class="dash-help">Which elements people actually interact with on each page. Pick a page and an interaction type. Mouse-movement heatmaps aren't captured by your site — only clicks, rage clicks, form changes and submits are tracked.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <!-- Controls -->
      <div class="controls">
        <div class="controls__group">
          <label class="controls__label">Page</label>
          <select v-model="selectedPage" class="controls__select">
            <option v-for="p in d?.pages ?? []" :key="p.page" :value="p.page">{{ p.page }} ({{ p.clicks.toLocaleString() }})</option>
          </select>
        </div>
        <div class="controls__group">
          <label class="controls__label">Type</label>
          <div class="controls__tabs">
            <button
              v-for="t in types"
              :key="t.key"
              class="controls__tab"
              :class="{ 'controls__tab--active': selectedType === t.key }"
              @click="selectedType = t.key"
              type="button"
            >{{ t.label }}</button>
          </div>
        </div>
        <a v-if="selectedPage" :href="`https://us.posthog.com/heatmaps?pageURL=${encodeURIComponent('https://www.payadvantage.com.au' + selectedPage)}`" target="_blank" rel="noopener" class="controls__open">
          Open visual heatmap →
        </a>
      </div>

      <!-- Summary -->
      <div class="summary">
        <span class="summary__primary tabular-nums">{{ (d?.totalEvents ?? 0).toLocaleString() }}</span>
        <span class="summary__muted">{{ typeNoun }} on <code>{{ selectedPage }}</code> from {{ (d?.totalUsers ?? 0).toLocaleString() }} people</span>
      </div>

      <!-- Elements -->
      <EmptyState v-if="!d?.elements?.length" :title="`No ${typeNoun} on this page`" description="Try a different page or interaction type." />
      <div v-else>
        <div v-for="(el, i) in rankedElements" :key="i" class="el-row" :style="{ borderBottom: i < rankedElements.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <span class="el-row__label">{{ el.label }}</span>
          <div class="el-row__bar hidden sm:block">
            <div class="progress-track" style="height: 6px;"><div class="progress-fill" :style="{ width: el.pct + '%' }" /></div>
          </div>
          <span class="el-row__count tabular-nums">{{ el.clicks.toLocaleString() }}</span>
          <span class="el-row__users tabular-nums">{{ el.users }} people</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface HeatmapData {
  page: string
  type: string
  totalEvents: number
  totalUsers: number
  elements: Array<{ label: string; clicks: number; users: number }>
  pages: Array<{ page: string; clicks: number }>
}

const types = [
  { key: 'click', label: 'Clicks', noun: 'clicks' },
  { key: 'rageclick', label: 'Rage clicks', noun: 'rage clicks' },
  { key: 'change', label: 'Form changes', noun: 'field changes' },
  { key: 'submit', label: 'Form submits', noun: 'submits' },
] as const

const { period, refreshKey } = usePeriod()
const selectedPage = ref('/')
const selectedType = ref<(typeof types)[number]['key']>('click')

const url = computed(() => `/api/posthog/click-heatmap?page=${encodeURIComponent(selectedPage.value)}&type=${selectedType.value}&days=${period.value}`)
const { data: d, pending, error, refresh } = useFetch<HeatmapData>(url, { watch: [period, refreshKey, selectedPage, selectedType] })

const typeNoun = computed(() => types.find(t => t.key === selectedType.value)?.noun || 'events')

const rankedElements = computed(() => {
  const els = d.value?.elements ?? []
  if (!els.length) return []
  const max = els[0].clicks || 1
  return els.map(e => ({ ...e, pct: Math.round((e.clicks / max) * 100) }))
})
</script>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  padding: 14px;
  background: var(--dash-bg-inset);
  border: 1px solid var(--dash-border-card);
  border-radius: 12px;
  margin-bottom: 20px;
}
.controls__group { display: flex; flex-direction: column; gap: 6px; }
.controls__label {
  font-size: 14px;
  color: var(--dash-text-ghost);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}
.controls__select {
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--dash-bg-inset);
  border: 1px solid var(--dash-border-card);
  color: var(--dash-text-primary);
  min-width: 240px;
  font-family: inherit;
}
.controls__tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.controls__tab {
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 100px;
  border: 1px solid var(--dash-border-card);
  background: transparent;
  color: var(--dash-text-faint);
  cursor: pointer;
  font-family: inherit;
}
.controls__tab--active {
  color: var(--dash-accent);
  border-color: var(--dash-accent);
  background: var(--dash-accent-soft);
}
.controls__open {
  margin-left: auto;
  font-size: 14px;
  color: var(--dash-text-body);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--dash-border-card);
  background: var(--dash-bg-inset);
  text-decoration: none;
}

.summary {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.summary__primary {
  font-size: 22px;
  font-weight: 700;
  color: var(--dash-accent);
}
.summary__muted { font-size: 14px; color: var(--dash-text-faint); }
.summary__muted code {
  background: var(--dash-bg-inset);
  padding: 1px 6px;
  border-radius: 4px;
  color: var(--dash-text-body);
  font-size: 14px;
}

.el-row {
  display: grid;
  grid-template-columns: 1fr 160px 60px 90px;
  align-items: center;
  column-gap: 16px;
  padding: 10px 0;
}
.el-row__label {
  font-size: 14px;
  color: var(--dash-text-body);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.el-row__count {
  font-size: 14px;
  font-weight: 600;
  color: var(--dash-text-primary);
  text-align: right;
}
.el-row__users {
  font-size: 14px;
  color: var(--dash-text-faint);
  text-align: right;
}
@media (max-width: 700px) {
  .el-row { grid-template-columns: 1fr auto auto; }
  .el-row__bar { display: none; }
}
</style>
