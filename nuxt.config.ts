// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  devServer: {
    port: 3010
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  runtimeConfig: {
    posthogPersonalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
    posthogProjectId: process.env.POSTHOG_PROJECT_ID,
    posthogHost: process.env.POSTHOG_HOST || 'https://us.posthog.com',
  },

  css: [
    './styles/tokens.css',
    './styles/tokens-foundation.css',
    './styles/tokens-semantic.css',
    './styles/tokens-semantic-dark.css',
    './styles/tokens-typography.css',
    './styles/tokens-dark.css',
    './styles/shared.css',
    './styles/dashboard.css',
    './styles/dashboard-light.css',
  ],

  modules: ['@nuxtjs/tailwindcss']
})
