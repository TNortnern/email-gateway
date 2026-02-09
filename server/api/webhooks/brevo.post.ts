import db from '~/server/utils/db'
import { generateId } from '~/server/utils/crypto'
import crypto from 'node:crypto'

const SYSTEM_TAG_APP_KEY_PREFIX = 'egw:appKey:'
const SYSTEM_TAG_MESSAGE_PREFIX = 'egw:message:'

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

function signPayload(secret: string, timestamp: string, body: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const expectedToken = (config.brevoWebhookToken || '').toString()

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

      // Optional per-app forwarding: if the app key has an event webhook configured, forward event.
      // Brevo webhooks are account-wide, so we rely on gateway tags to scope + route.
      const appKey = await db.getAppKeyById(appKeyId)
      if (appKey?.eventWebhookUrl && appKey.eventWebhookSecret) {
        const allowedEvents = appKey.eventWebhookEvents ? JSON.parse(appKey.eventWebhookEvents) as string[] : []
        const allowed = allowedEvents.length === 0 || allowedEvents.map(normalizeEventType).includes(eventType)

        // De-dupe: only forward the first open per message.
        if (allowed && (eventType !== 'opened' || !wasOpened)) {
          const forwardBodyObj = {
            appKeyId,
            message: {
              id: message.id,
              messageId: message.messageId || message.id,
              subject: message.subject,
              from: { email: message.fromEmail, name: message.fromName },
              to: JSON.parse(message.toAddresses),
              tags: message.tags ? JSON.parse(message.tags) : [],
              createdAt: message.createdAt,
            },
            event: {
              type: eventType,
              occurredAt,
              recipientEmail,
              ip,
              userAgent,
              providerMessageId,
            },
            provider: {
              name: 'brevo',
              payload,
            },
          }

          const forwardBody = JSON.stringify(forwardBodyObj)
          const timestamp = new Date().toISOString()
          const signature = signPayload(appKey.eventWebhookSecret, timestamp, forwardBody)

          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 5000)
          try {
            await fetch(appKey.eventWebhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Email-Gateway-Timestamp': timestamp,
                'X-Email-Gateway-Signature': signature,
                'X-Email-Gateway-Event': eventType,
              },
              body: forwardBody,
              signal: controller.signal,
            })
          } finally {
            clearTimeout(timeout)
          }
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
