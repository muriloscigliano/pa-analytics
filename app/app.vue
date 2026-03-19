<template>
  <div
    data-bs-theme="dark"
    :data-theme="theme"
    class="min-h-screen"
    :style="{ backgroundColor: theme === 'dark' ? '#111113' : '#f5f5f7', fontFamily: 'var(--pa-font-body)', color: theme === 'dark' ? '#b0b0b4' : '#333' }"
  >
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const theme = useState('theme', () => 'dark')
const period = useState('period', () => 30)

provide('theme', theme)
provide('toggleTheme', () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
})
provide('period', period)
provide('setPeriod', (days: number) => {
  period.value = days
})
</script>
