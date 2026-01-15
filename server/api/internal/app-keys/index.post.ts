import db from '~/server/utils/db'
import { generateAppKey, hashKey, getKeyPrefix, generateId } from '~/server/utils/crypto'
import { createAppKeySchema } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  // Check admin authentication
  const adminAuth = getCookie(event, 'admin_auth')
  const config = useRuntimeConfig()

  if (adminAuth !== config.adminPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Admin authentication required'
    })
  }

  // Parse and validate request body
  const body = await readBody(event)
  const parseResult = createAppKeySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      message: parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    })
  }

  const { name, defaultFromName, defaultFromEmail, tags } = parseResult.data

  // Generate the new API key
  const apiKey = generateAppKey()
  const keyHash = hashKey(apiKey)
  const keyPrefix = getKeyPrefix(apiKey)
  const id = generateId()

  // Insert the new key
  await db.insertAppKey({
    id,
    name,
    keyHash,
    keyPrefix,
    defaultFromName: defaultFromName || null,
    defaultFromEmail: defaultFromEmail || null,
    tags: tags ? JSON.stringify(tags) : null,
    revokedAt: null
  })

  setResponseStatus(event, 201)

  // Return the full key (only time it's visible)
  return {
    id,
    name,
    apiKey, // Only returned on creation!
    keyPrefix,
    defaultFromName: defaultFromName || null,
    defaultFromEmail: defaultFromEmail || null,
    tags: tags || [],
    message: 'Save this API key now. It will not be shown again.'
  }
})
