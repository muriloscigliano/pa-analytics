<template>
  <div class="dash-card">
    <h2 class="dash-title">Login vs Browsing</h2>
    <p class="dash-help">What percentage of visitors click Login (existing customers) vs browse the site (prospects). Helps understand how much of your traffic is already converted vs looking at your services.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <EmptyState v-if="loginUsers === 0 && totalVisitors === 0" title="Waiting for login data" description="Login vs browsing data will appear once login_clicked events start firing from the website." />
      <div v-else>
        <!-- Rate cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" style="margin-bottom: 24px;">
          <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 16px; text-align: center;">
            <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ totalVisitors }}</p>
            <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 6px;">Total Visitors</p>
          </div>
          <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 16px; text-align: center;">
            <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ loginUsers }}</p>
            <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 6px;">Clicked Login</p>
          </div>
          <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 16px; text-align: center;">
            <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-accent);" class="tabular-nums">{{ loginRate }}%</p>
            <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 6px;">Existing Customers</p>
          </div>
          <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 16px; text-align: center;">
            <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ browseRate }}%</p>
            <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 6px;">Prospects</p>
          </div>
        </div>

        <!-- Bar visualization -->
        <div style="height: 8px; border-radius: 4px; overflow: hidden; display: flex; margin-bottom: 20px;">
          <div :style="{ width: loginRate + '%', background: 'var(--dash-accent)' }" />
          <div :style="{ width: browseRate + '%', background: 'var(--dash-border-card)' }" />
        </div>

        <!-- Device breakdown -->
        <p v-if="rows.length > 0" style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px;">Login by Device</p>
        <div v-for="(row, i) in rows" :key="i" class="flex items-center justify-between" :style="{ padding: '12px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-body);">{{ row.device || 'Unknown' }}</span>
          <div class="flex items-center gap-4">
            <span style="font-size: 14px; color: var(--dash-text-faint);" class="tabular-nums">{{ row.users }} users</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.clicks }} clicks</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/login-clicks?days=${period.value}`, { watch: [period, refreshKey] })

const rows = computed(() =>
  ((data.value as any)?.byDevice?.results ?? []).map(([device, clicks, users]: [string, number, number]) => ({
    device, clicks, users,
  }))
)

const totalVisitors = computed(() => (data.value as any)?.totalVisitors ?? 0)

const loginUsers = computed(() =>
  rows.value.reduce((sum: number, r: any) => sum + r.users, 0)
)

const loginRate = computed(() => {
  if (totalVisitors.value === 0) return '0'
  return ((loginUsers.value / totalVisitors.value) * 100).toFixed(1)
})

const browseRate = computed(() => {
  if (totalVisitors.value === 0) return '0'
  return (100 - parseFloat(loginRate.value)).toFixed(1)
})
</script>
