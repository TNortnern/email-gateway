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

  const id = getRouterParam(event, 'id')

  // Revoke the key (soft delete)
  const success = db.revokeAppKey(id!)

  if (!success) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'App key not found or already revoked'
    })
  }

  return {
    success: true,
    message: 'API key revoked successfully'
  }
})
