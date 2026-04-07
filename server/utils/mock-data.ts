/**
 * Real PostHog data cached from API queries (last synced: 2026-04-07).
 * Used when PostHog Personal API Key is not configured in .env.
 * To refresh: re-run API queries and update this file.
 */

export const MOCK = {
  overview: {
    pageviews: 4736,
    uniqueUsers: 2820,
    formSubmissions: 114,
    formSubmitters: 95,
    signups: 0,
  },

  pageviews: {
    columns: ['day', 'views'],
    results: [
      ['2026-03-28', 160],
      ['2026-03-29', 247],
      ['2026-03-30', 559],
      ['2026-03-31', 532],
      ['2026-04-01', 1037],
      ['2026-04-02', 728],
      ['2026-04-03', 390],
      ['2026-04-04', 276],
      ['2026-04-05', 272],
      ['2026-04-06', 414],
      ['2026-04-07', 121],
    ],
  },

  topPages: {
    columns: ['url', 'views', 'unique_visitors'],
    results: [
      ['/', 2505, 1408],
      ['/subscriptions', 725, 605],
      ['/accept-credit-card-payments', 357, 311],
      ['/welcome', 148, 104],
      ['/xero-integration', 146, 124],
      ['/pricing', 142, 102],
      ['/bpay-payments', 140, 115],
      ['/virtual-terminal', 113, 101],
      ['/payment-requests', 107, 96],
      ['/contact', 83, 50],
      ['/developers', 62, 51],
      ['/direct-debit', 57, 46],
      ['/signup', 46, 42],
      ['/payid-payments', 14, 13],
      ['/about-us', 13, 12],
    ],
  },

  funnel: [
    { action_id: '$pageview', name: '$pageview', custom_name: 'Page View', order: 0, count: 2819, type: 'events', average_conversion_time: null, median_conversion_time: null },
    { action_id: 'form_submitted', name: 'form_submitted', custom_name: 'Form Submitted', order: 1, count: 95, type: 'events', average_conversion_time: 435.99, median_conversion_time: 300.15 },
    { action_id: 'signup_completed_server', name: 'signup_completed_server', custom_name: 'Signup Completed', order: 2, count: 0, type: 'events', average_conversion_time: null, median_conversion_time: null },
  ],

  sections: {
    columns: ['section', 'page', 'views', 'unique_users'],
    results: [
      ['Subscriptions', '/', 234, 216],
      ['Customer Insights', '/', 197, 183],
      ['Industries', '/', 196, 176],
      ['CC Highlights', '/accept-credit-card-payments', 192, 183],
      ['Support', '/', 177, 166],
      ['CC Virtual Terminal', '/accept-credit-card-payments', 155, 146],
      ['Trusted Brands', '/', 148, 141],
      ['Features Bottom', '/', 147, 141],
      ['Signup Form', '/signup', 133, 119],
      ['Subs Payments Handling', '/subscriptions', 130, 128],
      ['CC Pay by Link', '/accept-credit-card-payments', 128, 123],
      ['Subs Stats', '/subscriptions', 120, 119],
      ['CC Apple Google Pay', '/accept-credit-card-payments', 117, 112],
      ['Subs Why Choose Us', '/subscriptions', 115, 114],
      ['CC On Charge Fees', '/accept-credit-card-payments', 106, 102],
    ],
  },

  abComparison: {
    columns: ['variant', 'event', 'total', 'users'],
    results: [
      ['control', '$autocapture', 1456, 333],
      ['control', '$pageview', 1285, 721],
      ['control', '$pageleave', 839, 438],
      ['control', 'section_viewed', 768, 173],
      ['control', '$web_vitals', 751, 377],
      ['control', 'login_clicked', 507, 228],
      ['control', 'mobile_menu_toggled', 183, 106],
      ['control', 'cta_clicked', 69, 38],
      ['control', 'menu_opened', 52, 27],
      ['control', 'menu_link_clicked', 42, 31],
      ['control', 'form_submitted', 22, 16],
      ['control', 'header_cta_clicked', 21, 19],
      ['none', '$autocapture', 1836, 185],
      ['none', 'section_viewed', 1417, 319],
      ['none', '$pageview', 790, 621],
      ['none', '$web_vitals', 579, 346],
      ['none', '$pageleave', 389, 334],
      ['none', 'cta_clicked', 143, 94],
      ['none', 'form_submitted', 34, 34],
      ['none', 'header_cta_clicked', 25, 25],
    ],
  },

  visitorTypes: {
    columns: ['visitor_type', 'pageviews', 'users', 'clicks', 'sections_viewed'],
    results: [
      ['new', 2394, 2079, 2771, 2338],
      ['returning', 1552, 602, 1989, 523],
      ['unknown', 790, 622, 1836, 1417],
    ],
  },

  devices: {
    columns: ['device', 'browser', 'os', 'pageviews', 'users'],
    results: [
      ['Desktop', 'Chrome', 'Windows', 1319, 853],
      ['Mobile', 'Mobile Safari', 'iOS', 1109, 699],
      ['Mobile', 'Chrome', 'Android', 757, 470],
      ['Desktop', 'Chrome', 'Mac OS X', 390, 157],
      ['Desktop', 'Microsoft Edge', 'Windows', 287, 179],
      ['Desktop', 'Safari', 'Mac OS X', 263, 108],
      ['Mobile', 'Chrome iOS', 'iOS', 209, 105],
      ['Mobile', 'Samsung Internet', 'Android', 146, 100],
      ['Desktop', 'Chrome', 'Chrome OS', 96, 53],
      ['Desktop', 'Chrome', 'Linux', 66, 44],
    ],
  },

  trafficSources: {
    columns: ['nav_source', 'visits', 'users'],
    results: [
      ['direct', 4346, 2815],
      ['menu_mobile', 292, 108],
      ['menu_desktop', 98, 23],
    ],
  },

  scrollDepth: {
    columns: ['page', 'avg_scroll_pct', 'avg_duration_sec', 'avg_content_pct', 'samples'],
    results: [
      ['/', 90.4, 241.8, 98.9, 83],
      ['/subscriptions', 98.0, 153.6, 100.0, 51],
      ['/accept-credit-card-payments', 68.4, 142.3, 100.0, 38],
      ['/contact', 100.0, 1055.1, 100.0, 28],
      ['/pricing', 95.8, 1478.4, 100.0, 24],
      ['/virtual-terminal', 83.3, 1034.2, 100.0, 18],
      ['/payment-requests', 100.0, 214.1, 100.0, 12],
      ['/signup', 83.3, 51.6, 100.0, 12],
      ['/xero-integration', 81.8, 304.3, 100.0, 11],
      ['/bpay-payments', 100.0, 41.9, 100.0, 10],
    ],
  },

  geo: {
    columns: ['country', 'city', 'pageviews', 'users'],
    results: [
      ['Australia', 'Sydney', 1146, 655],
      ['Australia', 'Melbourne', 1129, 595],
      ['Australia', 'Brisbane', 719, 420],
      ['United States', null, 414, 402],
      ['Australia', 'Perth', 262, 159],
      ['Australia', 'Adelaide', 184, 123],
      ['Australia', null, 111, 67],
      ['Australia', 'Gold Coast', 47, 23],
      ['Australia', 'Canberra', 40, 22],
      ['United States', 'Council Bluffs', 31, 31],
    ],
  },

  webVitals: {
    columns: ['avg_fcp', 'avg_lcp', 'avg_cls', 'avg_inp', 'samples'],
    results: [[2098, 3079, 0.02653, 106, 2903]],
  },

  pageExits: {
    columns: ['page', 'exits', 'avg_duration_sec', 'users'],
    results: [
      ['/', 1779, 861.7, 911],
      ['/subscriptions', 258, 1270.2, 216],
      ['/accept-credit-card-payments', 152, 1083.9, 139],
      ['/bpay-payments', 80, 192.6, 73],
      ['/welcome', 69, 6595.3, 51],
      ['/pricing', 64, 348.2, 55],
      ['/virtual-terminal', 63, 1632.7, 58],
      ['/payment-requests', 58, 113.6, 56],
      ['/xero-integration', 51, 144.9, 50],
      ['/direct-debit', 45, 63.2, 35],
    ],
  },

  formSubmissions: {
    columns: ['form_type', 'page', 'submissions', 'users'],
    results: [
      ['signup', '/signup', 60, 56],
      ['modal', '/bpay-payments', 10, 10],
      ['contact', '/contact', 9, 4],
      ['modal', '/subscriptions', 9, 9],
      ['modal', '/pricing', 8, 8],
      ['modal', '/payment-requests', 4, 4],
      ['modal', '/accept-credit-card-payments', 4, 4],
      ['modal', '/xero-integration', 3, 3],
      ['modal', '/', 3, 3],
      ['inline_signup', '/accept-credit-card-payments', 1, 1],
      ['inline_signup', '/subscriptions', 1, 1],
      ['modal', '/contact', 1, 1],
      ['inline_signup', '/', 1, 1],
    ],
  },

  menuNavigation: {
    columns: ['event_type', 'link_name', 'destination', 'menu_source', 'clicks', 'users'],
    results: [
      ['header_cta_clicked', null, null, null, 91, 81],
      ['menu_link_clicked', '/pricing', '/pricing', 'mobile_menu', 23, 23],
      ['menu_link_clicked', 'Direct Debit', '/subscriptions', 'mobile_menu', 20, 19],
      ['menu_link_clicked', '/contact', '/contact', 'mobile_menu', 17, 14],
      ['menu_link_clicked', 'Credit Card', '/accept-credit-card-payments', 'mobile_menu', 16, 16],
      ['menu_link_clicked', null, '/subscriptions', 'mobile_menu', 14, 12],
      ['menu_link_clicked', null, '/contact', 'mobile_menu', 14, 10],
      ['menu_link_clicked', 'Get Started Free', '/signup', 'mobile_menu', 12, 10],
      ['menu_link_clicked', 'Direct Debit', '/subscriptions', 'desktop_mega_menu', 11, 9],
      ['menu_link_clicked', 'PayID', '/payid-payments', 'mobile_menu', 10, 10],
    ],
  },

  leadsSignups: {
    columns: ['day', 'leads', 'signups'],
    results: [
      ['2026-03-28', 5, 4],
      ['2026-03-29', 9, 4],
      ['2026-03-30', 8, 5],
      ['2026-03-31', 6, 6],
      ['2026-04-01', 3, 7],
      ['2026-04-02', 6, 7],
      ['2026-04-03', 4, 8],
      ['2026-04-04', 2, 8],
      ['2026-04-05', 5, 4],
      ['2026-04-06', 5, 7],
      ['2026-04-07', 1, 0],
    ],
  },
}
