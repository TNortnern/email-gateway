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
    eventWebhookUrl?: string | null
    eventWebhookSecret?: string | null
    eventWebhookEvents?: string | null
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

  if (body.eventWebhookUrl !== undefined) {
    if (body.eventWebhookUrl !== null && typeof body.eventWebhookUrl !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Event webhook URL must be a string or null'
      })
    }
    updates.eventWebhookUrl = body.eventWebhookUrl?.trim() || null
  }

  if (body.eventWebhookSecret !== undefined) {
    if (body.eventWebhookSecret !== null && typeof body.eventWebhookSecret !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Event webhook secret must be a string or null'
      })
    }
    updates.eventWebhookSecret = body.eventWebhookSecret?.trim() || null
  }

  if (body.eventWebhookEvents !== undefined) {
    if (body.eventWebhookEvents !== null && !Array.isArray(body.eventWebhookEvents)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Event webhook events must be an array of strings or null'
      })
    }
    if (Array.isArray(body.eventWebhookEvents)) {
      const cleaned = body.eventWebhookEvents
        .filter((v: unknown) => typeof v === 'string')
        .map((v: string) => v.trim())
        .filter(Boolean)
      updates.eventWebhookEvents = cleaned.length ? JSON.stringify(cleaned) : null
    } else {
      updates.eventWebhookEvents = null
    }
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
