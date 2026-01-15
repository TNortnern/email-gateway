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
  const message = db.getMessageById(id!)

  if (!message) {
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
