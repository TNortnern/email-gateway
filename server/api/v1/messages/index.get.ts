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

  // Get query parameters
  const query = getQuery(event)
  const limit = Math.min(parseInt(query.limit as string) || 50, 100)
  const cursor = query.cursor as string | undefined

  const { messages, hasMore } = db.getMessagesByAppKey(appKeyRecord.id, limit, cursor)

  const nextCursor = hasMore && messages.length > 0 ? messages[messages.length - 1]?.created_at : undefined

  return {
    messages: messages.map(m => ({
      id: m.id,
      messageId: m.message_id,
      to: JSON.parse(m.to_addresses),
      from: {
        email: m.from_email,
        name: m.from_name
      },
      subject: m.subject,
      templateId: m.template_id,
      tags: m.tags ? JSON.parse(m.tags) : [],
      status: m.status,
      createdAt: m.created_at
    })),
    cursor: nextCursor
  }
})
