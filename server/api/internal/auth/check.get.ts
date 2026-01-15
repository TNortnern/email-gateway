export default defineEventHandler(async (event) => {
  const adminAuth = getCookie(event, 'admin_auth')
  const config = useRuntimeConfig()

  return {
    authenticated: adminAuth === config.adminPassword
  }
})
