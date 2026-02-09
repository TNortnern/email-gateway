import db from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // Check admin authentication
  const adminAuth = getCookie(event, 'admin_auth')
  const config = useRuntimeConfig()

  if (adminAuth !== config.adminPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Admin authentication required'
    })
  }

  // Get all app keys
  const keys = await db.getAllAppKeys()

  return {
    keys: keys.map(k => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      defaultFromName: k.defaultFromName,
      defaultFromEmail: k.defaultFromEmail,
      tags: k.tags ? JSON.parse(k.tags) : [],
      eventWebhookUrl: k.eventWebhookUrl || null,
      eventWebhookEvents: k.eventWebhookEvents ? JSON.parse(k.eventWebhookEvents) : [],
      hasEventWebhookSecret: !!k.eventWebhookSecret,
      isRevoked: !!k.revokedAt,
      revokedAt: k.revokedAt,
      createdAt: k.createdAt
    }))
  }
})
