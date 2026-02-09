import db from '~/server/utils/db'
import { generateId } from '~/server/utils/crypto'
import { sendEmail } from '~/server/utils/brevo'

const SYSTEM_TAG_APP_KEY_PREFIX = 'egw:appKey:'
const SYSTEM_TAG_MESSAGE_PREFIX = 'egw:message:'
const NOTIFICATION_TAG = 'egw:notification'

function parseCsv(value: string): string[] {
  return value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

function normalizeEventType(value: string): string {
  const v = value.trim().toLowerCase()
  // Brevo uses "hardBounce"/"softBounce" in the UI; normalize to snake case.
  if (v === 'hardbounce') return 'hard_bounce'
  if (v === 'softbounce') return 'soft_bounce'
  if (v === 'markedasspam' || v === 'spam') return 'spam'
  return v
}

function normalizeTags(tags: unknown): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags.map(String)
  if (typeof tags === 'string') return [tags]
  return []
}

function pickFirstString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim().length) return v
  }
  return null
}

function toIsoMaybe(input: unknown): string | null {
  if (!input) return null

  if (typeof input === 'string') {
    // Allow already-ISO timestamps
    const s = input.trim()
    if (!s) return null
    const d = new Date(s)
    if (!Number.isNaN(d.getTime())) return d.toISOString()
    return null
  }

  if (typeof input === 'number') {
    // Brevo often sends epoch seconds; handle both seconds and ms.
    const ms = input > 10_000_000_000 ? input : input * 1000
    const d = new Date(ms)
    if (!Number.isNaN(d.getTime())) return d.toISOString()
    return null
  }

  return null
}

function formatRecipients(toAddressesJson: string): string {
  try {
    const parsed = JSON.parse(toAddressesJson) as Array<{ email?: string; name?: string }>
    return parsed
      .map(r => (r?.name ? `${r.name} <${r.email || ''}>` : (r?.email || '')))
      .filter(Boolean)
      .join(', ')
  } catch {
    return ''
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const expectedToken = (config.brevoWebhookToken || '').toString()
  const notifyTo = (config.eventNotifyTo || '').toString()
  const notifyEvents = parseCsv((config.eventNotifyEvents || '').toString()).map(normalizeEventType)

  if (!expectedToken) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: 'Webhook is not configured (BREVO_WEBHOOK_TOKEN missing)'
    })
  }

  const query = getQuery(event)
  const token = (query.token || '').toString()
  if (token !== expectedToken) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Invalid webhook token'
    })
  }

  const body = await readBody(event)
  const events = Array.isArray(body) ? body : [body]

  let ingested = 0
  let ignored = 0

  for (const raw of events) {
    if (!raw || typeof raw !== 'object') {
      ignored++
      continue
    }

    const payload = raw as Record<string, unknown>
    const tags = normalizeTags(payload.tags ?? payload.tag)
    const appTag = tags.find(t => t.startsWith(SYSTEM_TAG_APP_KEY_PREFIX)) || null
    const msgTag = tags.find(t => t.startsWith(SYSTEM_TAG_MESSAGE_PREFIX)) || null

    // Ignore events not sent through this gateway (or not tagged).
    if (!appTag || !msgTag) {
      ignored++
      continue
    }

    const appKeyId = appTag.substring(SYSTEM_TAG_APP_KEY_PREFIX.length)
    const messageRecordId = msgTag.substring(SYSTEM_TAG_MESSAGE_PREFIX.length)

    const providerMessageId =
      pickFirstString(payload, ['messageId', 'message-id', 'message_id', 'Message-Id', 'message-id-string']) ||
      null

    const eventTypeRaw =
      pickFirstString(payload, ['event', 'type', 'eventType']) ||
      'unknown'
    const eventType = normalizeEventType(eventTypeRaw)

    const occurredAt =
      toIsoMaybe(payload.date ?? payload.timestamp ?? payload.event_date ?? payload.occurredAt) ||
      null

    const recipientEmail =
      pickFirstString(payload, ['email', 'recipient', 'to']) ||
      null

    const ip = pickFirstString(payload, ['ip', 'ipAddress']) || null
    const userAgent = pickFirstString(payload, ['userAgent', 'user-agent']) || null

    try {
      // Fetch message so notifications can include context and we can de-dupe opens.
      const message = await db.getMessageById(messageRecordId)
      if (!message || message.appKeyId !== appKeyId) {
        ignored++
        continue
      }

      const wasOpened = (message.status || '').toLowerCase() === 'opened'

      await db.insertEmailEvent({
        id: generateId(),
        appKeyId,
        messageRecordId,
        providerMessageId,
        eventType,
        occurredAt,
        recipientEmail,
        ip,
        userAgent,
        providerPayload: JSON.stringify(payload),
      })

      // Best-effort status update: useful for "Opened" UX even without querying events.
      if (eventType === 'opened' && !wasOpened) {
        await db.updateMessage(messageRecordId, { status: 'opened' })
      }

      // Optional notification emails for operational visibility (ex: invoice opened).
      if (notifyTo && notifyEvents.includes(eventType)) {
        // De-dupe: only notify on the first open per message.
        if (eventType !== 'opened' || !wasOpened) {
          const notifyFromEmail =
            (config.eventNotifyFromEmail || '').toString() ||
            message.fromEmail ||
            config.public.defaultFromEmail
          const notifyFromName =
            (config.eventNotifyFromName || '').toString() ||
            config.public.defaultFromName

          const recipientList = parseCsv(notifyTo)
          // Best effort: link to the gateway UI. In production this should be the public base URL.
          const baseUrl = getRequestURL(event).origin
          const messageLink = `${baseUrl}/messages/${message.id}`
          const subject = `[Email Event] ${eventType.toUpperCase()}: ${message.subject || '(no subject)'}`

          const toLine = formatRecipients(message.toAddresses)
          const eventLine = occurredAt ? new Date(occurredAt).toLocaleString() : 'Unknown time'

          const html = `
            <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'; line-height: 1.4; color: #111827;">
              <h2 style="margin: 0 0 12px; font-size: 18px;">Email event received</h2>
              <div style="padding: 12px 14px; border: 1px solid #E5E7EB; border-radius: 10px; background: #FFFFFF;">
                <div style="margin: 0 0 6px;"><strong>Event:</strong> ${eventType}</div>
                <div style="margin: 0 0 6px;"><strong>Time:</strong> ${eventLine}</div>
                <div style="margin: 0 0 6px;"><strong>To:</strong> ${toLine || ''}</div>
                <div style="margin: 0 0 6px;"><strong>Recipient:</strong> ${recipientEmail || ''}</div>
                <div style="margin: 0 0 6px;"><strong>Subject:</strong> ${message.subject || ''}</div>
                <div style="margin: 0 0 6px;"><strong>Gateway Message ID:</strong> ${message.messageId || message.id}</div>
              </div>
              <p style="margin: 12px 0 0; font-size: 13px; color: #6B7280;">
                View details in Email Gateway:
                <a href="${messageLink}" style="color: #2563EB; text-decoration: none;">${messageLink}</a>
              </p>
            </div>
          `.trim()

          // Send via provider directly so these notifications are not treated as gateway messages.
          await sendEmail(config.brevoApiKey, {
            sender: { email: notifyFromEmail, name: notifyFromName || undefined },
            to: recipientList.map(email => ({ email })),
            subject,
            htmlContent: html,
            textContent: `Event: ${eventType}\nTime: ${eventLine}\nTo: ${toLine}\nRecipient: ${recipientEmail || ''}\nSubject: ${message.subject || ''}\nGateway Message ID: ${message.messageId || message.id}\nLink: ${messageLink}`,
            tags: [NOTIFICATION_TAG, `egw:event:${eventType}`],
          })
        }
      }

      ingested++
    } catch {
      // Don't fail the whole webhook batch on one bad insert.
      ignored++
    }
  }

  return { ok: true, ingested, ignored }
})
