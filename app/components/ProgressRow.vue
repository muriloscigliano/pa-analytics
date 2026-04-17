<template>
  <div class="progress-row" :style="{ borderBottom: last ? 'none' : '1px solid var(--dash-border-row)' }">
    <span class="progress-row__label" :style="{ minWidth: labelWidth }">
      <slot name="label">{{ label }}</slot>
    </span>
    <div class="progress-row__bar">
      <div class="progress-track" :style="{ height: barHeight }">
        <div class="progress-fill" :style="{ width: pct + '%', background: highlight ? 'var(--dash-accent)' : undefined }" />
      </div>
    </div>
    <slot name="values" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  pct: number
  highlight?: boolean
  last?: boolean
  labelWidth?: string
  barHeight?: string
}>(), {
  highlight: false,
  last: false,
  labelWidth: '90px',
  barHeight: '6px',
})
</script>

<style scoped>
.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}
.progress-row__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--dash-text-body);
  flex-shrink: 0;
}
.progress-row__bar {
  flex: 1;
  min-width: 0;
}
</style>
