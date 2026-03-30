<template>
  <div class="dash-card">
    <h2 class="dash-title">Converter Journey Flow</h2>
    <p class="dash-help">The full journey of visitors who submitted a form — which pages they visited, which sections they viewed on each page, and where they converted. Shows the typical path from landing to signup.</p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!data?.totalConverters" title="No converter journeys yet" description="Journey data will appear once visitors start submitting forms. Requires pageview, section_viewed, and form_submitted events." />
    <div v-else>
      <!-- Summary stats -->
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

      <!-- Typical journey flow -->
      <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px;">Typical Page Flow (by position in journey)</p>
      <div v-for="(page, i) in data.summary" :key="page.page" style="margin-bottom: 20px;">
        <!-- Page step -->
        <div class="flex items-start gap-3">
          <!-- Step indicator -->
          <div style="display: flex; flex-direction: column; align-items: center; min-width: 32px;">
            <div :style="{ width: '32px', height: '32px', borderRadius: '50%', background: page.page === '/signup' || page.sections.some((s: any) => s.name === 'form') ? '#C4343A' : 'var(--dash-bg-inset)', border: '2px solid ' + (page.page === '/signup' ? '#C4343A' : 'var(--dash-border-card)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: page.page === '/signup' ? '#fff' : 'var(--dash-text-primary)' }" class="tabular-nums">{{ i + 1 }}</div>
            <div v-if="i < data.summary.length - 1" style="width: 2px; height: 16px; background: var(--dash-border-card); margin-top: 4px;" />
          </div>
          <!-- Page content -->
          <div style="flex: 1; padding-bottom: 4px;">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <span style="font-size: 15px; font-weight: 600; color: var(--dash-text-primary);">{{ page.page || '/' }}</span>
              <span style="font-size: 14px; color: var(--dash-text-faint);" class="tabular-nums">{{ page.appearances }} converters visited</span>
            </div>
            <!-- Sections viewed on this page -->
            <div v-if="page.sections.length > 0" style="margin-top: 8px; padding-left: 4px;">
              <div v-for="(sec, si) in page.sections.slice(0, 6)" :key="si" class="flex items-center gap-2" style="padding: 3px 0;">
                <div style="width: 6px; height: 6px; border-radius: 50%; background: var(--dash-border-card); flex-shrink: 0;" />
                <span style="font-size: 14px; color: var(--dash-text-body);">{{ sec.name }}</span>
                <span style="font-size: 14px; color: var(--dash-text-ghost);" class="tabular-nums">{{ sec.count }}x</span>
              </div>
              <span v-if="page.sections.length > 6" style="font-size: 14px; color: var(--dash-text-ghost); padding-left: 14px;">+{{ page.sections.length - 6 }} more sections</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sample journeys -->
      <div v-if="data.sampleJourneys?.length" style="margin-top: 32px;">
        <p style="font-size: 14px; font-weight: 600; color: var(--dash-text-faint); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px;">Sample Journeys ({{ data.sampleJourneys.length }} of {{ data.totalConverters }})</p>
        <div v-for="(journey, ji) in data.sampleJourneys.slice(0, showAll ? 10 : 3)" :key="ji" style="margin-bottom: 16px; padding: 16px; background: var(--dash-bg-inset); border: 1px solid var(--dash-border-card); border-radius: 12px;">
          <div class="flex items-center flex-wrap gap-1">
            <template v-for="(step, si) in journey" :key="si">
              <div style="display: inline-flex; align-items: center; gap: 4px;">
                <span :style="{ fontSize: '14px', fontWeight: step.action ? 600 : 400, color: step.action ? '#C4343A' : 'var(--dash-text-body)' }">{{ step.page || '/' }}</span>
                <span v-if="step.sections?.length" style="font-size: 12px; color: var(--dash-text-ghost);">({{ step.sections.length }}s)</span>
              </div>
              <span v-if="si < journey.length - 1" style="color: var(--dash-text-ghost); font-size: 14px;">→</span>
            </template>
          </div>
        </div>
        <button v-if="data.sampleJourneys.length > 3 && !showAll" @click="showAll = true" style="font-size: 14px; color: var(--dash-text-faint); background: none; border: 1px solid var(--dash-border-card); border-radius: 8px; padding: 8px 16px; cursor: pointer; width: 100%;">Show {{ data.sampleJourneys.length - 3 }} more journeys</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { period, refreshKey } = usePeriod()
const { data, pending, error, refresh } = useFetch(() => `/api/posthog/converter-journey?days=${period.value}`, { watch: [period, refreshKey] })
const showAll = ref(false)
</script>
