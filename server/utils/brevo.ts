const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

export interface BrevoRecipient {
  email: string
  name?: string
}

export interface BrevoAttachment {
  name: string
  content: string  // base64 encoded
}

export interface BrevoSendRequest {
  sender: {
    email: string
    name?: string
  }
  to: BrevoRecipient[]
  cc?: BrevoRecipient[]
  bcc?: BrevoRecipient[]
  replyTo?: {
    email: string
    name?: string
  }
  subject?: string
  htmlContent?: string
  textContent?: string
  templateId?: number
  params?: Record<string, unknown>
  attachment?: BrevoAttachment[]
  tags?: string[]
  headers?: Record<string, string>
}

export interface BrevoSendResponse {
  messageId: string
  messageIds?: string[]
}

export interface BrevoError {
  code: string
  message: string
}

export async function sendEmail(
  apiKey: string,
  request: BrevoSendRequest
): Promise<{ success: true; data: BrevoSendResponse } | { success: false; error: BrevoError }> {
  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request)
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.code || 'BREVO_ERROR',
          message: data.message || 'Unknown error from Brevo'
        }
      }
    }

    return {
      success: true,
      data: data as BrevoSendResponse
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error'
      }
    }
  }
}
