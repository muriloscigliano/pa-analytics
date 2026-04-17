<template>
  <div class="dash-card">
    <h2 class="dash-title">Converter Journey Flow</h2>
    <p class="dash-help">What pages converters visit at each step of their journey. Step 1 is the entry page, step 2 is the next page they navigate to, and so on. Sections show what content they read on each page.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!data?.totalConverters" title="No converter journeys yet" description="Journey data will appear once visitors start submitting forms." />
    <div v-else>
      <!-- Summary -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4" style="margin-bottom: 28px;">
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 16px; text-align: center;">
          <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ data.totalConverters }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 6px;">Converters Analyzed</p>
        </div>
        <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 16px; text-align: center;">
          <p style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ data.avgSteps }}</p>
          <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 6px;">Avg Pages per Journey</p>
        </div>
      </div>

      <!-- Position-based flow -->
      <div v-for="(pos, pi) in data.positions" :key="pi" style="margin-bottom: 16px;">
        <!-- Step header -->
        <div class="flex items-center gap-3" style="margin-bottom: 10px;">
          <div :style="{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', background: pi === 0 ? 'var(--dash-accent)' : 'var(--dash-text-ghost)', flexShrink: 0 }" class="tabular-nums">{{ pos.position }}</div>
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em;">{{ pi === 0 ? 'Entry Page' : `Page ${pos.position}` }}</span>
        </div>

        <!-- Pages at this position -->
        <div style="padding-left: 40px;">
          <div v-for="(p, i) in pos.pages" :key="p.page" :style="{ padding: '10px 0', borderBottom: i < pos.pages.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <span style="font-size: 15px; font-weight: 600; color: var(--dash-text-primary);">{{ p.page }}</span>
              <div class="flex items-center gap-3">
                <div style="width: 60px;">
                  <div class="progress-track" style="height: 6px;"><div class="progress-fill" :style="{ width: p.pct + '%' }" /></div>
                </div>
                <span style="font-size: 14px; color: var(--dash-text-faint); min-width: 80px; text-align: right;" class="tabular-nums">{{ p.count }} <span style="color: var(--dash-text-ghost);">({{ p.pct }}%)</span></span>
              </div>
            </div>
            <!-- Sections on this page -->
            <div v-if="sections[p.page]?.length" class="flex flex-wrap gap-1" style="margin-top: 6px;">
              <span v-for="(sec, si) in sections[p.page].slice(0, 3)" :key="si" style="font-size: 13px; color: var(--dash-text-body); border: 1px solid var(--dash-border-card); padding: 1px 8px; border-radius: 4px;">{{ sec.name }} <span style="color: var(--dash-text-ghost);" class="tabular-nums">{{ sec.count }}x</span></span>
              <span v-if="sections[p.page].length > 3" style="font-size: 13px; color: var(--dash-text-ghost);">+{{ sections[p.page].length - 3 }}</span>
            </div>
          </div>
        </div>

        <!-- Arrow to next step -->
        <div v-if="pi < data.positions.length - 1 || (pi === data.positions.length - 1 && data.formSubmissions?.length)" style="padding-left: 12px; height: 20px; display: flex; align-items: center;">
          <div style="width: 2px; height: 20px; background: var(--dash-border-card);" />
        </div>
      </div>

      <!-- Form submission (final step) -->
      <div v-if="data.formSubmissions?.length" style="margin-bottom: 16px;">
        <div class="flex items-center gap-3" style="margin-bottom: 10px;">
          <div style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; background: var(--dash-accent); flex-shrink: 0;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span style="font-size: 14px; font-weight: 600; color: var(--dash-accent); text-transform: uppercase; letter-spacing: 0.06em;">Form Submitted</span>
        </div>
        <div style="padding-left: 40px;">
          <div v-for="(f, i) in data.formSubmissions" :key="i" :style="{ padding: '10px 0', borderBottom: i < data.formSubmissions.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span style="font-size: 15px; font-weight: 600; color: var(--dash-text-primary);">{{ f.page }}</span>
                <span style="font-size: 13px; color: var(--dash-text-ghost); border: 1px solid var(--dash-border-card); padding: 1px 8px; border-radius: 4px;">{{ f.formType }}</span>
              </div>
              <span style="font-size: 14px; color: var(--dash-text-faint);" class="tabular-nums">{{ f.submissions }} submissions · {{ f.users }} people</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/converter-journey?days=${period.value}`, { watch: [period, refreshKey] })
const sections = computed(() => (data.value as any)?.sections ?? {})
</script>
