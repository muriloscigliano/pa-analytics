<template>
  <div class="dash-card">
    <h2 class="dash-title">Pageviews</h2>
    <p class="dash-help">Total page loads per day across all pages. Each point is one day. Includes both new and returning visitors.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else class="h-48 sm:h-64">
      <ClientOnly>
        <Line :data="chartData" :options="chartOptions" />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/pageviews?days=${period.value}`, { watch: [period, refreshKey] })
const chartData = computed(() => {
  const results = (data.value as any)?.results ?? []
  return {
    labels: results.map(([day]: [string, number]) => new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      data: results.map(([, views]: [string, number]) => views),
      borderColor: 'var(--dash-accent)', backgroundColor: 'rgba(196, 52, 58, 0.05)',
      fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 5,
      pointBackgroundColor: 'var(--dash-accent)', pointBorderColor: '#1a1a1c', pointBorderWidth: 2, borderWidth: 1.5,
    }],
  }
})
const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a1c', titleColor: '#e0e0e2', bodyColor: '#888', borderColor: '#2a2a2c', borderWidth: 1, cornerRadius: 6, padding: 10, bodyFont: { family: 'Roboto' } } },
  scales: {
    x: { ticks: { color: '#444', maxTicksLimit: 8, font: { family: 'Roboto', size: 14 } }, grid: { color: 'rgba(255,255,255,0.03)' }, border: { color: 'transparent' } },
    y: { ticks: { color: '#444', font: { family: 'Roboto', size: 14 } }, grid: { color: 'rgba(255,255,255,0.03)' }, border: { color: 'transparent' } },
  },
}
</script>
