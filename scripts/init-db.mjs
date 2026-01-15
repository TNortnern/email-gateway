#!/usr/bin/env node
/**
 * Database Initialization Script
 *
 * This script runs database migrations to set up the PostgreSQL schema.
 * It's a wrapper around the migration script for convenience.
 */

import { execSync } from 'child_process'

console.log('🔄 Initializing database with migrations...\n')

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is required')
  console.error('Set it in your .env file or environment')
  process.exit(1)
}

try {
  // Run migrations
  execSync('npm run db:migrate', { stdio: 'inherit' })

  console.log('\n✅ Database initialized successfully!')
  console.log('You can now start the development server with: npm run dev')
} catch (error) {
  console.error('\n❌ Database initialization failed')
  process.exit(1)
}
