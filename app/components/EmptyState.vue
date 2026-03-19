<template>
  <div style="text-align: center; padding: 40px 20px;">
    <div style="width: 48px; height: 48px; margin: 0 auto 16px; border-radius: 50%; background: var(--dash-bg-inset); display: flex; align-items: center; justify-content: center;">
      <svg class="w-5 h-5" style="color: var(--dash-text-ghost);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
    <p style="font-size: 15px; font-weight: 500; color: var(--dash-text-body); margin-bottom: 6px;">{{ title }}</p>
    <p style="font-size: 14px; color: var(--dash-text-faint); max-width: 360px; margin: 0 auto; line-height: 1.5;">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
