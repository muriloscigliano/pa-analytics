<template>
  <div class="kpi-card">
    <p class="kpi-label">{{ title }}</p>
    <div v-if="loading" class="skeleton h-9 w-28 mt-2" />
    <p v-else-if="error" class="text-sm text-pa-danger mt-2">Failed to load</p>
    <p v-else class="kpi-value">{{ typeof value === 'number' ? value.toLocaleString() : value }}</p>
    <p v-if="subtitle && !loading && !error" class="kpi-subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: number | string
  subtitle?: string
  loading?: boolean
  error?: boolean
}>()
</script>
