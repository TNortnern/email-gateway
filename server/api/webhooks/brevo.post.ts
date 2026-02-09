import db from '~/server/utils/db'
import { generateId } from '~/server/utils/crypto'

const SYSTEM_TAG_APP_KEY_PREFIX = 'egw:appKey:'
const SYSTEM_TAG_MESSAGE_PREFIX = 'egw:message:'

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

    const eventType =
      pickFirstString(payload, ['event', 'type', 'eventType']) ||
      'unknown'

    const occurredAt =
      toIsoMaybe(payload.date ?? payload.timestamp ?? payload.event_date ?? payload.occurredAt) ||
      null

    const recipientEmail =
      pickFirstString(payload, ['email', 'recipient', 'to']) ||
      null

    const ip = pickFirstString(payload, ['ip', 'ipAddress']) || null
    const userAgent = pickFirstString(payload, ['userAgent', 'user-agent']) || null

    try {
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
      if (eventType.toLowerCase() === 'opened') {
        await db.updateMessage(messageRecordId, { status: 'opened' })
      }

      ingested++
    } catch {
      // Don't fail the whole webhook batch on one bad insert.
      ignored++
    }
  }

  return { ok: true, ingested, ignored }
})

