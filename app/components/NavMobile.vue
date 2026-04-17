<template>
  <div class="dash-card">
    <h2 class="dash-title flex items-center gap-2">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--dash-text-faint); flex-shrink: 0;"><rect x="6" y="2" width="12" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
      <span>Mobile Navigation</span>
    </h2>
    <p class="dash-help">Mobile menu opens, link clicks, and how many menu users went on to submit a form.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!d?.mobile?.summary?.total" title="Waiting for mobile menu data" description="Data appears once mobile_menu_toggled and menu_link_clicked events fire." />
    <div v-else>
      <!-- Summary + conversion -->
      <div class="grid grid-cols-3 gap-3" style="margin-bottom: 20px;">
        <StatBox :value="d.mobile.summary.total" label="Opens" />
        <StatBox :value="d.mobile.summary.users" label="Users" />
        <StatBox :value="d.mobile.conversion.rate + '%'" label="Conv. rate" accent />
      </div>
      <p style="font-size: 14px; color: var(--dash-text-faint); margin-bottom: 12px;">
        <span class="tabular-nums" style="color: var(--dash-text-body); font-weight: 600;">{{ d.mobile.conversion.converters }}</span>
        of
        <span class="tabular-nums" style="color: var(--dash-text-body); font-weight: 600;">{{ d.mobile.conversion.clickers }}</span>
        link clickers submitted a form.
      </p>

      <!-- Link list -->
      <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">Top Link Clicks</p>
      <div v-if="d.mobile.links.length">
        <div v-for="(row, i) in d.mobile.links" :key="i" class="flex items-center justify-between gap-2" :style="{ padding: '10px 0', borderBottom: i < d.mobile.links.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <div class="min-w-0">
            <p style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);" class="truncate">{{ row.link_name || formatPath(row.destination) }}</p>
            <p v-if="row.destination && row.link_name" style="font-size: 14px; color: var(--dash-text-ghost);" class="truncate">→ {{ row.destination }}</p>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <span style="font-size: 14px; color: var(--dash-text-faint);" class="tabular-nums">{{ row.users }}</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.clicks }}</span>
          </div>
        </div>
      </div>
      <p v-else style="font-size: 14px; color: var(--dash-text-ghost);">No link clicks yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data: d, pending, error, refresh } = useFetch(() => `/api/posthog/nav-engagement?days=${period.value}`, { watch: [period, refreshKey] })

function formatPath(path: string | null): string {
  if (!path) return 'Link'
  const clean = path.replace(/^\//, '').replace(/#.*$/, '').replace(/\/$/, '')
  if (!clean) return 'Home'
  return clean.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
</script>
