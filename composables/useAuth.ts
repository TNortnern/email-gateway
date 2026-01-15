export const useAuth = () => {
  const isAuthenticated = useState('isAuthenticated', () => false)

  const checkAuth = async () => {
    const { data } = await useFetch('/api/internal/auth/check')
    isAuthenticated.value = data.value?.authenticated ?? false
    return isAuthenticated.value
  }

  const login = async (password: string) => {
    const { data, error } = await useFetch('/api/internal/auth/login', {
      method: 'POST',
      body: { password }
    })

    if (error.value) {
      throw new Error(error.value.message || 'Login failed')
    }

    isAuthenticated.value = true
    return data.value
  }

  const logout = async () => {
    await useFetch('/api/internal/auth/logout', {
      method: 'POST'
    })
    isAuthenticated.value = false
    navigateTo('/login')
  }

  return {
    isAuthenticated,
    checkAuth,
    login,
    logout
  }
}
