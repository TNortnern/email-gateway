export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (body.password !== config.adminPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid password'
    })
  }

  // Set auth cookie (httpOnly for security)
  setCookie(event, 'admin_auth', config.adminPassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  return {
    success: true,
    message: 'Logged in successfully'
  }
})
