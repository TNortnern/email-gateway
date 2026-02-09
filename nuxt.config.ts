// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  components: [
    {
      path: '~/components/ui',
      pathPrefix: false,
    },
    '~/components'
  ],

  runtimeConfig: {
    // Server-only secrets
    brevoApiKey: process.env.BREVO_API_KEY || '',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    brevoWebhookToken: process.env.BREVO_WEBHOOK_TOKEN || '',
    eventNotifyTo: process.env.EVENT_NOTIFY_TO || '',
    eventNotifyFromEmail: process.env.EVENT_NOTIFY_FROM_EMAIL || '',
    eventNotifyFromName: process.env.EVENT_NOTIFY_FROM_NAME || '',
    eventNotifyEvents: process.env.EVENT_NOTIFY_EVENTS || 'opened,clicked,delivered,hard_bounce,soft_bounce,spam,unsubscribed',

    // Public config (exposed to client)
    public: {
      defaultFromEmail: process.env.DEFAULT_FROM_EMAIL || 'support@tnorthern.com',
      defaultFromName: process.env.DEFAULT_FROM_NAME || 'Support',
    }
  },

  nitro: {
    experimental: {
      asyncContext: true
    }
  }
})
