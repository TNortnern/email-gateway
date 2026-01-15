import { createHash, randomBytes } from 'crypto'
import { nanoid } from 'nanoid'

/**
 * Generate a new app API key
 * Format: egw_live_<random>
 */
export function generateAppKey(): string {
  const random = nanoid(32)
  return `egw_live_${random}`
}

/**
 * Hash an API key for storage
 */
export function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/**
 * Get the prefix of an API key (for display purposes)
 */
export function getKeyPrefix(key: string): string {
  return key.substring(0, 16) + '...'
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${nanoid(24)}`
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return nanoid(21)
}
