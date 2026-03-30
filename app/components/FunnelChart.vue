<template>
  <div class="dash-card">
    <h2 class="dash-title">Conversion Funnel</h2>
    <p class="dash-help">Unique people at each step of the conversion journey. One person submitting multiple forms still counts as 1. Drop-off % shows where people leave.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else class="space-y-5">
      <div v-for="(step, i) in steps" :key="i">
        <div class="flex items-center justify-between mb-2">
          <span style="font-size: 14px; color: var(--dash-text-body);">{{ step.name }}</span>
          <div class="flex items-center gap-3">
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ step.count }}</span>
            <span class="pill pill-neutral">{{ step.rate }}%</span>
          </div>
        </div>
        <div class="progress-track" style="height: 6px;">
          <div class="progress-fill" :style="{ width: step.rate + '%' }" />
        </div>
        <div v-if="i < steps.length - 1" class="dropoff-label">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          {{ step.dropoff }}% drop-off
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/funnel?days=${period.value}`, { watch: [period, refreshKey] })
const steps = computed(() => {
  if (!data.value || !Array.isArray(data.value)) return []
  const raw = data.value as Array<{ custom_name: string; count: number }>
  const total = raw[0]?.count || 1
  return raw.map((step, i) => ({
    name: step.custom_name, count: step.count,
    rate: Math.round((step.count / total) * 100),
    dropoff: i < raw.length - 1 ? Math.round(((step.count - raw[i + 1].count) / step.count) * 100) : 0,
  }))
})
</script>
