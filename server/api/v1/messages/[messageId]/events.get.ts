import db from '~/server/utils/db'
import { hashKey } from '~/server/utils/crypto'

export default defineEventHandler(async (event) => {
  // Get and validate Authorization header
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Missing or invalid Authorization header'
    })
  }

  const appKey = authHeader.substring(7)
  const keyHash = hashKey(appKey)

  // Look up the app key
  const appKeyRecord = await db.getAppKeyByHash(keyHash)

  if (!appKeyRecord) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid or revoked API key'
    })
  }

  const messageId = getRouterParam(event, 'messageId')
  if (!messageId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Missing messageId'
    })
  }

  // Get the message (internal id or provider message id)
  const message = await db.getMessageById(messageId)

  if (!message || message.appKeyId !== appKeyRecord.id) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Message not found'
    })
  }

  const query = getQuery(event)
  const limit = Math.min(parseInt(query.limit as string) || 200, 500)

  const events = await db.getEmailEventsByMessageRecordId(appKeyRecord.id, message.id, limit)

  return {
    message: {
      id: message.id,
      messageId: message.messageId,
    },
    events: events.map(e => ({
      id: e.id,
      type: e.eventType,
      occurredAt: e.occurredAt,
      recipientEmail: e.recipientEmail,
      ip: e.ip,
      userAgent: e.userAgent,
      createdAt: e.createdAt,
    })),
  }
})

