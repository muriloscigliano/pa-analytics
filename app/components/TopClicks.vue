<template>
  <div class="dash-card">
    <h2 class="dash-title">CTA Clicks by Page</h2>
    <p class="dash-help">Every button, link, and CTA people click on, grouped by which page it happened. Shows what text was clicked, where it links to, total clicks, and unique users. Use this to see which pages and CTAs drive the most action.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-for="(group, page) in grouped" :key="page" style="margin-bottom: 24px;">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px;">{{ page || '/' }}</p>
        <div>
          <div v-for="(click, i) in group" :key="i" class="flex flex-wrap items-center justify-between gap-1" :style="{ padding: '14px 0', borderBottom: i < group.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
            <div class="flex items-center gap-3">
              <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ click.text || 'Link click' }}</span>
              <span v-if="click.linkTo" style="font-size: 14px; color: var(--dash-text-ghost);">→ {{ click.linkTo }}</span>
            </div>
            <div class="flex items-center gap-4">
              <span style="font-size: 14px; color: var(--dash-text-faint);">{{ click.users }} users</span>
              <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ click.clicks }}</span>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-if="Object.keys(grouped).length === 0" title="Waiting for clicks" description="Button clicks, CTA interactions, and link clicks will appear here grouped by page as visitors engage with the website." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/clicks?days=${period.value}`, { watch: [period, refreshKey] })

const grouped = computed(() => {
  const results = (data.value as any)?.results ?? []
  const groups: Record<string, Array<{ text: string; linkTo: string; clicks: number; users: number }>> = {}
  for (const [page, buttonText, linkTo, clicks, users] of results) {
    const key = page || '/'
    if (!groups[key]) groups[key] = []
    groups[key].push({
      text: buttonText?.trim() || '',
      linkTo: linkTo || '',
      clicks,
      users,
    })
  }
  return groups
})
</script>
