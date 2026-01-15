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
  const appKeyRecord = db.getAppKeyByHash(keyHash)

  if (!appKeyRecord) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid or revoked API key'
    })
  }

  const messageId = getRouterParam(event, 'messageId')

  // Get the message
  const message = db.getMessageById(messageId!)

  if (!message || message.app_key_id !== appKeyRecord.id) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Message not found'
    })
  }

  return {
    id: message.id,
    messageId: message.message_id,
    to: JSON.parse(message.to_addresses),
    cc: message.cc_addresses ? JSON.parse(message.cc_addresses) : null,
    bcc: message.bcc_addresses ? JSON.parse(message.bcc_addresses) : null,
    from: {
      email: message.from_email,
      name: message.from_name
    },
    subject: message.subject,
    templateId: message.template_id,
    tags: message.tags ? JSON.parse(message.tags) : [],
    status: message.status,
    providerResponse: message.provider_response ? JSON.parse(message.provider_response) : null,
    idempotencyKey: message.idempotency_key,
    createdAt: message.created_at
  }
})
