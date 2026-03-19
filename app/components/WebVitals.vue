<template>
  <div class="dash-card">
    <h2 class="dash-title">Web Vitals</h2>
    <p class="dash-help">Core performance metrics. FCP = first content paint, LCP = largest content paint, CLS = layout shift, INP = interaction delay. Green = good, red = needs fixing.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="m in metrics" :key="m.label" style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
        <p style="font-size: 14px; font-weight: 500; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em;">{{ m.label }}</p>
        <p style="font-size: clamp(18px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary); margin-top: 10px;" class="tabular-nums">{{ m.display }}</p>
        <span class="pill mt-2" :class="m.pillClass">{{ m.status }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/web-vitals?days=${period.value}`, { watch: [period, refreshKey] })
function getVital(label: string, value: number | null) {
  if (value === null) return { status: 'No data', pillClass: 'pill-neutral' }
  const t: Record<string, [number, number]> = { FCP: [1800, 3000], LCP: [2500, 4000], CLS: [0.1, 0.25], INP: [200, 500] }
  const [g, p] = t[label] || [0, 0]
  if (value <= g) return { status: 'Good', pillClass: 'pill-success' }
  if (value <= p) return { status: 'Needs work', pillClass: 'pill-warning' }
  return { status: 'Poor', pillClass: 'pill-danger' }
}
const metrics = computed(() => {
  const r = (data.value as any)?.results?.[0]; if (!r) return []
  const [fcp, lcp, cls, inp] = r
  return [
    { label: 'FCP', display: fcp != null ? `${Math.round(fcp)}ms` : '-', ...getVital('FCP', fcp) },
    { label: 'LCP', display: lcp != null ? `${Math.round(lcp)}ms` : '-', ...getVital('LCP', lcp) },
    { label: 'CLS', display: cls != null ? cls.toFixed(4) : '-', ...getVital('CLS', cls) },
    { label: 'INP', display: inp != null ? `${Math.round(inp)}ms` : '-', ...getVital('INP', inp) },
  ]
})
</script>
