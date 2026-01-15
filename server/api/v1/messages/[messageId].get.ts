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

  // Get the message
  const message = await db.getMessageById(messageId!)

  if (!message || message.appKeyId !== appKeyRecord.id) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Message not found'
    })
  }

  return {
    id: message.id,
    messageId: message.messageId,
    to: JSON.parse(message.toAddresses),
    cc: message.ccAddresses ? JSON.parse(message.ccAddresses) : null,
    bcc: message.bccAddresses ? JSON.parse(message.bccAddresses) : null,
    from: {
      email: message.fromEmail,
      name: message.fromName
    },
    subject: message.subject,
    templateId: message.templateId,
    tags: message.tags ? JSON.parse(message.tags) : [],
    status: message.status,
    providerResponse: message.providerResponse ? JSON.parse(message.providerResponse) : null,
    idempotencyKey: message.idempotencyKey,
    createdAt: message.createdAt
  }
})
