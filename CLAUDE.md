# CLAUDE.md — guidance for Claude assistants working on pa_dashboard

This file is auto-loaded into every Claude Code session in this repo. Read it first.

## What this project is

A self-hosted **PostHog analytics dashboard** for the Pay Advantage marketing site
(`payadvantage.com.au`). Built on **Nuxt 4 + Vue 3 + Tailwind**, it queries PostHog
via HogQL through a thin Nitro server proxy and renders ~50 cards organised into
seven sections (Traffic, Engagement, CTAs, Funnel, Lead Quality, Navigation,
Technical).

The audience is the marketing/product owner, not engineers — so cards must be
**self-explaining** with plain-English help text, not raw analytics jargon.

## Architecture in one paragraph

Each card is a `.vue` file in `app/components/` that calls `useFetch` against a
matching `.get.ts` endpoint in `server/api/posthog/`. Endpoints write HogQL and
delegate to the cached `queryPostHog()` util in `server/utils/posthog.ts` (5-min
in-memory cache + inflight dedup + retry). All cards subscribe to a global
`{ period, refreshKey }` from the `usePeriod` composable so the time-window
selector and refresh button update everything in lockstep. Auto-refresh fires
every 30 minutes.

## Strong conventions — follow these

### UI consistency (the user is strict about this)

- **Reuse existing primitives.** Don't invent new style classes or scoped CSS
  blocks unless you genuinely need to. The reusables are:
  - `<StatBox>` — for KPI tiles (props: `value`, `label`, `accent`)
  - `<ProgressRow>` — bar + label rows
  - `dash-card` / `dash-title` / `dash-help` classes for card chrome
  - `.progress-track` / `.progress-fill` for bars
  - `.pill` / `.pill-neutral` for badges
- **CSS variables only — never hardcoded colors.** Use `--dash-text-primary`,
  `--dash-text-body`, `--dash-text-muted`, `--dash-text-faint`,
  `--dash-text-ghost`, `--dash-bg-inset`, `--dash-border-card`,
  `--dash-border-row`, `--dash-accent`, `--dash-accent-soft`. Defined in
  `styles/dashboard.css` (dark) and `styles/dashboard-light.css` (light).
- **Inline-style + flex pattern** for row layouts (matches FormByDay,
  EntryPages, TrafficByDay). Don't introduce CSS grids for one-off rows.
- **No emoji or new icon sets** unless the user explicitly asks. The two
  exceptions in current use are ▲ and ★ in TrafficByDay.

### Code conventions

- **Composition API** (`<script setup lang="ts">`).
- **`useFetch` watch** must always include `[period, refreshKey, ...component-local refs]`.
- **No client-side caching tricks** — caching lives in `queryPostHog()`.
- **Don't add comments** unless the WHY is non-obvious.
- **Don't add console.log, error swallowing, or feature flags.**

### Data conventions

- **`signup_completed_server` is pending instrumentation.** Several endpoints
  query it (overview, funnel, leads-signups, device-conversion, page-funnels);
  the queries return 0 today but are deliberately left in place. Annotate UI
  with "Pending instrumentation" — don't remove the queries.
- **Login filter for marketing visitors.** Entry Pages and Traffic Sources
  exclude users who fired `login_clicked` (existing customers). Any new
  endpoint that claims to count "marketing visitors" should apply the same
  filter for consistency. Pattern:
  ```sql
  AND person_id NOT IN (
    SELECT DISTINCT person_id FROM events
    WHERE event = 'login_clicked' AND timestamp >= now() - INTERVAL ${days} DAY
  )
  ```
- **Paid traffic detection** — use the **landing URL**, not the referrer.
  Ad clicks strip the referrer, so `$referring_domain = '$direct'` for many
  paid clicks. Detect paid via `landing_url LIKE '%gclid%' OR '%gad_source%' OR '%msclkid%'`.
- **Element labels need normalization.** PostHog returns text with
  letter-spacing whitespace ("L o g i n"). Normalize before display
  (see `server/api/posthog/click-heatmap.get.ts`).
- **Person-based vs session-based.** Most queries are person-based
  (`argMin($pathname, timestamp)` for first touch). State this in help
  text when it matters (e.g. Entry Pages).

## File map

```
app/
  pages/index.vue                  Single-page dashboard, mounts every card
  composables/usePeriod.ts         Global { period, refreshKey } state
  components/
    DashboardHeader.vue            Period selector + refresh + theme toggle
    StatBox.vue                    Reusable KPI tile
    ProgressRow.vue                Reusable bar+label row
    KpiCard.vue, KpiCards.vue      Top-of-page KPI grid
    {Card}.vue × ~45               One per metric
server/
  api/posthog/{endpoint}.get.ts    44 endpoints, one per card (some shared)
  utils/posthog.ts                 queryPostHog() with cache + retry
  utils/mock-data.ts               Fallback when PostHog creds missing
styles/
  dashboard.css                    Dark theme + tokens
  dashboard-light.css              Light theme overrides
  tokens-*.css                     Foundation tokens
.env                               POSTHOG_PERSONAL_API_KEY, POSTHOG_PROJECT_ID, POSTHOG_HOST
```

## Common tasks

### Add a new card

1. Create `server/api/posthog/{name}.get.ts`:
   ```typescript
   export default defineEventHandler(async (event) => {
     if (!isPostHogConfigured()) return { /* empty shape matching success */ }
     const days = Number(getQuery(event).days) || 30
     return await queryPostHog(`SELECT ... WHERE timestamp >= now() - INTERVAL ${days} DAY`)
   })
   ```
2. Create `app/components/{Name}.vue` using `dash-card` + `dash-title` +
   `dash-help`, with `useFetch(() => '/api/posthog/{name}?days=' + period.value, { watch: [period, refreshKey] })`.
3. Mount in `app/pages/index.vue` under the appropriate section.
4. Run typecheck: `node_modules/.bin/tsc --noEmit -p .`

### Modify an existing card

- Read both the component and the endpoint before editing.
- Use the existing patterns from neighbour cards (don't reinvent layout).
- After changes: typecheck + smoke `curl http://localhost:3010/api/posthog/{endpoint}`.

### Verify against PostHog directly

When the user questions a number, query PostHog with curl rather than
trusting the dashboard:
```bash
curl -s -X POST "https://us.posthog.com/api/projects/$PROJECT/query/" \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"query":{"kind":"HogQLQuery","query":"SELECT ..."}}'
```
Credentials are in `.env`.

## Gotchas

- **PostHog rate-limit (429s).** The dashboard fires 40+ parallel requests on
  page load. The cache layer protects against this; if you bypass it you'll
  hit limits. Don't add a new endpoint without query-level caching.
- **`/welcome` and `/signup`** are intentionally excluded from Entry Pages
  (they're post-signup destinations, not entries). Don't "fix" this.
- **The 5→30 min auto-refresh** was tuned by the user to reduce PostHog API
  load. Don't change it back.
- **`pencil` MCP files (`.pen`)** are encrypted; only access via the pencil
  MCP tools, never `Read` or `Grep`.

## Working style the user prefers

- **Terse responses, no fluff.** Don't summarize what you just did unless
  asked. Don't over-explain.
- **Don't go beyond the ask.** The user explicitly reverted a "review the
  whole design" pass once because they only wanted the Rageclicks card
  improved. Match the scope of the request.
- **Show evidence with real data when proposing changes.** Run a HogQL query
  first, then propose the change with concrete numbers.
- **Confirm before risky actions.** Commits, pushes, deletes, deploys —
  always confirm unless the user just gave the green light.
- **For exploratory questions** ("what could we do about X?"), reply in 2–3
  sentences with a recommendation and the main tradeoff. Don't implement
  until the user agrees.

## Recent direction (2026-Q2)

- Removed all A/B testing components and endpoints.
- Split Menu Navigation into separate Mobile / Desktop cards with conversion rates.
- Added Rageclicks (page-by-page issue cards with plain-English fix
  suggestions; surfaces 10× conversion lift of rageclickers vs baseline).
- Added Click Heatmap (per-page element ranking + tabs for click /
  rageclick / change / submit + deep-link to PostHog visual heatmap).
- Rewrote Traffic Sources to detect paid via gclid/msclkid (84% paid).
- Entry Pages now show paid/organic/direct/other split per page.
- TrafficByDay flipped from "peak day" framing to "traffic vs conversion"
  comparison after data revealed Wed = busiest but 2.8% conv, Sat = quietest
  but 7.2% conv.
