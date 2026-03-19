<template>
  <div class="table-container">
    <div style="padding: 24px 24px 0;">
      <h2 class="dash-title">Scroll Depth &amp; Time on Page</h2>
      <p class="dash-help">How far down visitors scroll and how long they stay on each page. 100% scroll means they reached the bottom. "Content" shows how much of the page content was actually viewed.</p>
    </div>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else class="table-scroll-wrapper">
      <table class="modern-table">
        <thead><tr><th>Page</th><th class="text-right">Avg Scroll</th><th class="text-right">Duration</th><th class="text-right">Content</th><th class="text-right">Samples</th></tr></thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="i">
            <td style="font-weight: 500;">{{ row.page }}</td>
            <td class="text-right">
              <div class="flex items-center justify-end gap-2">
                <div class="progress-track w-16"><div class="progress-fill" :style="{ width: row.scrollPct + '%' }" /></div>
                <span class="tabular-nums" style="font-size: 14px; color: var(--dash-text-body);">{{ row.scrollPct }}%</span>
              </div>
            </td>
            <td class="text-right tabular-nums">{{ row.duration }}s</td>
            <td class="text-right tabular-nums">{{ row.contentPct }}%</td>
            <td class="text-right tabular-nums" style="color: var(--dash-text-faint);">{{ row.samples }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const period = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/scroll-depth?days=${period.value}`, { watch: [period] })
const rows = computed(() => ((data.value as any)?.results ?? []).map(([page, scrollPct, duration, contentPct, samples]: [string, number, number, number, number]) => ({
  page: page || '/', scrollPct: scrollPct ?? 0, duration: duration ?? 0, contentPct: contentPct ?? 0, samples,
})))
</script>
