<template>
  <div>
    <!-- Top row: logo + title -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <img src="/pa-logo.svg" alt="PAY Advantage" style="width: 44px; height: 44px; border-radius: 50%;" />
        <div>
          <h1 :style="{ fontSize: '32px', fontWeight: 700, color: 'var(--dash-text-primary)', letterSpacing: '-0.01em' }">Website Analytics</h1>
          <p style="font-size: 14px; color: var(--dash-text-muted); margin-top: 4px;">Conversion tracking &amp; visitor behaviour</p>
        </div>
      </div>
      <!-- Period + theme toggle on same row -->
      <div class="flex items-center gap-3">
        <button
          v-for="opt in periods"
          :key="opt.value"
          @click="setPeriod(opt.value)"
          :style="{
            padding: '6px 16px', borderRadius: '100px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 500,
            fontFamily: 'var(--pa-font-body)',
            border: period === opt.value ? '1px solid #C4343A' : '1px solid var(--dash-border-card)',
            background: period === opt.value ? 'rgba(196, 52, 58, 0.1)' : 'transparent',
            color: period === opt.value ? '#C4343A' : 'var(--dash-text-faint)',
          }"
        >
          {{ opt.label }}
        </button>
        <div style="width: 1px; height: 24px; background: var(--dash-border-card); margin: 0 4px;" />
        <button
          @click="toggleTheme"
          :style="{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '100px', cursor: 'pointer',
            border: '1px solid var(--dash-border-card)',
            background: 'var(--dash-bg-inset)',
            color: 'var(--dash-text-body)',
            fontSize: '14px', fontWeight: 500,
            fontFamily: 'var(--pa-font-body)',
          }"
        >
          <svg v-if="theme === 'dark'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          {{ theme === 'dark' ? 'Light' : 'Dark' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const theme = inject<Ref<string>>('theme')!
const toggleTheme = inject<() => void>('toggleTheme')!
const period = inject<Ref<number>>('period')!
const setPeriod = inject<(days: number) => void>('setPeriod')!

const periods = [
  { label: '7d', value: 7 },
  { label: '14d', value: 14 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
]
</script>
