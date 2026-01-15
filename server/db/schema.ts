import { pgTable, text, integer, timestamp, unique, index } from 'drizzle-orm/pg-core'

// App API Keys table
export const appKeys = pgTable('app_keys', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  keyPrefix: text('key_prefix').notNull(),
  defaultFromName: text('default_from_name'),
  defaultFromEmail: text('default_from_email'),
  tags: text('tags'), // JSON string
  revokedAt: timestamp('revoked_at', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
}, (table) => ({
  keyHashIdx: index('idx_app_keys_key_hash').on(table.keyHash),
}))

// Messages log table
export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  appKeyId: text('app_key_id').notNull().references(() => appKeys.id),
  messageId: text('message_id'),
  toAddresses: text('to_addresses').notNull(), // JSON string
  ccAddresses: text('cc_addresses'), // JSON string
  bccAddresses: text('bcc_addresses'), // JSON string
  fromEmail: text('from_email').notNull(),
  fromName: text('from_name'),
  subject: text('subject'),
  templateId: integer('template_id'),
  tags: text('tags'), // JSON string
  status: text('status').notNull().default('queued'),
  providerResponse: text('provider_response'), // JSON string
  idempotencyKey: text('idempotency_key'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
}, (table) => ({
  appKeyIdIdx: index('idx_messages_app_key_id').on(table.appKeyId),
  createdAtIdx: index('idx_messages_created_at').on(table.createdAt),
  idempotencyIdx: index('idx_messages_idempotency').on(table.appKeyId, table.idempotencyKey),
  // Unique constraint on app_key_id + idempotency_key
  uniqueIdempotency: unique('unique_app_key_idempotency').on(table.appKeyId, table.idempotencyKey),
}))

// TypeScript types inferred from schema
export type AppKey = typeof appKeys.$inferSelect
export type InsertAppKey = typeof appKeys.$inferInsert
export type Message = typeof messages.$inferSelect
export type InsertMessage = typeof messages.$inferInsert
