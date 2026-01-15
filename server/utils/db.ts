import { eq, and, desc, lt, sql } from 'drizzle-orm'
import { db } from '../db'
import { appKeys, messages, type AppKey, type Message, type InsertAppKey, type InsertMessage } from '../db/schema'

// Re-export types for compatibility
export type { AppKey, Message }

// Database operations
export const dbOps = {
  // App keys operations
  async insertAppKey(key: Omit<InsertAppKey, 'createdAt'>) {
    const [newKey] = await db
      .insert(appKeys)
      .values({
        ...key,
        createdAt: new Date().toISOString(),
      })
      .returning()

    return newKey
  },

  async getAppKeyByHash(keyHash: string): Promise<AppKey | undefined> {
    const [key] = await db
      .select()
      .from(appKeys)
      .where(and(eq(appKeys.keyHash, keyHash), sql`${appKeys.revokedAt} IS NULL`))
      .limit(1)

    return key
  },

  async getAppKeyById(id: string): Promise<AppKey | undefined> {
    const [key] = await db
      .select()
      .from(appKeys)
      .where(eq(appKeys.id, id))
      .limit(1)

    return key
  },

  async getAllAppKeys(): Promise<AppKey[]> {
    const keys = await db
      .select()
      .from(appKeys)
      .orderBy(desc(appKeys.createdAt))

    return keys
  },

  async revokeAppKey(id: string): Promise<boolean> {
    const result = await db
      .update(appKeys)
      .set({ revokedAt: new Date().toISOString() })
      .where(and(eq(appKeys.id, id), sql`${appKeys.revokedAt} IS NULL`))
      .returning()

    return result.length > 0
  },

  // Message operations
  async insertMessage(message: Omit<InsertMessage, 'createdAt'>) {
    const [newMessage] = await db
      .insert(messages)
      .values({
        ...message,
        createdAt: new Date().toISOString(),
      })
      .returning()

    return newMessage
  },

  async getMessageByIdempotencyKey(appKeyId: string, idempotencyKey: string): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.appKeyId, appKeyId),
          eq(messages.idempotencyKey, idempotencyKey)
        )
      )
      .limit(1)

    return message
  },

  async getMessageById(id: string): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(sql`${messages.id} = ${id} OR ${messages.messageId} = ${id}`)
      .limit(1)

    return message
  },

  async getMessagesByAppKey(
    appKeyId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<{ messages: Message[]; hasMore: boolean }> {
    const query = db
      .select()
      .from(messages)
      .where(
        cursor
          ? and(
              eq(messages.appKeyId, appKeyId),
              lt(messages.createdAt, cursor)
            )
          : eq(messages.appKeyId, appKeyId)
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit + 1) // Fetch one extra to check if there are more

    const results = await query

    const hasMore = results.length > limit
    const messagesList = hasMore ? results.slice(0, limit) : results

    return {
      messages: messagesList,
      hasMore,
    }
  },

  async getAllMessages(
    limit: number = 50,
    cursor?: string
  ): Promise<{ messages: Message[]; hasMore: boolean }> {
    const query = db
      .select()
      .from(messages)
      .where(cursor ? lt(messages.createdAt, cursor) : undefined)
      .orderBy(desc(messages.createdAt))
      .limit(limit + 1) // Fetch one extra to check if there are more

    const results = await query

    const hasMore = results.length > limit
    const messagesList = hasMore ? results.slice(0, limit) : results

    return {
      messages: messagesList,
      hasMore,
    }
  },

  async updateMessage(id: string, updates: Partial<Message>): Promise<boolean> {
    const result = await db
      .update(messages)
      .set(updates)
      .where(eq(messages.id, id))
      .returning()

    return result.length > 0
  },
}

// Default export for backwards compatibility
export default dbOps
