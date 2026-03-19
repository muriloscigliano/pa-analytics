<template>
  <div class="dash-card">
    <h2 class="dash-title">Section Engagement</h2>
    <p class="dash-help">Each row shows a section on your website. "Views" = total times it was seen (includes repeat visits). "Users" = unique people who saw it. A big gap between views and users means people keep coming back to that section. Sections with fewer views are further down the page — fewer people scroll there.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-for="(group, page) in grouped" :key="page" style="margin-bottom: 24px;">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px;">{{ page || '/' }}</p>
        <div>
          <div v-for="(s, i) in group" :key="i" class="flex items-center" :style="{ padding: '14px 0', borderBottom: i < group.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
            <!-- Rank -->
            <span style="font-size: 14px; color: var(--dash-text-ghost); min-width: 28px;" class="tabular-nums">{{ i + 1 }}</span>
            <!-- Section name -->
            <span style="font-size: 14px; color: var(--dash-text-body); flex: 1;">{{ s.name }}</span>
            <!-- Bar -->
            <div style="width: 200px; margin: 0 20px;">
              <div class="progress-track" style="height: 6px;">
                <div class="progress-fill" :style="{ width: s.pct + '%' }" />
              </div>
            </div>
            <!-- Views -->
            <div class="text-right" style="min-width: 70px;">
              <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ s.views }}</span>
              <span style="font-size: 14px; color: var(--dash-text-ghost); margin-left: 4px;">views</span>
            </div>
            <!-- Users -->
            <div class="text-right" style="min-width: 80px;">
              <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ s.uniqueUsers }}</span>
              <span style="font-size: 14px; color: var(--dash-text-ghost); margin-left: 4px;">users</span>
            </div>
            <!-- Avg views per user -->
            <div class="text-right" style="min-width: 60px;">
              <span style="font-size: 14px; color: #C4343A; font-weight: 500;" class="tabular-nums">{{ s.avgPerUser }}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const period = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/sections?days=${period.value}`, { watch: [period] })
const grouped = computed(() => {
  const results = (data.value as any)?.results ?? []
  const max = results[0]?.[2] || 1
  const groups: Record<string, Array<{ name: string; views: number; uniqueUsers: number; pct: number; avgPerUser: string }>> = {}
  for (const [name, page, views, uniqueUsers] of results) {
    const key = page || '/'
    if (!groups[key]) groups[key] = []
    const avg = uniqueUsers > 0 ? (views / uniqueUsers).toFixed(1) : '0'
    groups[key].push({ name, views, uniqueUsers, pct: Math.round((views / max) * 100), avgPerUser: avg })
  }
  return groups
})
</script>
