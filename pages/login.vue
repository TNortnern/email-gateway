<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background to-muted">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold tracking-tight mb-2">
          Email Gateway
        </h1>
        <p class="text-sm text-muted-foreground">
          Sign in to access your dashboard
        </p>
      </div>

      <Card class="p-6">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="text-sm font-medium block mb-2">Password</label>
            <Input
              v-model="password"
              type="password"
              placeholder="Enter admin password"
              :disabled="loading"
              autofocus
            />
          </div>

          <div v-if="error" class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {{ error }}
          </div>

          <Button
            type="submit"
            class="w-full"
            :disabled="!password || loading"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </Button>
        </form>
      </Card>

      <p class="text-center mt-6 text-xs text-muted-foreground">
        Secure access to manage API keys and monitor delivery
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { login } = useAuth()
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!password.value) return

  error.value = ''
  loading.value = true

  try {
    await login(password.value)
    navigateTo('/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid password'
  } finally {
    loading.value = false
  }
}
</script>
