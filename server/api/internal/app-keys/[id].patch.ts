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
  const body = await readBody(event)

  // Validate input
  const updates: {
    name?: string
    defaultFromEmail?: string
    defaultFromName?: string
  } = {}

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Name must be a non-empty string'
      })
    }
    updates.name = body.name.trim()
  }

  if (body.defaultFromEmail !== undefined) {
    if (body.defaultFromEmail !== null && typeof body.defaultFromEmail !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Default from email must be a string or null'
      })
    }
    updates.defaultFromEmail = body.defaultFromEmail?.trim() || null
  }

  if (body.defaultFromName !== undefined) {
    if (body.defaultFromName !== null && typeof body.defaultFromName !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Default from name must be a string or null'
      })
    }
    updates.defaultFromName = body.defaultFromName?.trim() || null
  }

  // Check if there are any updates
  if (Object.keys(updates).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'No valid fields to update'
    })
  }

  // Update the key
  const updatedKey = await db.updateAppKey(id!, updates)

  if (!updatedKey) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'App key not found'
    })
  }

  return {
    success: true,
    key: updatedKey
  }
})
