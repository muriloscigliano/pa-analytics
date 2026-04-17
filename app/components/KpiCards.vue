<template>
  <div class="metrics-grid">
    <KpiCard title="Pageviews" :value="data?.pageviews ?? 0" subtitle="Total page loads" :loading="pending" :error="!!error" />
    <KpiCard title="Unique Users" :value="data?.uniqueUsers ?? 0" subtitle="Distinct visitors" :loading="pending" :error="!!error" />
    <KpiCard title="Form Submissions" :value="data?.formSubmissions ?? 0" :subtitle="`from ${data?.formSubmitters ?? 0} unique people`" :loading="pending" :error="!!error" />
    <KpiCard title="Signups" :value="data?.signups ?? 0" subtitle="Event not yet instrumented" :loading="pending" :error="!!error" />
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error } = useFetch(() => `/api/posthog/overview?days=${period.value}`, { watch: [period, refreshKey] })

</script>
