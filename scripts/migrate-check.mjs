#!/usr/bin/env node
/**
 * Migration Check Script for CI/CD
 *
 * This script validates migrations without applying them:
 * - Checks for pending migrations
 * - Validates SQL for dangerous operations
 * - Reports migration status
 * - Exits with code 0 if safe, 1 if issues found
 */

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
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

async function checkMigrations() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    log('❌ DATABASE_URL environment variable is required', colors.red)
    process.exit(1)
  }

  log('ℹ️  Checking migration status...', colors.blue)

  let connection

  try {
    connection = postgres(databaseUrl, { max: 1 })

    // Read migration metadata
    const migrationsPath = join(projectRoot, 'drizzle', 'migrations')
    const metaPath = join(migrationsPath, 'meta', '_journal.json')

    if (!existsSync(metaPath)) {
      log('❌ Migration metadata not found', colors.red)
      process.exit(1)
    }

    const metaContent = JSON.parse(readFileSync(metaPath, 'utf-8'))
    const totalMigrations = metaContent.entries?.length || 0

    log(`📦 Schema has ${totalMigrations} migration(s)`, colors.blue)

    // Check applied migrations
    let appliedCount = 0
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
        appliedCount = appliedMigrations.length
      }
    } catch (error) {
      log('ℹ️  No migrations applied yet (fresh database)', colors.blue)
    }

    log(`✅ Database has ${appliedCount} migration(s) applied`, colors.green)

    const pendingCount = totalMigrations - appliedCount

    if (pendingCount > 0) {
      log(`⚠️  ${pendingCount} pending migration(s) need to be applied`, colors.yellow)

      // Validate pending migrations
      log('ℹ️  Validating pending migrations...', colors.blue)

      const dangerousPatterns = [
        { pattern: /DROP\s+TABLE/i, message: 'DROP TABLE' },
        { pattern: /DROP\s+COLUMN/i, message: 'DROP COLUMN' },
        { pattern: /TRUNCATE/i, message: 'TRUNCATE' },
        { pattern: /DELETE\s+FROM/i, message: 'DELETE FROM' },
      ]

      let hasIssues = false

      for (let i = appliedCount; i < totalMigrations; i++) {
        const entry = metaContent.entries[i]
        const migrationFile = join(migrationsPath, `${entry.tag}.sql`)

        if (existsSync(migrationFile)) {
          const sql = readFileSync(migrationFile, 'utf-8')

          for (const { pattern, message } of dangerousPatterns) {
            if (pattern.test(sql)) {
              log(`❌ Dangerous operation in ${entry.tag}: ${message}`, colors.red)
              hasIssues = true
            }
          }
        }
      }

      if (hasIssues) {
        log('\n❌ Migration check FAILED - dangerous operations detected', colors.red)
        log('Review and fix migrations before deployment', colors.yellow)
        process.exit(1)
      }

      log('✅ All pending migrations are safe', colors.green)
      log('\n⚠️  Run "npm run db:migrate" to apply pending migrations', colors.yellow)
      process.exit(0)
    } else {
      log('✅ Database is up to date - no pending migrations', colors.green)
      process.exit(0)
    }

  } catch (error) {
    log(`❌ Check failed: ${error.message}`, colors.red)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

checkMigrations()
