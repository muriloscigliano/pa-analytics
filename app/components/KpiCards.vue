<template>
  <div class="metrics-grid">
    <KpiCard title="Pageviews" :value="data?.pageviews ?? 0" subtitle="Total page loads" :loading="pending" :error="!!error" />
    <KpiCard title="Unique Users" :value="data?.uniqueUsers ?? 0" subtitle="Distinct visitors" :loading="pending" :error="!!error" />
    <KpiCard title="Signups" :value="data?.signups ?? 0" subtitle="Completed registrations" :loading="pending" :error="!!error" />
    <KpiCard title="Bounce Rate" :value="bounceRate" subtitle="Single-page sessions" :loading="pending" :error="!!error" />
  </div>
</template>

<script setup lang="ts">
const period = usePeriod()
const { data, pending, error } = useFetch(() => `/api/posthog/overview?days=${period.value}`, { watch: [period] })
const bounceRate = computed(() => {
  if (!data.value) return '0%'
  const { pageviews, uniqueUsers } = data.value
  if (!pageviews || !uniqueUsers) return '0%'
  return `${Math.max(0, Math.min(100, Math.round((1 - (uniqueUsers as number) / (pageviews as number)) * 100)))}%`
})
</script>
