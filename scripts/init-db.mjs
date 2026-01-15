import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// Get the project root directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Ensure data directory exists
const dataDir = join(projectRoot, 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
  console.log('✓ Created data directory')
}

const dbPath = join(dataDir, 'gateway.db')

// Check if database already exists
const dbExists = existsSync(dbPath)

const db = new Database(dbPath)

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')

// Initialize tables
db.exec(`
  -- App API Keys table
  CREATE TABLE IF NOT EXISTS app_keys (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    default_from_name TEXT,
    default_from_email TEXT,
    tags TEXT,
    revoked_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Messages log table
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    app_key_id TEXT NOT NULL,
    message_id TEXT,
    to_addresses TEXT NOT NULL,
    cc_addresses TEXT,
    bcc_addresses TEXT,
    from_email TEXT NOT NULL,
    from_name TEXT,
    subject TEXT,
    template_id INTEGER,
    tags TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    provider_response TEXT,
    idempotency_key TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (app_key_id) REFERENCES app_keys(id),
    UNIQUE(app_key_id, idempotency_key)
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_messages_app_key_id ON messages(app_key_id);
  CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
  CREATE INDEX IF NOT EXISTS idx_messages_idempotency ON messages(app_key_id, idempotency_key);
  CREATE INDEX IF NOT EXISTS idx_app_keys_key_hash ON app_keys(key_hash);
`)

if (dbExists) {
  console.log('✓ Database already exists, schema updated')
} else {
  console.log('✓ Database initialized successfully')
}

console.log(`\nDatabase location: ${dbPath}`)
console.log('\nYou can now start the development server with: npm run dev')

db.close()
