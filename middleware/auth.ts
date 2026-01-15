export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth check for login page
  if (to.path === '/login') {
    return
  }

  // Check if authenticated
  const { data } = await useFetch('/api/internal/auth/check')

  if (!data.value?.authenticated) {
    return navigateTo('/login')
  }
})
