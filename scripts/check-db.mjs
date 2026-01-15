#!/usr/bin/env node
import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const connection = postgres(databaseUrl, { max: 1 })

try {
  console.log('Checking app_keys table...\n')

  const keys = await connection`
    SELECT id, name, key_prefix, default_from_email, default_from_name,
           created_at, revoked_at
    FROM app_keys
    ORDER BY created_at DESC
  `

  console.log(`Found ${keys.length} API key(s):\n`)

  keys.forEach(key => {
    console.log(`ID: ${key.id}`)
    console.log(`Name: ${key.name}`)
    console.log(`Key Prefix: ${key.key_prefix}`)
    console.log(`Default From: ${key.default_from_name} <${key.default_from_email}>`)
    console.log(`Created: ${key.created_at}`)
    console.log(`Revoked: ${key.revoked_at || 'No'}`)
    console.log('---')
  })

} catch (error) {
  console.error('Error:', error.message)
  process.exit(1)
} finally {
  await connection.end()
}
