<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <UButton
        icon="i-heroicons-arrow-left"
        color="gray"
        variant="ghost"
        to="/messages"
      >
        Back
      </UButton>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Message Details
        </h1>
      </div>
    </div>

    <div v-if="pending" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto text-gray-400" />
    </div>

    <div v-else-if="message" class="space-y-6">
      <!-- Status Card -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Status
            </h2>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(message.createdAt) }}
            </p>
          </div>
          <UBadge
            :color="getStatusColor(message.status)"
            variant="soft"
            size="lg"
          >
            {{ message.status }}
          </UBadge>
        </div>

        <div v-if="message.messageId" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="text-xs text-gray-500 dark:text-gray-400">Provider Message ID</div>
          <div class="mt-1 font-mono text-sm text-gray-900 dark:text-white">
            {{ message.messageId }}
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="text-xs text-gray-500 dark:text-gray-400">Internal Message ID</div>
          <div class="mt-1 font-mono text-sm text-gray-900 dark:text-white">
            {{ message.id }}
          </div>
        </div>

        <div v-if="message.idempotencyKey" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="text-xs text-gray-500 dark:text-gray-400">Idempotency Key</div>
          <div class="mt-1 font-mono text-sm text-gray-900 dark:text-white">
            {{ message.idempotencyKey }}
          </div>
        </div>
      </UCard>

      <!-- Email Details -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Email Details</h2>
        </template>

        <dl class="space-y-4">
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400">Subject</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ message.subject || '(No subject)' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400">From</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              <span v-if="message.from.name">{{ message.from.name }} &lt;{{ message.from.email }}&gt;</span>
              <span v-else>{{ message.from.email }}</span>
            </dd>
          </div>

          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400">To</dt>
            <dd class="mt-1 space-y-1">
              <div
                v-for="(recipient, idx) in message.to"
                :key="idx"
                class="text-sm text-gray-900 dark:text-white"
              >
                <span v-if="recipient.name">{{ recipient.name }} &lt;{{ recipient.email }}&gt;</span>
                <span v-else>{{ recipient.email }}</span>
              </div>
            </dd>
          </div>

          <div v-if="message.cc && message.cc.length">
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400">CC</dt>
            <dd class="mt-1 space-y-1">
              <div
                v-for="(recipient, idx) in message.cc"
                :key="idx"
                class="text-sm text-gray-900 dark:text-white"
              >
                <span v-if="recipient.name">{{ recipient.name }} &lt;{{ recipient.email }}&gt;</span>
                <span v-else>{{ recipient.email }}</span>
              </div>
            </dd>
          </div>

          <div v-if="message.bcc && message.bcc.length">
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400">BCC</dt>
            <dd class="mt-1 space-y-1">
              <div
                v-for="(recipient, idx) in message.bcc"
                :key="idx"
                class="text-sm text-gray-900 dark:text-white"
              >
                <span v-if="recipient.name">{{ recipient.name }} &lt;{{ recipient.email }}&gt;</span>
                <span v-else>{{ recipient.email }}</span>
              </div>
            </dd>
          </div>

          <div v-if="message.templateId">
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400">Template ID</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ message.templateId }}
            </dd>
          </div>

          <div v-if="message.tags && message.tags.length">
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400">Tags</dt>
            <dd class="mt-1 flex flex-wrap gap-1">
              <UBadge
                v-for="tag in message.tags"
                :key="tag"
                color="gray"
                variant="soft"
                size="xs"
              >
                {{ tag }}
              </UBadge>
            </dd>
          </div>
        </dl>
      </UCard>

      <!-- Provider Response -->
      <UCard v-if="message.providerResponse">
        <template #header>
          <h2 class="text-lg font-semibold">Provider Response</h2>
        </template>

        <pre class="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded p-4">{{ JSON.stringify(message.providerResponse, null, 2) }}</pre>
      </UCard>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Message not found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const id = route.params.id as string

const { data: message, pending } = await useFetch(`/api/internal/messages/${id}`)

const getStatusColor = (status: string) => {
  switch (status) {
    case 'queued':
    case 'sent':
      return 'green'
    case 'failed':
      return 'red'
    case 'pending':
      return 'yellow'
    default:
      return 'gray'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>
