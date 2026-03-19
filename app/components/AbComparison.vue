<template>
  <div class="dash-card">
    <h2 class="dash-title">A/B Variant Comparison</h2>
    <p class="dash-help">Side-by-side comparison of how each A/B test variant performs across all event types. Higher numbers in a variant suggest better engagement.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div class="grid gap-4 mb-5" :style="{ gridTemplateColumns: `repeat(${variantNames.length}, 1fr)` }">
        <div v-for="name in variantNames" :key="name" style="text-align: center; border-radius: 8px; padding: 12px; background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card);">
          <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-body);">{{ name }}</p>
        </div>
      </div>
      <div class="space-y-1">
        <div v-for="eventName in eventNames" :key="eventName" class="grid items-center gap-4" :style="{ gridTemplateColumns: `repeat(${variantNames.length}, 1fr)`, borderBottom: '1px solid var(--dash-border-row)', padding: '10px 0' }">
          <div v-for="name in variantNames" :key="name" class="flex items-center justify-between px-3">
            <span style="font-size: 14px; color: var(--dash-text-faint); text-transform: capitalize;">{{ formatEvent(eventName) }}</span>
            <div class="text-right">
              <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ getCount(name, eventName) }}</span>
              <span style="font-size: 14px; color: var(--dash-text-faint); margin-left: 4px;">({{ getUsers(name, eventName) }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const period = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/ab-comparison?days=${period.value}`, { watch: [period] })
interface Row { variant: string; event: string; total: number; users: number }
const rows = computed<Row[]>(() => ((data.value as any)?.results ?? []).map(([variant, event, total, users]: [string, string, number, number]) => ({ variant, event, total, users })))
const variantNames = computed(() => [...new Set(rows.value.map(r => r.variant))])
const eventNames = computed(() => [...new Set(rows.value.map(r => r.event))])
function getCount(v: string, e: string) { return rows.value.find(r => r.variant === v && r.event === e)?.total ?? 0 }
function getUsers(v: string, e: string) { return rows.value.find(r => r.variant === v && r.event === e)?.users ?? 0 }
function formatEvent(n: string) { return n.replace(/^\$/, '').replace(/_/g, ' ') }
</script>
