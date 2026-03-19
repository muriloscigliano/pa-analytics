<template>
  <div class="dash-card">
    <h2 class="dash-title">Menu Navigation</h2>
    <p class="dash-help">Navigation clicks from menus — mega menu, mobile menu, and header links. Shows which menu items drive the most traffic and from which pages.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="Object.keys(grouped).length > 0">
        <div v-for="(group, page) in grouped" :key="page" style="margin-bottom: 24px;">
          <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px;">From: {{ page || '/' }}</p>
          <div>
            <div v-for="(nav, i) in group" :key="i" class="flex items-center justify-between" :style="{ padding: '14px 0', borderBottom: i < group.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
              <div class="flex items-center gap-3">
                <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ nav.menuItem || 'Link click' }}</span>
                <span v-if="nav.linkTo" style="font-size: 14px; color: var(--dash-text-ghost);">→ {{ nav.linkTo }}</span>
              </div>
              <div class="flex items-center gap-4">
                <span style="font-size: 14px; color: var(--dash-text-faint);">{{ nav.users }} users</span>
                <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ nav.clicks }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else title="Waiting for menu clicks" description="Mega menu opens, mobile menu toggles, and navigation link clicks will appear here as visitors interact with the site menus." />
    </div>
  </div>
</template>

<script setup lang="ts">
const period = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/menu-navigation?days=${period.value}`, { watch: [period] })

const grouped = computed(() => {
  const results = (data.value as any)?.results ?? []
  const groups: Record<string, Array<{ menuItem: string; linkTo: string; clicks: number; users: number }>> = {}
  for (const [menuItem, linkTo, fromPage, clicks, users] of results) {
    const key = fromPage || '/'
    if (!groups[key]) groups[key] = []
    groups[key].push({ menuItem, linkTo, clicks, users })
  }
  return groups
})
</script>
