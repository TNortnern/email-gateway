import { sendEmail, type BrevoSendRequest } from '~/server/utils/brevo'
import db from '~/server/utils/db'
import { generateId } from '~/server/utils/crypto'
import { processEmailHtml } from '~/server/utils/email-templates'

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

  const body = await readBody(event)

  // Get the app key record
  const appKeyRecord = db.getAppKeyById(body.keyId)

  if (!appKeyRecord || appKeyRecord.revoked_at) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'App key not found or revoked'
    })
  }

  // Build the Brevo request
  const fromEmail = appKeyRecord.default_from_email || config.public.defaultFromEmail
  const fromName = appKeyRecord.default_from_name || config.public.defaultFromName

  // Process HTML with template if specified
  let finalHtml = body.html
  if (body.html && body.template) {
    finalHtml = processEmailHtml(body.html, {
      template: body.template,
      templateData: body.templateData,
      inlineCss: body.inlineCss !== false
    })
  }

  const brevoRequest: BrevoSendRequest = {
    sender: {
      email: fromEmail,
      name: fromName || undefined
    },
    to: body.to,
    subject: body.subject,
    htmlContent: finalHtml,
    textContent: body.text,
    attachment: body.attachments?.map((att: any) => ({
      name: att.name,
      content: att.contentBase64
    })),
    tags: ['test-email']
  }

  // Create message record
  const messageRecordId = generateId()

  const newMessage = db.insertMessage({
    id: messageRecordId,
    app_key_id: appKeyRecord.id,
    message_id: null,
    to_addresses: JSON.stringify(body.to),
    cc_addresses: null,
    bcc_addresses: null,
    from_email: fromEmail,
    from_name: fromName || null,
    subject: body.subject,
    template_id: null,
    tags: JSON.stringify(['test-email']),
    status: 'pending',
    provider_response: null,
    idempotency_key: null
  })

  // Send via Brevo
  const result = await sendEmail(config.brevoApiKey, brevoRequest)

  if (result.success) {
    // Update message record with success
    db.updateMessage(messageRecordId, {
      message_id: result.data.messageId,
      status: 'queued',
      provider_response: JSON.stringify(result.data)
    })

    return {
      messageId: result.data.messageId,
      internalId: messageRecordId,
      status: 'queued',
      provider: 'brevo'
    }
  } else {
    // Update message record with failure
    db.updateMessage(messageRecordId, {
      status: 'failed',
      provider_response: JSON.stringify(result.error)
    })

    throw createError({
      statusCode: 502,
      statusMessage: result.error.code,
      message: result.error.message
    })
  }
})
