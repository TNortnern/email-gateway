import db from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Check admin authentication
  const adminAuth = getCookie(event, 'admin_auth')
  if (adminAuth !== config.adminPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Admin authentication required'
    })
  }

  // Get query parameters
  const query = getQuery(event)
  const limit = Math.min(parseInt(query.limit as string) || 50, 100)
  const cursor = query.cursor as string | undefined

  const { messages, hasMore } = await db.getAllMessages(limit, cursor)

  const nextCursor = hasMore && messages.length > 0 ? messages[messages.length - 1]?.createdAt : undefined

  return {
    messages: messages.map(m => ({
      id: m.id,
      messageId: m.messageId,
      to: JSON.parse(m.toAddresses),
      from: {
        email: m.fromEmail,
        name: m.fromName
      },
      subject: m.subject,
      templateId: m.templateId,
      tags: m.tags ? JSON.parse(m.tags) : [],
      status: m.status,
      createdAt: m.createdAt
    })),
    cursor: nextCursor
  }
})
