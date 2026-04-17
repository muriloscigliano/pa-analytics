<template>
  <div class="stat-box" :style="{ textAlign: align }">
    <p class="stat-box__value" :style="{ color: accent ? 'var(--dash-accent)' : 'var(--dash-text-primary)' }" :class="{ 'tabular-nums': !isNaN(Number(String(value).replace(/[,\s]/g, ''))) }">{{ formattedValue }}</p>
    <p class="stat-box__label">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: string | number
  label: string
  accent?: boolean
  align?: 'left' | 'center' | 'right'
}>(), {
  accent: false,
  align: 'center',
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') return props.value.toLocaleString()
  return props.value
})
</script>

<style scoped>
.stat-box {
  background: var(--dash-bg-inset);
  border: 1px solid var(--dash-border-card);
  border-radius: 12px;
  padding: 14px;
}
.stat-box__value {
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 700;
  line-height: 1.1;
}
.stat-box__label {
  font-size: 14px;
  color: var(--dash-text-faint);
  margin-top: 6px;
}
</style>
