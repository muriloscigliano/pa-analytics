<template>
  <div class="table-container">
    <div style="padding: 24px 24px 0;">
      <h2 class="dash-title">Top Pages</h2>
      <p class="dash-help">Most visited URLs ranked by total views. "Visitors" counts unique people, so one person viewing a page 5 times = 5 views but 1 visitor.</p>
    </div>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else class="table-scroll-wrapper">
      <table class="modern-table">
        <thead><tr><th>#</th><th>URL</th><th class="text-right">Views</th><th class="text-right">Visitors</th></tr></thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="i">
            <td style="color: var(--dash-text-ghost);">{{ i + 1 }}</td>
            <td class="max-w-xs truncate" :title="row.url">{{ row.url }}</td>
            <td class="text-right tabular-nums" style="font-weight: 600; color: var(--dash-text-primary);">{{ row.views.toLocaleString() }}</td>
            <td class="text-right tabular-nums">{{ row.uniqueVisitors.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
      <EmptyState v-if="rows.length === 0" title="Waiting for page views" description="Top pages ranked by views will appear here once visitors start browsing the website." />
    </div>
  </div>
</template>

<script setup lang="ts">
const period = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/top-pages?days=${period.value}&limit=10`, { watch: [period] })
const rows = computed(() => ((data.value as any)?.results ?? []).map(([url, views, uniqueVisitors]: [string, number, number]) => ({ url, views, uniqueVisitors })))
</script>
