<template>
  <div>
    <!-- Top row: logo + title + controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <img src="/pa-logo.svg" alt="PAY Advantage" class="w-10 h-10 sm:w-11 sm:h-11" style="border-radius: 50%;" />
        <div>
          <h1 class="text-xl sm:text-[32px]" style="font-weight: 700; color: var(--dash-text-primary); letter-spacing: -0.01em;">Website Analytics</h1>
          <p class="hidden sm:block" style="font-size: 14px; color: var(--dash-text-muted); margin-top: 4px;">Conversion tracking &amp; visitor behaviour</p>
        </div>
      </div>
      <!-- Period + refresh + theme toggle -->
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="opt in periods"
          :key="opt.value"
          @click="setPeriod(opt.value)"
          :style="{
            padding: '6px 12px', borderRadius: '100px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 500,
            fontFamily: 'var(--pa-font-body)',
            border: period === opt.value ? '1px solid var(--dash-accent)' : '1px solid var(--dash-border-card)',
            background: period === opt.value ? 'var(--dash-accent-soft)' : 'transparent',
            color: period === opt.value ? 'var(--dash-accent)' : 'var(--dash-text-faint)',
          }"
        >
          {{ opt.label }}
        </button>
        <div class="hidden sm:block" style="width: 1px; height: 24px; background: var(--dash-border-card); margin: 0 4px;" />
        <!-- Refresh button -->
        <button
          @click="refreshAll"
          :style="{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '100px', cursor: 'pointer',
            border: '1px solid var(--dash-border-card)',
            background: refreshing ? 'var(--dash-accent-soft)' : 'var(--dash-bg-inset)',
            color: refreshing ? 'var(--dash-accent)' : 'var(--dash-text-body)',
            fontSize: '14px', fontWeight: 500,
            fontFamily: 'var(--pa-font-body)',
          }"
          :disabled="refreshing"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': refreshing }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <span class="hidden sm:inline">{{ refreshing ? 'Refreshing...' : 'Refresh' }}</span>
        </button>
        <!-- Theme toggle -->
        <button
          @click="toggleTheme"
          :style="{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '100px', cursor: 'pointer',
            border: '1px solid var(--dash-border-card)',
            background: 'var(--dash-bg-inset)',
            color: 'var(--dash-text-body)',
            fontSize: '14px', fontWeight: 500,
            fontFamily: 'var(--pa-font-body)',
          }"
        >
          <svg v-if="theme === 'dark'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          <span class="hidden sm:inline">{{ theme === 'dark' ? 'Light' : 'Dark' }}</span>
        </button>
      </div>
    </div>
    <!-- Last updated -->
    <p v-if="lastUpdated" class="mt-3 sm:mt-2 sm:text-right" style="font-size: 14px; color: var(--dash-text-ghost);">
      Last updated: {{ lastUpdated }} · auto-refresh every 5 min
    </p>
  </div>
</template>

<script setup lang="ts">
const theme = inject<Ref<string>>('theme')!
const toggleTheme = inject<() => void>('toggleTheme')!
const period = inject<Ref<number>>('period')!
const setPeriod = inject<(days: number) => void>('setPeriod')!

const refreshing = ref(false)
const lastUpdated = ref('')

function updateTimestamp() {
  lastUpdated.value = new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
}

const refreshKey = useState<number>('refreshKey', () => 0)

async function refreshAll() {
  refreshing.value = true
  refreshKey.value++
  await new Promise(resolve => setTimeout(resolve, 2000))
  updateTimestamp()
  refreshing.value = false
}

const AUTO_REFRESH_MS = 5 * 60 * 1000
let intervalId: ReturnType<typeof setInterval> | null = null

function silentRefresh() {
  if (document.hidden) return
  refreshKey.value++
  updateTimestamp()
}

function onVisibilityChange() {
  if (!document.hidden) silentRefresh()
}

onMounted(() => {
  updateTimestamp()
  intervalId = setInterval(silentRefresh, AUTO_REFRESH_MS)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

const periods = [
  { label: '7d', value: 7 },
  { label: '14d', value: 14 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
]
</script>
