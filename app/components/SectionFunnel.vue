<template>
  <div class="dash-card">
    <h2 class="dash-title">Section to Conversion Funnel</h2>
    <p class="dash-help">Tracks the journey from viewing content sections to clicking CTAs to submitting forms. Shows how content engagement drives conversions.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="steps.length > 0" class="space-y-5">
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
      <EmptyState v-else title="Waiting for funnel data" description="Section conversion funnel will populate once section_viewed, cta_clicked, and form_submitted events are all flowing." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/section-funnel?days=${period.value}`, { watch: [period, refreshKey] })

const steps = computed(() => {
  const results = (data.value as any)?.results ?? []
  if (results.length === 0) return []
  const total = results[0]?.[1] || 1
  return results.map(([name, count]: [string, number], i: number) => ({
    name,
    count,
    rate: Math.round((count / total) * 100),
    dropoff: i < results.length - 1 ? Math.round(((count - results[i + 1][1]) / count) * 100) : 0,
  }))
})
</script>
