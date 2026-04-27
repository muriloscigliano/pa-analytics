<template>
  <div class="dash-card">
    <h2 class="dash-title">Rageclicks — where visitors get stuck</h2>
    <p class="dash-help">
      A rageclick is when someone clicks the same spot 3+ times in a second — digital frustration. Counterintuitively, rageclickers are your <strong>highest-intent visitors</strong>: they convert at {{ d?.conversion?.lift || 0 }}× the rate of everyone else. Fixing what they're trying to click wins back your best leads.
    </p>
    <LoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" :message="error.message" @retry="refresh" />
    <EmptyState v-else-if="!d?.total" title="No rageclicks detected" description="Rageclick data will appear here if PostHog detects frustrated clicking patterns." />
    <div v-else>
      <!-- Summary line -->
      <div class="summary-strip">
        <div class="summary-strip__item">
          <span class="summary-strip__num">{{ d.users }}</span>
          <span class="summary-strip__label">frustrated people</span>
        </div>
        <div class="summary-strip__divider" />
        <div class="summary-strip__item">
          <span class="summary-strip__num">{{ d.total }}</span>
          <span class="summary-strip__label">rage clicks</span>
        </div>
        <div class="summary-strip__divider" />
        <div class="summary-strip__item">
          <span class="summary-strip__num summary-strip__num--accent">{{ d.conversion.rageclickerRate }}%</span>
          <span class="summary-strip__label">convert (vs {{ d.conversion.baselineRate }}% baseline)</span>
        </div>
      </div>

      <!-- Page-by-page -->
      <div class="pages-list">
        <div v-for="p in rankedPages" :key="p.page" class="page-issue" :class="`page-issue--${p.severity.key}`">
          <div class="page-issue__head">
            <div class="page-issue__path">
              <code class="page-issue__page">{{ p.page }}</code>
              <span class="page-issue__badge" :style="{ color: p.severity.color, background: p.severity.bg }">{{ p.severity.label }}</span>
            </div>
            <span class="page-issue__stats">
              <strong>{{ p.users }}</strong> {{ p.users === 1 ? 'person' : 'people' }} · <strong>{{ p.clicks }}</strong> clicks
            </span>
          </div>

          <div class="page-issue__elements">
            <div v-for="(el, i) in p.elements" :key="i" class="element-row">
              <div class="element-row__head">
                <span class="element-row__text">“{{ cleanText(el.text) }}”</span>
                <span class="element-row__meta">{{ el.users }} {{ el.users === 1 ? 'user' : 'users' }}</span>
              </div>
              <p class="element-row__fix">
                <span class="element-row__fix-label">{{ issueLabel(el.text, el.users, el.clicks) }}:</span>
                {{ suggestFix(el.text, el.users, el.clicks, p.page) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p class="footer-hint">
        👉 Open PostHog → Session Replay and filter by <code>$rageclick</code> on the pages above. Watching 3 replays usually reveals the root cause in under 10 minutes.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ElementHit { text: string; clicks: number; users: number }
interface PageIssue { page: string; clicks: number; users: number; elements: ElementHit[] }
interface RageData {
  total: number; users: number; pages: PageIssue[]
  conversion: { rageclickers: number; rageclickerConverters: number; rageclickerRate: number; baselineUsers: number; baselineConverters: number; baselineRate: number; lift: number }
}

const { period, refreshKey } = usePeriod()
const { data: d, pending, error, refresh } = useFetch<RageData>(() => `/api/posthog/rageclicks?days=${period.value}`, { watch: [period, refreshKey] })

function cleanText(t: string) {
  if (!t) return '(unlabeled)'
  const collapsed = t.replace(/\s+/g, ' ').trim()
  return collapsed || '(unlabeled)'
}

function classifySeverity(users: number, clicks: number) {
  if (users >= 5) return { key: 'high', label: '🔴 High priority', color: 'var(--dash-accent)', bg: 'var(--dash-accent-soft)' }
  if (users >= 2) return { key: 'medium', label: '🟡 Medium', color: 'var(--dash-text-body)', bg: 'var(--dash-bg-inset)' }
  return { key: 'low', label: '⚪ Low', color: 'var(--dash-text-ghost)', bg: 'var(--dash-bg-inset)' }
}

function issueLabel(rawText: string, users: number, clicks: number): string {
  const t = cleanText(rawText).toLowerCase()
  if (users === 1) return 'Probably noise'
  if (t.includes('login') || t.includes('sign in')) return 'Login button failing'
  if (/\b(apply|get started|get access|sign up|signup)\b/.test(t)) return 'CTA → form handoff broken'
  if (/\b(pay|checkout|buy)\b/.test(t)) return 'Payment button unresponsive'
  if (/\b(video|play|watch)\b/.test(t)) return 'Video embed not loading'
  if (/\b(pricing|plan|subscription)\b/.test(t)) return 'Pricing link slow or broken'
  if (/\b(send|submit|enquiry|contact)\b/.test(t)) return 'Form submit failing silently'
  if (t === '(unlabeled)' && users >= 3) return 'Something looks clickable but isn\'t'
  if (t === '(unlabeled)') return 'Misleading cursor on a non-interactive element'
  return 'Unresponsive button'
}

function suggestFix(rawText: string, users: number, clicks: number, page: string): string {
  const t = cleanText(rawText).toLowerCase()
  const perUser = users > 0 ? clicks / users : 0

  if (users === 1) {
    return 'One frustrated visitor — not systemic. Skip unless replay reveals a real bug.'
  }
  if (t.includes('login') || t.includes('sign in')) {
    return 'Login is silently failing. Likely no loading state after click, or a race with the auth script. Check iOS Safari first — that\'s where the hits concentrate. Add a button spinner and verify the click handler runs on first tap.'
  }
  if (/\b(apply|get started|get access|sign up|signup)\b/.test(t)) {
    return 'Form or destination is slow to appear. Add a visible loading state on click, preload the form, and verify the CTA link isn\'t scroll-jumping instead of navigating.'
  }
  if (/\b(pay|checkout|buy)\b/.test(t)) {
    return 'Payment/CTA flow unresponsive. Check the button handler fires, that the next screen loads quickly, and that nothing is covering the button on mobile.'
  }
  if (/\b(video|play|watch)\b/.test(t)) {
    return 'Video embed likely not loading. Check third-party script (YouTube/Vimeo) isn\'t blocked by consent banner or ad-blockers.'
  }
  if (/\b(pricing|plan|subscription)\b/.test(t) && page === '/') {
    return 'Users expect a click to jump to pricing — link may be slow or broken. Confirm the href works and pre-render /pricing.'
  }
  if (t === '(unlabeled)' && users >= 3) {
    return 'Element has no accessible text — probably an image, icon, or heading styled to look clickable but isn\'t. Inspect via replay and either make it interactive or remove the cursor: pointer style.'
  }
  if (t === '(unlabeled)') {
    return 'A couple of users clicking a non-interactive element. Check for misleading cursor styles.'
  }
  if (/\b(send|submit|enquiry|contact)\b/.test(t)) {
    return 'Submit is slow or the form is rejecting silently. Add an inline loading state and surface validation errors clearly.'
  }
  if (perUser >= 5 && users <= 2) {
    return 'One or two angry users venting. Worth watching the replay but not a systemic issue.'
  }
  return 'Watch a session replay to confirm the failure mode, then add a loading state or fix the underlying handler.'
}

const rankedPages = computed(() => {
  if (!d.value) return []
  return d.value.pages.map(p => ({
    ...p,
    severity: classifySeverity(p.users, p.clicks),
  }))
})
</script>

<style scoped>
.summary-strip {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 20px;
  background: var(--dash-bg-inset);
  border: 1px solid var(--dash-border-card);
  border-radius: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.summary-strip__item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.summary-strip__num {
  font-size: 22px;
  font-weight: 700;
  color: var(--dash-text-primary);
  font-variant-numeric: tabular-nums;
}
.summary-strip__num--accent { color: var(--dash-accent); }
.summary-strip__label {
  font-size: 14px;
  color: var(--dash-text-faint);
}
.summary-strip__divider {
  width: 1px;
  height: 22px;
  background: var(--dash-border-card);
}

.pages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.page-issue {
  border: 1px solid var(--dash-border-card);
  border-radius: 12px;
  padding: 16px;
  background: var(--dash-bg-inset);
}
.page-issue--high { border-color: var(--dash-accent); }
.page-issue__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.page-issue__path { display: flex; align-items: center; gap: 10px; min-width: 0; flex-wrap: wrap; }
.page-issue__page {
  font-size: 15px;
  font-weight: 600;
  color: var(--dash-text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.page-issue__badge {
  font-size: 14px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 100px;
  flex-shrink: 0;
}
.page-issue__stats {
  font-size: 14px;
  color: var(--dash-text-faint);
  flex-shrink: 0;
}
.page-issue__elements {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--dash-border-row);
}
.element-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.element-row__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}
.element-row__text {
  font-size: 15px;
  font-weight: 600;
  color: var(--dash-text-primary);
  font-style: italic;
}
.element-row__meta {
  font-size: 14px;
  color: var(--dash-text-ghost);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.element-row__fix {
  font-size: 14px;
  color: var(--dash-text-body);
  line-height: 1.55;
  margin: 0;
}
.element-row__fix-label {
  color: var(--dash-text-primary);
  font-weight: 600;
}

.footer-hint {
  font-size: 14px;
  color: var(--dash-text-muted);
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--dash-border-row);
  line-height: 1.5;
}
.footer-hint code {
  font-size: 14px;
  background: var(--dash-bg-inset);
  padding: 1px 6px;
  border-radius: 4px;
  color: var(--dash-text-body);
}
</style>
