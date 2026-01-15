export default defineEventHandler(async (event) => {
  deleteCookie(event, 'admin_auth')

  return {
    success: true,
    message: 'Logged out successfully'
  }
})
