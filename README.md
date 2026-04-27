# Pay Advantage Analytics Dashboard

Self-hosted website analytics dashboard for `payadvantage.com.au`, powered by
PostHog. Built on Nuxt 4 + Vue 3 + Tailwind. Renders ~50 cards of conversion,
engagement, and technical-health data sourced via HogQL.

## What it shows

Seven sections, top to bottom:

1. **Traffic & Acquisition** — KPIs, ad ROI, pageview trend, top pages, entry
   pages (split by paid / organic / direct), page flow, traffic sources, peak
   days/hours.
2. **Content Engagement** — click heatmap (per-page element ranking + clicks /
   rage clicks / form changes / submits), section engagement, section funnel.
3. **CTA Performance** — CTA performance, header CTA, phone clicks.
4. **Conversion Funnel** — funnel chart, page funnels, form submissions by
   day/hour, form quality.
5. **Lead Quality** — converter journey, conversion by visitor type / source /
   page / depth, pages-to-pricing/signup, device conversion, time to convert.
6. **Menu & Navigation** — mobile vs desktop nav engagement with conversion
   rates, login clicks.
7. **Technical Health** — rageclicks (with plain-English fix suggestions),
   leads/signups trend, page exits, scroll depth, geo + device breakdown,
   visitor types, web vitals.

## Setup

Requires Node 18+ and a PostHog Personal API key.

```bash
npm install
cp .env.example .env
# fill in POSTHOG_PERSONAL_API_KEY, POSTHOG_PROJECT_ID, POSTHOG_HOST
```

Get a Personal API key from PostHog → Settings → Personal API Keys.

## Development

```bash
npm run dev         # http://localhost:3010
```

Uses an in-memory cache (5 min TTL) for PostHog query results, so reloads stay
fast. Auto-refresh runs every 30 minutes; manual refresh button in the header.

## Build & Deploy

```bash
npm run build       # production build to .output/
npm run preview     # serve the production build locally
```

Standard Nuxt build — deploys cleanly to Vercel, Netlify, Cloudflare Pages,
Node, or Docker. No platform-specific config currently committed.

## Project structure

```
app/
  pages/index.vue              Single-page dashboard
  components/                  ~50 cards + 5 primitives
  composables/usePeriod.ts     Global period + refresh state
server/
  api/posthog/*.get.ts         44 endpoints, one per card
  utils/posthog.ts             Cached HogQL query wrapper
  utils/mock-data.ts           Fallback when creds missing
styles/
  dashboard.css                Dark theme + design tokens
  dashboard-light.css          Light theme overrides
```

## Tech stack

- **Nuxt 4** + Nitro server
- **Vue 3** Composition API
- **Tailwind CSS 6** + custom CSS variables for theming
- **Chart.js** via `vue-chartjs` for line/bar visualisations
- **PostHog HogQL API** as the only data source

## Data conventions

- **Marketing visitor counts** exclude users who clicked the login button
  (existing customers, not prospects). Applied in Entry Pages and Traffic
  Sources for consistency.
- **Paid traffic** is detected via `gclid` / `gad_source` / `msclkid` URL
  params on the landing URL — not just the referrer, since paid clicks often
  strip referrers (especially on iOS Safari and in-app browsers).
- **`signup_completed_server`** is referenced in several queries but is not
  yet instrumented on the website. KPIs and Funnel surface this with a
  "Pending instrumentation" annotation; the queries stay in place for when
  the event ships.

## Contributing

See [CLAUDE.md](./CLAUDE.md) for architecture details, conventions, and
common-task recipes (intended for AI assistants but useful for humans too).
