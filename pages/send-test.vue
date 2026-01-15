<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h2 class="text-3xl font-bold tracking-tight">Send Test Email</h2>
      <p class="text-muted-foreground">
        Test the email gateway by sending a test email
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Form -->
      <Card class="p-6">
        <form @submit.prevent="sendEmail" class="space-y-5">
          <div>
            <label class="text-sm font-medium block mb-2">
              API Key <span class="text-destructive">*</span>
            </label>
            <Select
              v-model="form.apiKey"
              :options="keyOptions"
              placeholder="Select an API key"
              :disabled="keysLoading"
            />
          </div>

          <div>
            <label class="text-sm font-medium block mb-2">
              To Email <span class="text-destructive">*</span>
            </label>
            <Input
              v-model="form.to"
              type="email"
              placeholder="recipient@example.com"
            />
          </div>

          <div>
            <label class="text-sm font-medium block mb-2">To Name</label>
            <Input
              v-model="form.toName"
              placeholder="Recipient Name (optional)"
            />
          </div>

          <div>
            <label class="text-sm font-medium block mb-2">
              Subject <span class="text-destructive">*</span>
            </label>
            <Input
              v-model="form.subject"
              placeholder="Test Email Subject"
            />
          </div>

          <div>
            <label class="text-sm font-medium block mb-2">HTML Content</label>
            <Textarea
              v-model="form.html"
              :rows="8"
              placeholder="<h1>Hello!</h1><p>This is a test email.</p>"
            />
          </div>

          <div>
            <label class="text-sm font-medium block mb-2">Text Content</label>
            <Textarea
              v-model="form.text"
              :rows="4"
              placeholder="Plain text version (optional)"
            />
          </div>

          <div>
            <label class="text-sm font-medium block mb-2">Email Template</label>
            <Select
              v-model="form.template"
              :options="templateOptions"
              placeholder="None (plain HTML)"
            />
            <p class="text-xs text-muted-foreground mt-1.5">
              Wrap your HTML in a responsive email template
            </p>
          </div>

          <div v-if="form.template">
            <label class="text-sm font-medium block mb-2">Company Name</label>
            <Input
              v-model="form.companyName"
              placeholder="Your Company Name"
            />
          </div>

          <div v-if="form.template">
            <label class="text-sm font-medium block mb-2">Brand Color</label>
            <Input
              v-model="form.brandColor"
              placeholder="#4F46E5"
            />
            <p class="text-xs text-muted-foreground mt-1.5">
              Hex color for template branding (e.g., #4F46E5)
            </p>
          </div>

          <div>
            <label class="text-sm font-medium block mb-2">Attachment</label>
            <Input
              type="file"
              @change="handleFileChange"
            />
            <p v-if="form.attachment" class="text-xs text-muted-foreground mt-1.5">
              Selected: {{ form.attachment.name }}
            </p>
          </div>

          <Button
            type="submit"
            :disabled="!form.apiKey || !form.to || !form.subject || sending"
            class="w-full"
          >
            {{ sending ? 'Sending...' : 'Send Test Email' }}
          </Button>
        </form>
      </Card>

      <!-- Response -->
      <Card class="p-6">
        <h3 class="text-lg font-semibold mb-4">Response</h3>

        <div v-if="!response && !error" class="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-3 opacity-50">
            <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"></path>
            <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"></path>
          </svg>
          <p class="text-sm">Response will appear here after sending</p>
        </div>

        <Alert v-if="error" variant="destructive" title="Error" :description="error" />

        <div v-if="response" class="space-y-4">
          <Alert
            variant="success"
            title="Email Sent Successfully!"
            :description="`Message ID: ${response.messageId}`"
          />

          <div class="rounded-lg bg-muted p-4">
            <h4 class="text-xs font-semibold mb-2">Full Response</h4>
            <pre class="text-xs overflow-x-auto">{{ JSON.stringify(response, null, 2) }}</pre>
          </div>

          <NuxtLink
            v-if="response.messageId"
            :to="`/messages/${response.messageId}`"
          >
            <Button variant="outline" class="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
              View Message Details
            </Button>
          </NuxtLink>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { data: keysData, pending: keysLoading } = useFetch('/api/internal/app-keys')

const keys = computed(() => keysData.value?.keys || [])

const keyOptions = computed(() => {
  if (!keys.value || !keys.value.length) return []
  return keys.value
    .filter((k: any) => !k.isRevoked)
    .map((k: any) => ({
      label: `${k.name} (${k.keyPrefix})`,
      value: k.id
    }))
})

const templateOptions = [
  { label: 'None (plain HTML)', value: '' },
  { label: 'Modern (gradient header)', value: 'modern' },
  { label: 'Simple (minimal)', value: 'simple' },
  { label: 'Newsletter', value: 'newsletter' },
  { label: 'Transactional', value: 'transactional' },
  { label: 'Announcement', value: 'announcement' }
]

const form = ref({
  apiKey: '',
  to: '',
  toName: '',
  subject: 'Test Email from Email Gateway',
  html: '<h1>Hello!</h1><p>This is a test email from the Email Gateway.</p>',
  text: 'Hello! This is a test email from the Email Gateway.',
  template: '',
  companyName: 'Your Company',
  brandColor: '#4F46E5',
  attachment: null as { name: string; contentBase64: string } | null
})

const sending = ref(false)
const response = ref<any>(null)
const error = ref('')

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    form.value.attachment = null
    return
  }

  // Convert file to base64
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = (e.target?.result as string).split(',')[1]
    form.value.attachment = {
      name: file.name,
      contentBase64: base64
    }
  }
  reader.readAsDataURL(file)
}

const sendEmail = async () => {
  sending.value = true
  response.value = null
  error.value = ''

  try {
    // Find the selected key
    const selectedKey = keys.value?.find((k: any) => k.id === form.value.apiKey)
    if (!selectedKey) {
      throw new Error('Selected API key not found')
    }

    const body: any = {
      keyId: form.value.apiKey,
      to: [{ email: form.value.to, name: form.value.toName || undefined }],
      subject: form.value.subject,
      html: form.value.html || undefined,
      text: form.value.text || undefined
    }

    // Add template options if template is selected
    if (form.value.template) {
      body.template = form.value.template
      body.templateData = {
        companyName: form.value.companyName,
        brandColor: form.value.brandColor
      }
    }

    if (form.value.attachment) {
      body.attachments = [form.value.attachment]
    }

    const { data: result, error: fetchError } = await useFetch('/api/internal/send-test', {
      method: 'POST',
      body
    })

    if (fetchError.value) {
      throw new Error(fetchError.value.message || 'Failed to send email')
    }

    response.value = result.value
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to send email'
  } finally {
    sending.value = false
  }
}
</script>
