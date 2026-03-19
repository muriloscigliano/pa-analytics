<template>
  <div style="background: rgba(196,52,58,0.08); border: 1px solid rgba(196,52,58,0.2); border-radius: 8px; padding: 16px;">
    <p style="font-size: 14px; color: #C4343A;">{{ message }}</p>
    <button
      v-if="$attrs.onRetry"
      style="margin-top: 8px; font-size: 14px; color: #C4343A; text-decoration: underline; cursor: pointer; background: none; border: none;"
      @click="$emit('retry')"
    >Retry</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message: string }>()
defineEmits<{ retry: [] }>()
</script>
