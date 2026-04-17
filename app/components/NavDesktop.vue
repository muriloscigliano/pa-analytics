<template>
  <div class="dash-card">
    <h2 class="dash-title flex items-center gap-2">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--dash-text-faint); flex-shrink: 0;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
      <span>Desktop Navigation</span>
    </h2>
    <p class="dash-help">Mega-menu category opens, link clicks, and how many menu users went on to submit a form.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!d?.desktop?.summary?.total && !d?.desktop?.links?.length" title="Waiting for desktop menu data" description="Data appears once menu_opened and menu_link_clicked events fire on desktop." />
    <div v-else>
      <!-- Summary + conversion -->
      <div class="grid grid-cols-3 gap-3" style="margin-bottom: 20px;">
        <StatBox :value="d.desktop.summary.total" label="Opens" />
        <StatBox :value="d.desktop.summary.users" label="Users" />
        <StatBox :value="d.desktop.conversion.rate + '%'" label="Conv. rate" accent />
      </div>
      <p style="font-size: 14px; color: var(--dash-text-faint); margin-bottom: 12px;">
        <span class="tabular-nums" style="color: var(--dash-text-body); font-weight: 600;">{{ d.desktop.conversion.converters }}</span>
        of
        <span class="tabular-nums" style="color: var(--dash-text-body); font-weight: 600;">{{ d.desktop.conversion.clickers }}</span>
        link clickers submitted a form.
      </p>

      <!-- Categories -->
      <div v-if="d.desktop.categories.length" style="margin-bottom: 20px;">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">Categories Opened</p>
        <div v-for="(row, i) in d.desktop.categories" :key="i" class="flex items-center justify-between" :style="{ padding: '8px 0', borderBottom: i < d.desktop.categories.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ row.name }}</span>
          <div class="flex items-center gap-3">
            <span style="font-size: 14px; color: var(--dash-text-faint);" class="tabular-nums">{{ row.users }}</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.opens }}</span>
          </div>
        </div>
      </div>

      <!-- Links -->
      <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">Top Link Clicks</p>
      <div v-if="d.desktop.links.length">
        <div v-for="(row, i) in d.desktop.links" :key="i" class="flex items-center justify-between gap-2" :style="{ padding: '10px 0', borderBottom: i < d.desktop.links.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
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
