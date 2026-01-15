<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h2 class="text-3xl font-bold tracking-tight">Messages</h2>
      <p class="text-muted-foreground">
        View all sent email messages
      </p>
    </div>

    <Card class="p-6">
      <!-- Loading State -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p class="mt-4 text-sm text-muted-foreground">Loading messages...</p>
      </div>

      <!-- Messages List -->
      <div v-else-if="messages && messages.length > 0" class="space-y-3">
        <NuxtLink
          v-for="message in messages"
          :key="message.id"
          :to="`/messages/${message.id}`"
          class="block border rounded-lg p-4 hover:bg-accent transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-sm font-semibold truncate">
                  {{ message.subject || '(No subject)' }}
                </h3>
                <Badge :variant="getStatusVariant(message.status)">
                  {{ message.status }}
                </Badge>
              </div>

              <div class="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  To: {{ formatRecipients(message.to) }}
                </span>
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  From: {{ message.from.email }}
                </span>
              </div>

              <div v-if="message.tags && message.tags.length" class="flex flex-wrap gap-1 mb-2">
                <Badge
                  v-for="tag in message.tags"
                  :key="tag"
                  variant="secondary"
                  class="text-xs"
                >
                  {{ tag }}
                </Badge>
              </div>

              <div class="flex items-center gap-1 text-xs text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
                {{ formatDate(message.createdAt) }}
              </div>
            </div>

            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground flex-shrink-0">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </div>
        </NuxtLink>

        <!-- Load More Button -->
        <div v-if="data?.cursor" class="flex justify-center pt-4">
          <Button
            variant="outline"
            @click="loadMore"
            :disabled="loadingMore"
          >
            {{ loadingMore ? 'Loading...' : 'Load More' }}
          </Button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-12">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">No Messages Yet</h3>
        <p class="text-sm text-muted-foreground">
          Sent messages will appear here
        </p>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

// We need to fetch messages using an internal endpoint since the regular endpoint requires API key
const { data, pending, refresh } = await useFetch('/api/internal/messages')
const loadingMore = ref(false)

const messages = computed(() => data.value?.messages || [])

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'queued':
    case 'sent':
      return 'success'
    case 'failed':
      return 'destructive'
    case 'pending':
      return 'warning'
    default:
      return 'secondary'
  }
}

const formatRecipients = (recipients: any[]) => {
  if (!recipients || recipients.length === 0) return ''
  if (recipients.length === 1) return recipients[0].email
  return `${recipients[0].email} +${recipients.length - 1} more`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadMore = async () => {
  if (!data.value?.cursor) return

  loadingMore.value = true
  try {
    const { data: moreData } = await useFetch('/api/internal/messages', {
      query: { cursor: data.value.cursor }
    })

    if (moreData.value?.messages) {
      data.value.messages.push(...moreData.value.messages)
      data.value.cursor = moreData.value.cursor
    }
  } finally {
    loadingMore.value = false
  }
}
</script>
