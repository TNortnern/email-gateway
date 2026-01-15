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

  const id = getRouterParam(event, 'id')

  // Get the message
  const message = await db.getMessageById(id!)

  if (!message) {
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
