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

  const { messages, hasMore } = db.getAllMessages(limit, cursor)

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
