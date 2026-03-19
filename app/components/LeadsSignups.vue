<template>
  <div class="dash-card">
    <h2 class="dash-title">Leads vs Signups</h2>
    <p class="dash-help">Server-side events tracking. Leads are created when a form is submitted. Signups are completed when the user finishes the registration flow on the web app.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <div v-if="totals.leads > 0 || totals.signups > 0">
        <div class="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
            <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ totals.leads }}</p>
            <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 6px;">Leads</p>
          </div>
          <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
            <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ totals.signups }}</p>
            <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 6px;">Signups</p>
          </div>
        </div>
        <div v-if="totals.leads > 0" style="font-size: 14px; color: var(--dash-text-muted);">
          Conversion rate: <span style="font-weight: 600; color: #C4343A;" class="tabular-nums">{{ conversionRate }}%</span>
        </div>
        <div class="h-48 sm:h-64 mt-4">
          <ClientOnly>
            <Line :data="chartData" :options="chartOptions" />
          </ClientOnly>
        </div>
      </div>
      <EmptyState v-else title="Waiting for lead & signup events" description="Lead creation and signup completion events from the server will appear here once they start firing. These are server-side events from the web app." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/leads-signups?days=${period.value}`, { watch: [period, refreshKey] })

const totals = computed(() => {
  const results = (data.value as any)?.results ?? []
  return {
    leads: results.reduce((sum: number, r: any[]) => sum + (r[1] || 0), 0),
    signups: results.reduce((sum: number, r: any[]) => sum + (r[2] || 0), 0),
  }
})

const conversionRate = computed(() => {
  if (totals.value.leads === 0) return '0'
  return ((totals.value.signups / totals.value.leads) * 100).toFixed(1)
})

const chartData = computed(() => {
  const results = (data.value as any)?.results ?? []
  return {
    labels: results.map(([day]: [string]) => new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Leads', data: results.map(([, leads]: [string, number]) => leads),
        borderColor: '#C4343A', backgroundColor: 'rgba(196, 52, 58, 0.05)',
        fill: true, tension: 0.4, pointRadius: 3, borderWidth: 1.5,
      },
      {
        label: 'Signups', data: results.map(([,, signups]: [string, number, number]) => signups),
        borderColor: '#666', backgroundColor: 'rgba(102, 102, 102, 0.05)',
        fill: true, tension: 0.4, pointRadius: 3, borderWidth: 1.5,
      },
    ],
  }
})

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top' as const, labels: { color: '#777', font: { family: 'Roboto', size: 14 }, boxWidth: 12, padding: 16 } },
    tooltip: { backgroundColor: '#1a1a1c', titleColor: '#e0e0e2', bodyColor: '#888', borderColor: '#2a2a2c', borderWidth: 1, cornerRadius: 6 },
  },
  scales: {
    x: { ticks: { color: '#444', maxTicksLimit: 8, font: { family: 'Roboto', size: 14 } }, grid: { color: 'rgba(255,255,255,0.03)' }, border: { color: 'transparent' } },
    y: { ticks: { color: '#444', font: { family: 'Roboto', size: 14 } }, grid: { color: 'rgba(255,255,255,0.03)' }, border: { color: 'transparent' } },
  },
}
</script>
