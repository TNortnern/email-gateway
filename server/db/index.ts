import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create postgres connection
// For migrations, we need max: 1
// For queries, we can use the default connection pool
export const connection = postgres(databaseUrl, {
  max: process.env.DB_MIGRATING ? 1 : 10,
})

// Create Drizzle instance
export const db = drizzle(connection, { schema })

// Export schema for use in queries
export * from './schema'
