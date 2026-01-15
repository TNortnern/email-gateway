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
  const keys = db.getAllAppKeys()

  return {
    keys: keys.map(k => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.key_prefix,
      defaultFromName: k.default_from_name,
      defaultFromEmail: k.default_from_email,
      tags: k.tags ? JSON.parse(k.tags) : [],
      isRevoked: !!k.revoked_at,
      revokedAt: k.revoked_at,
      createdAt: k.created_at
    }))
  }
})
