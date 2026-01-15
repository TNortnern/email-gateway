import { sendEmailSchema, type SendEmailRequest } from '~/server/utils/validation'
import { sendEmail, type BrevoSendRequest } from '~/server/utils/brevo'
import db, { type AppKey, type Message } from '~/server/utils/db'
import { hashKey, generateId, generateMessageId } from '~/server/utils/crypto'
import { processEmailHtml } from '~/server/utils/email-templates'

// Max attachment size: 20MB total
const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Get and validate Authorization header
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Use: Bearer <app_key>'
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

  // Parse and validate request body
  const body = await readBody(event)
  const parseResult = sendEmailSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      message: parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    })
  }

  const request: SendEmailRequest = parseResult.data

  // Check for idempotency
  if (request.idempotencyKey) {
    const existingMessage = await db.getMessageByIdempotencyKey(appKeyRecord.id, request.idempotencyKey)

    if (existingMessage) {
      // Return the existing response
      return {
        messageId: existingMessage.messageId || existingMessage.id,
        status: existingMessage.status,
        provider: 'brevo',
        cached: true
      }
    }
  }

  // Calculate total attachment size
  if (request.attachments?.length) {
    const totalSize = request.attachments.reduce((sum, att) => {
      // Base64 is ~4/3 the size of binary
      return sum + (att.contentBase64.length * 0.75)
    }, 0)

    if (totalSize > MAX_ATTACHMENT_SIZE) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payload Too Large',
        message: `Total attachment size exceeds ${MAX_ATTACHMENT_SIZE / 1024 / 1024}MB limit`
      })
    }
  }

  // Build the Brevo request
  const fromEmail = request.from?.email || appKeyRecord.defaultFromEmail || config.public.defaultFromEmail
  const fromName = request.from?.name || appKeyRecord.defaultFromName || config.public.defaultFromName

  // Process HTML with template if specified
  let finalHtml = request.html
  if (request.html && request.template) {
    finalHtml = processEmailHtml(request.html, {
      template: request.template,
      templateData: request.templateData,
      inlineCss: request.inlineCss
    })
  }

  const brevoRequest: BrevoSendRequest = {
    sender: {
      email: fromEmail,
      name: fromName || undefined
    },
    to: request.to,
    cc: request.cc,
    bcc: request.bcc,
    replyTo: request.replyTo,
    subject: request.subject,
    htmlContent: finalHtml,
    textContent: request.text,
    templateId: request.templateId,
    params: request.params,
    tags: request.tags,
    attachment: request.attachments?.map(att => ({
      name: att.name,
      content: att.contentBase64
    }))
  }

  // Create message record
  const messageRecordId = generateId()

  const newMessage = await db.insertMessage({
    id: messageRecordId,
    appKeyId: appKeyRecord.id,
    messageId: null,
    toAddresses: JSON.stringify(request.to),
    ccAddresses: request.cc ? JSON.stringify(request.cc) : null,
    bccAddresses: request.bcc ? JSON.stringify(request.bcc) : null,
    fromEmail,
    fromName: fromName || null,
    subject: request.subject || null,
    templateId: request.templateId || null,
    tags: request.tags ? JSON.stringify(request.tags) : null,
    status: 'pending',
    providerResponse: null,
    idempotencyKey: request.idempotencyKey || null
  })

  // Send via Brevo
  const result = await sendEmail(config.brevoApiKey, brevoRequest)

  if (result.success) {
    // Update message record with success
    await db.updateMessage(messageRecordId, {
      messageId: result.data.messageId,
      status: 'queued',
      providerResponse: JSON.stringify(result.data)
    })

    setResponseStatus(event, 201)
    return {
      messageId: result.data.messageId,
      status: 'queued',
      provider: 'brevo'
    }
  } else {
    // Update message record with failure
    await db.updateMessage(messageRecordId, {
      status: 'failed',
      providerResponse: JSON.stringify(result.error)
    })

    // Map Brevo errors to appropriate status codes
    const statusCode = result.error.code === 'NETWORK_ERROR' ? 502 : 400

    throw createError({
      statusCode,
      statusMessage: result.error.code,
      message: result.error.message
    })
  }
})
