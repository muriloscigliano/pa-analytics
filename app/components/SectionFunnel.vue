<template>
  <div class="dash-card">
    <h2 class="dash-title">Section to Conversion Funnel</h2>
    <p class="dash-help">Which sections drive the most CTA clicks and form submissions. Higher CTA rate = that section's content motivates action.</p>
    <LoadingSpinner v-if="pending || pendingCorr" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <div v-else>
      <!-- Overall funnel -->
      <div v-if="steps.length > 0" class="space-y-5" style="margin-bottom: 32px;">
        <div v-for="(step, i) in steps" :key="i">
          <div class="flex items-center justify-between mb-2">
            <span style="font-size: 14px; color: var(--dash-text-body);">{{ step.name }}</span>
            <div class="flex items-center gap-3">
              <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary);" class="tabular-nums">{{ step.count }}</span>
              <span class="pill pill-neutral">{{ step.rate }}%</span>
            </div>
          </div>
          <div class="progress-track" style="height: 6px;">
            <div class="progress-fill" :style="{ width: step.rate + '%' }" />
          </div>
          <div v-if="i < steps.length - 1" class="dropoff-label">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            {{ step.dropoff }}% drop-off
          </div>
        </div>
      </div>

      <!-- How submitters reached the form -->
      <div v-if="paths.total > 0" style="margin-bottom: 32px;">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">How Submitters Reached the Form</p>
        <p style="font-size: 14px; color: var(--dash-text-ghost); margin-bottom: 12px;">"Header CTA" = clicked "Get Started" or welcome page button. "Section + Page Form" = viewed sections then submitted via modal/inline/contact form (not header CTA). "Direct Submit" = submitted without viewing sections or clicking header CTA.</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
            <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: #C4343A;" class="tabular-nums">{{ paths.sectionAndCta }}</p>
            <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Section + Header CTA</p>
            <p style="font-size: 13px; color: var(--dash-text-ghost); margin-top: 2px;" class="tabular-nums">{{ pct(paths.sectionAndCta) }}%</p>
          </div>
          <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
            <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ paths.sectionOnly }}</p>
            <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Section + Page Form</p>
            <p style="font-size: 13px; color: var(--dash-text-ghost); margin-top: 2px;" class="tabular-nums">{{ pct(paths.sectionOnly) }}%</p>
          </div>
          <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
            <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ paths.ctaOnly }}</p>
            <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Header CTA Only</p>
            <p style="font-size: 13px; color: var(--dash-text-ghost); margin-top: 2px;" class="tabular-nums">{{ pct(paths.ctaOnly) }}%</p>
          </div>
          <div style="background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px; padding: 14px; text-align: center;">
            <p style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: var(--dash-text-primary);" class="tabular-nums">{{ paths.direct }}</p>
            <p style="font-size: 14px; color: var(--dash-text-faint); margin-top: 4px;">Direct Submit</p>
            <p style="font-size: 13px; color: var(--dash-text-ghost); margin-top: 2px;" class="tabular-nums">{{ pct(paths.direct) }}%</p>
          </div>
        </div>
      </div>

      <!-- Per-section breakdown -->
      <div v-if="corrRows.length > 0">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px;">Which Sections Drive Clicks</p>
        <!-- Header -->
        <div class="hidden sm:flex items-center" style="padding: 0 0 10px; border-bottom: 1px solid var(--dash-border-row); margin-bottom: 4px;">
          <span style="font-size: 14px; color: var(--dash-text-ghost); flex: 1;">Section</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 70px; text-align: right;">Viewers</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 80px; text-align: right;">Clicked CTA</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 70px; text-align: right;">CTA Rate</span>
          <span style="font-size: 14px; color: var(--dash-text-ghost); width: 80px; text-align: right;">Submitted</span>
        </div>
        <div v-for="(r, i) in corrRows" :key="i" :style="{ borderBottom: i < corrRows.length - 1 ? '1px solid var(--dash-border-row)' : 'none' }">
          <!-- Desktop -->
          <div class="hidden sm:flex items-center" style="padding: 10px 0;">
            <div style="flex: 1; min-width: 0;">
              <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">{{ r.section }}</span>
              <span style="font-size: 13px; color: var(--dash-text-ghost);">{{ r.page }}</span>
            </div>
            <span style="font-size: 14px; color: var(--dash-text-body); width: 70px; text-align: right;" class="tabular-nums">{{ r.viewers }}</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--dash-text-primary); width: 80px; text-align: right;" class="tabular-nums">{{ r.ctaClickers }}</span>
            <span :style="{ fontSize: '14px', fontWeight: 600, color: r.ctaRate > 0 ? '#C4343A' : 'var(--dash-text-ghost)', width: '70px', textAlign: 'right' }" class="tabular-nums">{{ r.ctaRate }}%</span>
            <span style="font-size: 14px; color: var(--dash-text-faint); width: 80px; text-align: right;" class="tabular-nums">{{ r.formSubmitters }}</span>
          </div>
          <!-- Mobile -->
          <div class="sm:hidden" style="padding: 10px 0;">
            <div class="flex items-center justify-between mb-1">
              <span style="font-size: 14px; font-weight: 500; color: var(--dash-text-primary);">{{ r.section }}</span>
              <span :style="{ fontSize: '14px', fontWeight: 600, color: r.ctaRate > 0 ? '#C4343A' : 'var(--dash-text-ghost)' }" class="tabular-nums">{{ r.ctaRate }}% CTA</span>
            </div>
            <div class="flex items-center gap-4" style="font-size: 14px; color: var(--dash-text-faint);">
              <span>{{ r.page }}</span>
              <span class="tabular-nums">{{ r.viewers }} viewers</span>
              <span class="tabular-nums">{{ r.ctaClickers }} clicked</span>
              <span class="tabular-nums">{{ r.formSubmitters }} submitted</span>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else-if="steps.length === 0" title="Waiting for funnel data" description="Section conversion funnel will populate once section_viewed, header_cta_clicked, and form_submitted events are all flowing." />
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/section-funnel?days=${period.value}`, { watch: [period, refreshKey] })
const { data: corrData, pending: pendingCorr } = useFetch(() => `/api/posthog/section-cta-correlation?days=${period.value}`, { watch: [period, refreshKey] })

const steps = computed(() => {
  const raw = data.value as any
  if (!raw) return []
  const results = raw?.results ?? []
  if (results.length === 0) return []
  const total = results[0]?.[1] || 1
  return results.map(([name, count]: [string, number], i: number) => ({
    name,
    count,
    rate: Math.round((count / total) * 100),
    dropoff: i < results.length - 1 ? Math.round(((count - results[i + 1][1]) / Math.max(count, 1)) * 100) : 0,
  }))
})

const paths = computed(() => (data.value as any)?.submitterPaths ?? { total: 0, sectionAndCta: 0, sectionOnly: 0, ctaOnly: 0, direct: 0 })
function pct(value: number) {
  return paths.value.total > 0 ? Math.round((value / paths.value.total) * 100) : 0
}

const corrRows = computed(() =>
  ((corrData.value as any)?.results ?? []).map(([section, page, viewers, ctaClickers, formSubmitters, ctaRate, formRate]: [string, string, number, number, number, number, number]) => ({
    section, page, viewers, ctaClickers, formSubmitters, ctaRate, formRate,
  }))
)
</script>
