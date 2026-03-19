/**
 * Real PostHog data cached from MCP queries (last synced: 2026-03-19).
 * Used when PostHog Personal API Key is not configured in .env.
 * To refresh: re-run MCP queries and update this file.
 */

export const MOCK = {
  overview: {
    pageviews: 101,
    uniqueUsers: 3,
    signups: 0,
  },

  pageviews: {
    columns: ['day', 'views'],
    results: [['2026-03-16', 13]],
  },

  topPages: {
    columns: ['url', 'views', 'unique_visitors'],
    results: [
      ['http://localhost:3005/', 12, 3],
      ['http://localhost:3005/signup', 1, 1],
    ],
  },

  funnel: [
    { action_id: '$pageview', name: '$pageview', custom_name: 'Page View', order: 0, count: 3, type: 'events', average_conversion_time: null, median_conversion_time: null },
    { action_id: 'section_viewed', name: 'section_viewed', custom_name: 'Section Viewed', order: 1, count: 3, type: 'events', average_conversion_time: 435.99, median_conversion_time: 300.15 },
    { action_id: '$autocapture', name: '$autocapture', custom_name: 'CTA Click', order: 2, count: 1, type: 'events', average_conversion_time: 45.46, median_conversion_time: 45.46 },
  ],

  sections: {
    columns: ['section', 'page', 'views', 'unique_users'],
    results: [
      ['API Integration', '/', 5, 3],
      ['Features', '/', 5, 3],
      ['Subscriptions', '/', 5, 3],
      ['Customer Insights', '/', 5, 3],
      ['Trusted Brands', '/', 4, 3],
      ['Get The App', '/', 3, 3],
      ['Business Industries', '/', 3, 3],
      ['Why Choose Us', '/', 3, 3],
    ],
  },

  clicks: {
    columns: ['page', 'button_text', 'link_to', 'clicks', 'users'],
    results: [
      ['/', 'Get Started', '', 1, 1],
      ['/signup', null, '/', 1, 1],
      ['/signup', null, '', 1, 1],
    ],
  },

  abComparison: {
    columns: ['variant', 'event', 'total', 'users'],
    results: [
      ['control', 'section_viewed', 21, 2],
      ['control', 'experiment_impression', 18, 2],
      ['control', '$pageleave', 9, 2],
      ['control', '$pageview', 8, 2],
      ['control', '$web_vitals', 8, 2],
      ['variant_b', 'section_viewed', 12, 1],
      ['variant_b', 'experiment_impression', 8, 1],
      ['variant_b', '$web_vitals', 6, 1],
      ['variant_b', '$pageview', 5, 1],
      ['variant_b', '$autocapture', 3, 1],
      ['variant_b', '$pageleave', 3, 1],
    ],
  },

  visitorTypes: {
    columns: ['visitor_type', 'pageviews', 'users', 'clicks', 'sections_viewed'],
    results: [
      ['returning', 13, 3, 3, 33],
    ],
  },

  devices: {
    columns: ['device', 'browser', 'os', 'pageviews', 'users'],
    results: [
      ['Desktop', 'Chrome', 'Mac OS X', 12, 3],
      ['Mobile', 'Mobile Safari', 'iOS', 1, 1],
    ],
  },

  trafficSources: {
    columns: ['referrer', 'visitor_type', 'visits', 'users'],
    results: [
      ['localhost:3005', 'returning', 9, 2],
      ['$direct', 'returning', 4, 1],
    ],
  },

  scrollDepth: {
    columns: ['page', 'avg_scroll_pct', 'avg_duration_sec', 'avg_content_pct', 'samples'],
    results: [
      ['/', 100, 48.1, 100, 1],
      ['/signup', 100, 22.3, 100, 1],
    ],
  },

  geo: {
    columns: ['country', 'city', 'pageviews', 'users'],
    results: [
      ['Australia', 'Sydney', 13, 3],
    ],
  },

  webVitals: {
    columns: ['avg_fcp', 'avg_lcp', 'avg_cls', 'avg_inp', 'samples'],
    results: [[1133, 1681, 0.00008, 172, 14]],
  },

  pageExits: {
    columns: ['page', 'exits', 'avg_duration_sec', 'users'],
    results: [
      ['/', 12, 713.5, 3],
    ],
  },

  formSubmissions: {
    columns: ['page', 'button_text', 'submissions', 'users'],
    results: [],
  },

  menuNavigation: {
    columns: ['menu_item', 'link_to', 'from_page', 'clicks', 'users'],
    results: [],
  },

  navSources: {
    columns: ['page', 'source', 'visits', 'users'],
    results: [
      ['/', 'localhost:3005', 8, 2],
      ['/', '$direct', 4, 1],
      ['/signup', 'localhost:3005', 1, 1],
    ],
  },
}
