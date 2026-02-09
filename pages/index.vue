<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">API Keys</h2>
        <p class="text-muted-foreground">
          Manage application API keys for secure email gateway access
        </p>
      </div>
      <Button @click="showCreateModal = true">
        Create API Key
      </Button>
    </div>

    <!-- Loading State -->
    <Card v-if="pending" class="p-12">
      <div class="flex flex-col items-center justify-center">
        <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p class="mt-4 text-sm text-muted-foreground">Loading API keys...</p>
      </div>
    </Card>

    <!-- API Keys List -->
    <div v-else-if="keys && keys.length > 0" class="space-y-4">
      <Card
        v-for="key in keys"
        :key="key.id"
        class="p-6"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
                  <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"></path>
                  <path d="m21 2-9.6 9.6"></path>
                  <circle cx="7.5" cy="15.5" r="5.5"></circle>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold">
                  {{ key.name }}
                </h3>
                <code class="text-xs text-muted-foreground font-mono">
                  {{ key.keyPrefix }}
                </code>
              </div>
              <span v-if="key.isRevoked" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-destructive/10 text-destructive">
                Revoked
              </span>
            </div>

            <div v-if="key.defaultFromEmail" class="text-sm text-muted-foreground mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              {{ key.defaultFromEmail }}
            </div>

            <div class="text-sm text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1">
                <path d="M8 2v4"></path>
                <path d="M16 2v4"></path>
                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                <path d="M3 10h18"></path>
              </svg>
              Created {{ formatDate(key.createdAt) }}
            </div>

            <div v-if="key.tags && key.tags.length" class="flex flex-wrap gap-2 mt-3">
              <span
                v-for="tag in key.tags"
                :key="tag"
                class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div v-if="!key.isRevoked" class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="openEditModal(key)"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              @click="revokeKey(key)"
            >
              Revoke
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else class="p-12">
      <div class="text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
            <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"></path>
            <path d="m21 2-9.6 9.6"></path>
            <circle cx="7.5" cy="15.5" r="5.5"></circle>
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">No API Keys Yet</h3>
        <p class="text-sm text-muted-foreground mb-6">
          Create your first API key to start sending emails through the gateway
        </p>
        <Button @click="showCreateModal = true">
          Create Your First Key
        </Button>
      </div>
    </Card>

    <!-- Create Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      @click="closeCreateModal"
    >
      <div class="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]" @click.stop>
        <Card class="p-6">
          <div class="mb-4">
            <h3 class="text-xl font-bold">Create New API Key</h3>
          </div>

          <div v-if="!newKeyData" class="space-y-4">
            <div>
              <label class="text-sm font-medium block mb-2">Key Name *</label>
              <Input
                v-model="createForm.name"
                placeholder="e.g., production-api"
              />
            </div>

            <div>
              <label class="text-sm font-medium block mb-2">Default From Email</label>
              <Input
                v-model="createForm.defaultFromEmail"
                type="email"
                placeholder="Optional"
              />
            </div>

            <div>
              <label class="text-sm font-medium block mb-2">Default From Name</label>
              <Input
                v-model="createForm.defaultFromName"
                placeholder="Optional"
              />
            </div>

            <div>
              <label class="text-sm font-medium block mb-2">Tags</label>
              <Input
                v-model="tagsInput"
                placeholder="e.g., production, billing"
              />
            </div>

            <div class="pt-2 border-t border-border/60">
              <p class="text-sm font-semibold mb-3">Event Webhook (Optional)</p>

              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium block mb-2">Webhook URL</label>
                  <Input
                    v-model="createForm.eventWebhookUrl"
                    placeholder="https://yourapp.com/webhooks/email-gateway"
                  />
                  <p class="mt-1 text-xs text-muted-foreground">
                    If set, email open/click/delivery events will be forwarded to this URL for this API key.
                  </p>
                </div>

                <div>
                  <label class="text-sm font-medium block mb-2">Webhook Secret</label>
                  <Input
                    v-model="createForm.eventWebhookSecret"
                    type="password"
                    placeholder="Used to sign webhook requests"
                  />
                </div>

                <div>
                  <label class="text-sm font-medium block mb-2">Events</label>
                  <Input
                    v-model="createForm.eventWebhookEvents"
                    placeholder="opened, clicked, delivered"
                  />
                  <p class="mt-1 text-xs text-muted-foreground">
                    Comma-separated. Leave blank to forward all events.
                  </p>
                </div>
              </div>
            </div>

            <div v-if="createError" class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {{ createError }}
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="text-center mb-4">
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold">API Key Created!</h3>
            </div>

            <div class="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <strong>Save this key now!</strong> For security reasons, you won't be able to view this key again.
            </div>

            <div>
              <label class="text-sm font-medium block mb-2">Your API Key</label>
              <div class="relative">
                <Input
                  :model-value="newKeyData.apiKey"
                  readonly
                  class="font-mono pr-10"
                />
                <button
                  @click="copyToClipboard(newKeyData.apiKey)"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <Button v-if="!newKeyData" variant="outline" @click="closeCreateModal">
              Cancel
            </Button>
            <Button
              v-if="!newKeyData"
              :disabled="!createForm.name || creating"
              @click="createKey"
            >
              {{ creating ? 'Creating...' : 'Create' }}
            </Button>
            <Button v-else @click="closeCreateModal">
              Done
            </Button>
          </div>
        </Card>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      @click="closeEditModal"
    >
      <div class="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]" @click.stop>
        <Card class="p-6">
          <div class="mb-4">
            <h3 class="text-xl font-bold">Edit API Key</h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium block mb-2">Key Name *</label>
              <Input
                v-model="editForm.name"
                placeholder="e.g., production-api"
              />
            </div>

            <div>
              <label class="text-sm font-medium block mb-2">Default From Email</label>
              <Input
                v-model="editForm.defaultFromEmail"
                type="email"
                placeholder="Optional"
              />
            </div>

            <div>
              <label class="text-sm font-medium block mb-2">Default From Name</label>
              <Input
                v-model="editForm.defaultFromName"
                placeholder="Optional"
              />
            </div>

            <div class="pt-2 border-t border-border/60">
              <p class="text-sm font-semibold mb-3">Event Webhook (Optional)</p>

              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium block mb-2">Webhook URL</label>
                  <Input
                    v-model="editForm.eventWebhookUrl"
                    placeholder="https://yourapp.com/webhooks/email-gateway"
                  />
                  <p class="mt-1 text-xs text-muted-foreground">
                    If set, events will be forwarded for this API key only.
                  </p>
                </div>

                <div>
                  <label class="text-sm font-medium block mb-2">Webhook Secret</label>
                  <Input
                    v-model="editForm.eventWebhookSecret"
                    type="password"
                    placeholder="Set a new secret to rotate (leave blank to keep current)"
                  />
                  <div class="mt-2 flex items-center gap-2">
                    <input id="clearSecret" type="checkbox" v-model="clearEventWebhookSecret" class="h-4 w-4" />
                    <label for="clearSecret" class="text-xs text-muted-foreground">
                      Clear secret (disables forwarding until set again)
                    </label>
                  </div>
                </div>

                <div>
                  <label class="text-sm font-medium block mb-2">Events</label>
                  <Input
                    v-model="editForm.eventWebhookEvents"
                    placeholder="opened, clicked, delivered"
                  />
                  <p class="mt-1 text-xs text-muted-foreground">
                    Comma-separated. Leave blank to forward all events.
                  </p>
                </div>
              </div>
            </div>

            <div v-if="editError" class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {{ editError }}
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <Button variant="outline" @click="closeEditModal">
              Cancel
            </Button>
            <Button
              :disabled="!editForm.name || editing"
              @click="saveEdit"
            >
              {{ editing ? 'Saving...' : 'Save Changes' }}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')
const newKeyData = ref<any>(null)
const tagsInput = ref('')

const showEditModal = ref(false)
const editing = ref(false)
const editError = ref('')
const editingKey = ref<any>(null)

const createForm = ref({
  name: '',
  defaultFromEmail: '',
  defaultFromName: '',
  eventWebhookUrl: '',
  eventWebhookSecret: '',
  eventWebhookEvents: ''
})

const editForm = ref({
  name: '',
  defaultFromEmail: '',
  defaultFromName: '',
  eventWebhookUrl: '',
  eventWebhookSecret: '',
  eventWebhookEvents: ''
})

const clearEventWebhookSecret = ref(false)

const { data: keysData, pending, refresh } = useFetch('/api/internal/app-keys')

const keys = computed(() => keysData.value?.keys || [])

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const createKey = async () => {
  creating.value = true
  createError.value = ''

  try {
    const tags = tagsInput.value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const { data, error } = await useFetch('/api/internal/app-keys', {
      method: 'POST',
      body: {
        name: createForm.value.name,
        defaultFromEmail: createForm.value.defaultFromEmail || undefined,
        defaultFromName: createForm.value.defaultFromName || undefined,
        tags: tags.length > 0 ? tags : undefined,
        eventWebhookUrl: createForm.value.eventWebhookUrl || undefined,
        eventWebhookSecret: createForm.value.eventWebhookSecret || undefined,
        eventWebhookEvents: createForm.value.eventWebhookEvents
          ? createForm.value.eventWebhookEvents.split(',').map(t => t.trim()).filter(Boolean)
          : undefined
      }
    })

    if (error.value) {
      throw new Error(error.value.message || 'Failed to create key')
    }

    newKeyData.value = data.value
    await refresh()
  } catch (e) {
    createError.value = e instanceof Error ? e.message : 'Failed to create key'
  } finally {
    creating.value = false
  }
}

const revokeKey = async (key: any) => {
  if (!confirm(`Are you sure you want to revoke "${key.name}"?`)) {
    return
  }

  try {
    await $fetch(`/api/internal/app-keys/${key.id}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (e) {
    alert('Failed to revoke key')
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  createForm.value = {
    name: '',
    defaultFromEmail: '',
    defaultFromName: '',
    eventWebhookUrl: '',
    eventWebhookSecret: '',
    eventWebhookEvents: ''
  }
  tagsInput.value = ''
  createError.value = ''
  newKeyData.value = null
}

const openEditModal = (key: any) => {
  editingKey.value = key
  editForm.value = {
    name: key.name,
    defaultFromEmail: key.defaultFromEmail || '',
    defaultFromName: key.defaultFromName || '',
    eventWebhookUrl: key.eventWebhookUrl || '',
    eventWebhookSecret: '',
    eventWebhookEvents: (key.eventWebhookEvents || []).join(', ')
  }
  editError.value = ''
  clearEventWebhookSecret.value = false
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingKey.value = null
  editForm.value = {
    name: '',
    defaultFromEmail: '',
    defaultFromName: '',
    eventWebhookUrl: '',
    eventWebhookSecret: '',
    eventWebhookEvents: ''
  }
  editError.value = ''
  clearEventWebhookSecret.value = false
}

const saveEdit = async () => {
  if (!editingKey.value) return

  editing.value = true
  editError.value = ''

  try {
    const body: any = {
      name: editForm.value.name,
      defaultFromEmail: editForm.value.defaultFromEmail || null,
      defaultFromName: editForm.value.defaultFromName || null,
      eventWebhookUrl: editForm.value.eventWebhookUrl || null,
      eventWebhookEvents: editForm.value.eventWebhookEvents
        ? editForm.value.eventWebhookEvents.split(',').map(t => t.trim()).filter(Boolean)
        : null
    }

    if (clearEventWebhookSecret.value) {
      body.eventWebhookSecret = null
    } else if (editForm.value.eventWebhookSecret.trim().length > 0) {
      body.eventWebhookSecret = editForm.value.eventWebhookSecret.trim()
    }

    const { data, error } = await useFetch(`/api/internal/app-keys/${editingKey.value.id}`, {
      method: 'PATCH',
      body
    })

    if (error.value) {
      throw new Error(error.value.message || 'Failed to update key')
    }

    await refresh()
    closeEditModal()
  } catch (e) {
    editError.value = e instanceof Error ? e.message : 'Failed to update key'
  } finally {
    editing.value = false
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (e) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}
</script>
