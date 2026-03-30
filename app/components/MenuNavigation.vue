<template>
  <div class="dash-card">
    <h2 class="dash-title">Navigation Engagement</h2>
    <p class="dash-help">Menu link clicks, category opens, and mobile menu usage. Shows how visitors interact with site navigation.</p>
    <LoadingSpinner v-if="pendingLinks || pendingOpened || pendingMobile" />
    <ErrorAlert v-else-if="errorLinks" :message="errorLinks.message" @retry="refreshLinks" />
    <ErrorAlert v-else-if="errorOpened" :message="errorOpened.message" @retry="refreshOpened" />
    <ErrorAlert v-else-if="errorMobile" :message="errorMobile.message" @retry="refreshMobile" />
    <div v-else>
      <!-- Link Clicks -->
      <div style="margin-bottom: 32px;">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px;">Link Clicks</p>
        <div v-if="linkRows.length > 0">
          <div v-for="(row, i) in linkRows" :key="'link-' + i" class="flex flex-wrap items-center justify-between gap-1" :style="{ padding: '14px 0', borderBottom: i < linkRows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
            <div class="flex items-center gap-3">
              <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ row.link_name || 'Link' }}</span>
              <span v-if="row.destination" style="font-size: 14px; color: var(--dash-text-ghost);">→ {{ row.destination }}</span>
              <span v-if="row.menu_source" class="pill pill-neutral">{{ row.menu_source }}</span>
            </div>
            <div class="flex items-center gap-4">
              <span style="font-size: 14px; color: var(--dash-text-faint);">{{ row.users }} users</span>
              <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.clicks }}</span>
            </div>
          </div>
        </div>
        <EmptyState v-else title="Waiting for link clicks" description="Menu link click data will appear once menu_link_clicked events start firing from the website." />
      </div>

      <!-- Menu Categories Opened -->
      <div style="margin-bottom: 32px;">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px;">Menu Categories Opened</p>
        <div v-if="openedRows.length > 0">
          <div v-for="(row, i) in openedRows" :key="'opened-' + i" class="flex flex-wrap items-center justify-between gap-1" :style="{ padding: '14px 0', borderBottom: i < openedRows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
            <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ row.label }}</span>
            <div class="flex items-center gap-4">
              <span style="font-size: 14px; color: var(--dash-text-faint);">{{ row.users }} users</span>
              <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.opens }}</span>
            </div>
          </div>
        </div>
        <EmptyState v-else title="Waiting for menu open data" description="Menu category open events will appear once menu_opened events start firing." />
      </div>

      <!-- Mobile Menu Trend -->
      <div>
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px;">Mobile Menu Trend</p>
        <div v-if="mobileRows.length > 0">
          <div v-for="(row, i) in mobileRows" :key="'mobile-' + i" class="flex flex-wrap items-center justify-between gap-1" :style="{ padding: '14px 0', borderBottom: i < mobileRows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
            <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ row.label }}</span>
            <div class="flex items-center gap-4">
              <span style="font-size: 14px; color: var(--dash-text-faint);">{{ row.users }} users</span>
              <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ row.clicks }}</span>
            </div>
          </div>
        </div>
        <EmptyState v-else title="Waiting for mobile menu data" description="Mobile menu usage data will appear once mobile_menu events start firing." />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()

const { data: linksData, pending: pendingLinks, error: errorLinks, refresh: refreshLinks } = useFetch(() => `/api/posthog/menu-navigation?days=${period.value}`, { watch: [period, refreshKey] })
const { data: openedData, pending: pendingOpened, error: errorOpened, refresh: refreshOpened } = useFetch(() => `/api/posthog/menu-opened?days=${period.value}`, { watch: [period, refreshKey] })
const { data: mobileData, pending: pendingMobile, error: errorMobile, refresh: refreshMobile } = useFetch(() => `/api/posthog/mobile-menu?days=${period.value}`, { watch: [period, refreshKey] })

const linkRows = computed(() =>
  ((linksData.value as any)?.results ?? []).map(([link_name, destination, menu_source, clicks, users]: [string, string, string, number, number]) => ({
    link_name, destination, menu_source, clicks, users,
  }))
)

const openedRows = computed(() =>
  ((openedData.value as any)?.results ?? []).map(([label, opens, users]: [string, number, number]) => ({
    label, opens, users,
  }))
)

const mobileRows = computed(() =>
  ((mobileData.value as any)?.results ?? []).map(([label, clicks, users]: [string, number, number]) => ({
    label, clicks, users,
  }))
)
</script>
