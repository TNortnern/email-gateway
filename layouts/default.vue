<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto flex h-16 items-center px-4">
        <div class="flex items-center gap-2 font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
          <span>Email Gateway</span>
        </div>

        <nav class="flex items-center gap-1 ml-auto mr-4">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"
            :class="isActive(link.to) ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <Button variant="ghost" size="sm" @click="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" x2="9" y1="12" y2="12"></line>
          </svg>
          Logout
        </Button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <div class="container mx-auto px-4 py-8">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t">
      <div class="container mx-auto px-4 py-6">
        <p class="text-center text-sm text-muted-foreground">
          © 2026 Email Gateway • Powered by Nuxt & Brevo
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { logout } = useAuth()
const route = useRoute()

const navLinks = [
  { to: '/', label: 'API Keys' },
  { to: '/send-test', label: 'Send Test' },
  { to: '/messages', label: 'Messages' }
]

const isActive = (path: string) => {
  return route.path === path
}

const handleLogout = async () => {
  await logout()
}
</script>
