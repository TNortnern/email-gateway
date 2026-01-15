import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Get the project root directory
const projectRoot = process.cwd()

// Ensure data directory exists
const dataDir = join(projectRoot, 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const dbPath = join(dataDir, 'gateway.json')

// Types
export interface AppKey {
  id: string
  name: string
  key_hash: string
  key_prefix: string
  default_from_name: string | null
  default_from_email: string | null
  tags: string | null
  revoked_at: string | null
  created_at: string
}

export interface Message {
  id: string
  app_key_id: string
  message_id: string | null
  to_addresses: string
  cc_addresses: string | null
  bcc_addresses: string | null
  from_email: string
  from_name: string | null
  subject: string | null
  template_id: number | null
  tags: string | null
  status: string
  provider_response: string | null
  idempotency_key: string | null
  created_at: string
}

interface Database {
  app_keys: AppKey[]
  messages: Message[]
}

// Initialize database file if it doesn't exist
if (!existsSync(dbPath)) {
  const initialData: Database = {
    app_keys: [],
    messages: []
  }
  writeFileSync(dbPath, JSON.stringify(initialData, null, 2))
}

// Load database
function loadDb(): Database {
  try {
    const data = readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return { app_keys: [], messages: [] }
  }
}

// Save database
function saveDb(data: Database) {
  writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

// Database operations
export const db = {
  // App keys operations
  insertAppKey(key: Omit<AppKey, 'created_at'>) {
    const data = loadDb()
    const newKey: AppKey = {
      ...key,
      created_at: new Date().toISOString()
    }
    data.app_keys.push(newKey)
    saveDb(data)
    return newKey
  },

  getAppKeyByHash(keyHash: string): AppKey | undefined {
    const data = loadDb()
    return data.app_keys.find(k => k.key_hash === keyHash && !k.revoked_at)
  },

  getAppKeyById(id: string): AppKey | undefined {
    const data = loadDb()
    return data.app_keys.find(k => k.id === id)
  },

  getAllAppKeys(): AppKey[] {
    const data = loadDb()
    return data.app_keys.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  },

  revokeAppKey(id: string): boolean {
    const data = loadDb()
    const key = data.app_keys.find(k => k.id === id && !k.revoked_at)
    if (key) {
      key.revoked_at = new Date().toISOString()
      saveDb(data)
      return true
    }
    return false
  },

  // Message operations
  insertMessage(message: Omit<Message, 'created_at'>) {
    const data = loadDb()
    const newMessage: Message = {
      ...message,
      created_at: new Date().toISOString()
    }
    data.messages.push(newMessage)
    saveDb(data)
    return newMessage
  },

  getMessageByIdempotencyKey(appKeyId: string, idempotencyKey: string): Message | undefined {
    const data = loadDb()
    return data.messages.find(m =>
      m.app_key_id === appKeyId && m.idempotency_key === idempotencyKey
    )
  },

  getMessageById(id: string): Message | undefined {
    const data = loadDb()
    return data.messages.find(m => m.id === id || m.message_id === id)
  },

  getMessagesByAppKey(appKeyId: string, limit: number = 50, cursor?: string): { messages: Message[], hasMore: boolean } {
    const data = loadDb()
    let messages = data.messages
      .filter(m => m.app_key_id === appKeyId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    if (cursor) {
      messages = messages.filter(m => new Date(m.created_at) < new Date(cursor))
    }

    const hasMore = messages.length > limit
    return {
      messages: messages.slice(0, limit),
      hasMore
    }
  },

  getAllMessages(limit: number = 50, cursor?: string): { messages: Message[], hasMore: boolean } {
    const data = loadDb()
    let messages = data.messages
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    if (cursor) {
      messages = messages.filter(m => new Date(m.created_at) < new Date(cursor))
    }

    const hasMore = messages.length > limit
    return {
      messages: messages.slice(0, limit),
      hasMore
    }
  },

  updateMessage(id: string, updates: Partial<Message>): boolean {
    const data = loadDb()
    const message = data.messages.find(m => m.id === id)
    if (message) {
      Object.assign(message, updates)
      saveDb(data)
      return true
    }
    return false
  }
}

export default db
