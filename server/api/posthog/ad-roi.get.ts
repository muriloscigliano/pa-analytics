export default defineEventHandler(async (event) => {
  if (!isPostHogConfigured()) return { channels: [], campaigns: [], totals: {} }
  const days = Number(getQuery(event).days) || 30

  const [channelData, campaignData, totalsData] = await Promise.all([
    // Assign each PERSON to ONE channel (first-touch attribution)
    queryPostHog(`
      SELECT
        channel,
        count() AS visitors,
        countIf(has_form = 1) AS converters,
        countIf(has_login = 1) AS loggers,
        countIf(has_phone = 1) AS callers
      FROM (
        SELECT
          person_id,
          if(
            argMin(properties.$current_url, timestamp) LIKE '%gclid%'
            OR argMin(properties.$current_url, timestamp) LIKE '%gad_source%'
            OR argMin(properties.$current_url, timestamp) LIKE '%msclkid%',
            'Paid Search',
            if(
              argMin(properties.$referring_domain, timestamp) LIKE '%google%'
              OR argMin(properties.$referring_domain, timestamp) LIKE '%bing%'
              OR argMin(properties.$referring_domain, timestamp) LIKE '%yahoo%',
              'Organic Search',
              if(
                argMin(properties.$referring_domain, timestamp) = '$direct'
                OR argMin(properties.$referring_domain, timestamp) = '',
                'Direct',
                if(
                  argMin(properties.$referring_domain, timestamp) LIKE '%payadvantage%',
                  'Unassigned',
                  'Referral'
                )
              )
            )
          ) AS channel,
          if(person_id IN (SELECT DISTINCT person_id FROM events WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY), 1, 0) AS has_form,
          if(person_id IN (SELECT DISTINCT person_id FROM events WHERE event = 'login_clicked' AND timestamp >= now() - INTERVAL ${days} DAY), 1, 0) AS has_login,
          if(person_id IN (SELECT DISTINCT person_id FROM events WHERE event = 'phone_cta_clicked' AND timestamp >= now() - INTERVAL ${days} DAY), 1, 0) AS has_phone
        FROM events
        WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
          AND properties.$referring_domain NOT LIKE '%localhost%'
        GROUP BY person_id
      )
      GROUP BY channel ORDER BY visitors DESC
    `),

    // Campaign breakdown for paid search
    queryPostHog(`
      SELECT
        campaign_id,
        landing_page,
        count() AS visitors,
        countIf(has_form = 1) AS converters,
        countIf(has_login = 1) AS loggers,
        countIf(has_phone = 1) AS callers
      FROM (
        SELECT
          person_id,
          extractURLParameter(argMin(properties.$current_url, timestamp), 'gad_campaignid') AS campaign_id,
          if(replaceRegexpAll(argMin(properties.$pathname, timestamp), '/+$', '') = '', '/',
            replaceRegexpAll(argMin(properties.$pathname, timestamp), '/+$', '')) AS landing_page,
          if(person_id IN (SELECT DISTINCT person_id FROM events WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY), 1, 0) AS has_form,
          if(person_id IN (SELECT DISTINCT person_id FROM events WHERE event = 'login_clicked' AND timestamp >= now() - INTERVAL ${days} DAY), 1, 0) AS has_login,
          if(person_id IN (SELECT DISTINCT person_id FROM events WHERE event = 'phone_cta_clicked' AND timestamp >= now() - INTERVAL ${days} DAY), 1, 0) AS has_phone
        FROM events
        WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
          AND (properties.$current_url LIKE '%gclid%' OR properties.$current_url LIKE '%gad_source%' OR properties.utm_medium = 'cpc')
        GROUP BY person_id
      )
      GROUP BY campaign_id, landing_page ORDER BY visitors DESC LIMIT 15
    `),

    // True totals (unique people)
    queryPostHog(`
      SELECT
        count(DISTINCT person_id) AS visitors,
        uniqIf(person_id, person_id IN (SELECT DISTINCT person_id FROM events WHERE event = 'form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY)) AS converters,
        uniqIf(person_id, person_id IN (SELECT DISTINCT person_id FROM events WHERE event = 'login_clicked' AND timestamp >= now() - INTERVAL ${days} DAY)) AS loggers,
        uniqIf(person_id, person_id IN (SELECT DISTINCT person_id FROM events WHERE event = 'phone_cta_clicked' AND timestamp >= now() - INTERVAL ${days} DAY)) AS callers
      FROM events
      WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY
        AND properties.$referring_domain NOT LIKE '%localhost%'
    `),
  ])

  const campaignNames: Record<string, string> = {
    '656828595': 'PD | Brand',
    '1598065430': 'PD | Generic | BPAY',
    '1598613037': 'PD | Generic | Virtual Terminal',
    '1598613043': 'PD | Generic | Credit Card',
    '1631861672': 'PD | Generic | Xero Integration',
    '689793963': 'PD | Generic | Direct Debit | BROAD',
    '23635375886': 'PD | Generic | Subscription | BROAD',
    '23635375889': 'PD | Generic | Direct Debit | EXACT',
    '23635375892': 'PD | Generic | Credit Card | EXACT',
    '23635375883': 'PD | Generic | Credit Card | BROAD',
    '23684341595': 'PD | Generic | Subscription / DD | PHRASE',
    '23684341598': 'PD | Generic | Subscription / DD | EXACT',
    '23635430564': 'PD | Generic | Xero | EXACT',
    '23266875276': 'PD | Generic | Payment Requests',
    '23217904988': 'PD | Generic | Developers',
  }

  const t = totalsData.results?.[0] || [0, 0, 0, 0]

  return {
    channels: channelData.results.map(([channel, visitors, converters, loggers, callers]: [string, number, number, number, number]) => ({
      channel, visitors, converters, loggers, callers,
      convRate: visitors > 0 ? Math.round((converters / visitors) * 1000) / 10 : 0,
      loginRate: visitors > 0 ? Math.round((loggers / visitors) * 1000) / 10 : 0,
    })),
    campaigns: campaignData.results.map(([campaignId, landingPage, visitors, converters, loggers, callers]: [string, string, number, number, number, number]) => ({
      campaignId: campaignId || 'Unknown',
      campaignName: campaignNames[campaignId] || '',
      landingPage, visitors, converters, loggers, callers,
      convRate: visitors > 0 ? Math.round((converters / visitors) * 1000) / 10 : 0,
      loginRate: visitors > 0 ? Math.round((loggers / visitors) * 1000) / 10 : 0,
    })),
    totals: {
      visitors: t[0],
      converters: t[1],
      loggers: t[2],
      callers: t[3],
      convRate: t[0] > 0 ? Math.round((t[1] / t[0]) * 1000) / 10 : 0,
      loginRate: t[0] > 0 ? Math.round((t[2] / t[0]) * 1000) / 10 : 0,
    },
  }
})
