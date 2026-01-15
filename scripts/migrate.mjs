#!/usr/bin/env node
/**
 * Strict Database Migration Script
 *
 * This script follows Django-like migration principles:
 * - Runs migrations in a transaction
 * - Validates before applying
 * - Fails deployment if migrations fail
 * - Ensures data safety (no data deletion)
 * - Logs all operations for audit trail
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logError(message) {
  log(`❌ ERROR: ${message}`, colors.red)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

async function runMigrations() {
  const startTime = Date.now()

  // Validate environment
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    logError('DATABASE_URL environment variable is required')
    process.exit(1)
  }

  logInfo('Starting migration process...')
  logInfo(`Database: ${databaseUrl.replace(/:[^:@]+@/, ':***@')}`) // Hide password in logs

  let connection
  let migrationClient

  try {
    // Create connection with max: 1 for migrations (required by Drizzle)
    connection = postgres(databaseUrl, {
      max: 1,
      onnotice: () => {}, // Suppress notices during migration
    })

    // Create Drizzle instance
    const db = drizzle(connection)

    // Validate migration files exist
    const migrationsPath = join(projectRoot, 'drizzle', 'migrations')
    if (!existsSync(migrationsPath)) {
      logError(`Migration directory not found: ${migrationsPath}`)
      logInfo('Run "npm run db:generate" to create migrations first')
      process.exit(1)
    }

    // Check for pending migrations by reading the meta file
    const metaPath = join(migrationsPath, 'meta', '_journal.json')
    if (!existsSync(metaPath)) {
      logError('Migration metadata not found. Run "npm run db:generate" first.')
      process.exit(1)
    }

    const metaContent = JSON.parse(readFileSync(metaPath, 'utf-8'))
    const totalMigrations = metaContent.entries?.length || 0

    if (totalMigrations === 0) {
      logWarning('No migrations found')
      process.exit(0)
    }

    logInfo(`Found ${totalMigrations} migration(s) in schema`)

    // Get current migration state from database
    try {
      const result = await connection`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'drizzle'
          AND table_name = '__drizzle_migrations'
        ) as exists
      `

      if (result[0]?.exists) {
        const appliedMigrations = await connection`
          SELECT * FROM drizzle.__drizzle_migrations
          ORDER BY created_at
        `
        logInfo(`${appliedMigrations.length} migration(s) already applied`)

        if (appliedMigrations.length >= totalMigrations) {
          logSuccess('Database is up to date. No migrations to apply.')
          process.exit(0)
        }
      }
    } catch (error) {
      logInfo('Migrations table not found (this is normal for first run)')
    }

    // Validate dangerous operations
    logInfo('Validating migrations for data safety...')
    const dangerousPatterns = [
      { pattern: /DROP\s+TABLE/i, message: 'DROP TABLE detected - data loss risk' },
      { pattern: /DROP\s+COLUMN/i, message: 'DROP COLUMN detected - data loss risk' },
      { pattern: /TRUNCATE/i, message: 'TRUNCATE detected - data loss risk' },
      { pattern: /DELETE\s+FROM/i, message: 'DELETE FROM detected - data loss risk' },
    ]

    // Read all migration SQL files
    for (const entry of metaContent.entries) {
      const migrationFile = join(migrationsPath, `${entry.tag}.sql`)
      if (existsSync(migrationFile)) {
        const sql = readFileSync(migrationFile, 'utf-8')

        for (const { pattern, message } of dangerousPatterns) {
          if (pattern.test(sql)) {
            logError(`Dangerous operation in ${entry.tag}: ${message}`)
            logError('Migration rejected. Please review and modify the migration.')
            logInfo('To bypass this check, manually review the SQL and apply it.')
            process.exit(1)
          }
        }
      }
    }

    logSuccess('Migration validation passed - no dangerous operations detected')

    // Run migrations
    logInfo('Applying migrations...')

    await migrate(db, {
      migrationsFolder: migrationsPath,
    })

    logSuccess('Migrations applied successfully!')

    // Verify final state
    const finalMigrations = await connection`
      SELECT * FROM drizzle.__drizzle_migrations
      ORDER BY created_at
    `

    logSuccess(`Database now has ${finalMigrations.length} migration(s) applied`)

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    logSuccess(`Migration completed in ${duration}s`)

  } catch (error) {
    logError('Migration failed!')
    logError(error.message)

    if (error.stack) {
      log('\nStack trace:', colors.red)
      console.error(error.stack)
    }

    logInfo('\nTroubleshooting:')
    logInfo('1. Verify DATABASE_URL is correct')
    logInfo('2. Check database connection and permissions')
    logInfo('3. Review migration files in drizzle/migrations/')
    logInfo('4. Ensure no conflicting schema changes')

    process.exit(1)
  } finally {
    // Always close the connection
    if (connection) {
      await connection.end()
    }
  }
}

// Run migrations
runMigrations()
