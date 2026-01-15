import { z } from 'zod'

// Email recipient schema
const recipientSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional()
})

// Attachment schema
const attachmentSchema = z.object({
  name: z.string().min(1, 'Attachment name is required'),
  contentBase64: z.string().min(1, 'Attachment content is required')
})

// Send email request schema
export const sendEmailSchema = z.object({
  // Recipients
  to: z.array(recipientSchema).min(1, 'At least one recipient is required'),
  cc: z.array(recipientSchema).optional(),
  bcc: z.array(recipientSchema).optional(),

  // Sender (optional - defaults to configured sender)
  from: z.object({
    email: z.string().email('Invalid sender email'),
    name: z.string().optional()
  }).optional(),

  replyTo: z.object({
    email: z.string().email('Invalid reply-to email'),
    name: z.string().optional()
  }).optional(),

  // Content - either subject + (text/html) OR templateId
  subject: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),

  // Template support
  templateId: z.number().int().positive().optional(),
  params: z.record(z.unknown()).optional(),

  // Tags for categorization
  tags: z.array(z.string()).optional(),

  // Attachments
  attachments: z.array(attachmentSchema).optional(),

  // Email template wrapper (for styling)
  template: z.enum(['modern', 'simple', 'newsletter', 'transactional', 'announcement']).optional(),
  templateData: z.record(z.string()).optional(),
  inlineCss: z.boolean().optional().default(true),

  // Idempotency
  idempotencyKey: z.string().optional()
}).refine(
  (data) => {
    // Must have either (subject + text/html) OR templateId
    const hasContent = data.subject && (data.text || data.html)
    const hasTemplate = data.templateId !== undefined
    return hasContent || hasTemplate
  },
  {
    message: 'Must provide either (subject + text/html) or templateId'
  }
)

// Create app key request schema
export const createAppKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  defaultFromName: z.string().optional(),
  defaultFromEmail: z.string().email().optional(),
  tags: z.array(z.string()).optional()
})

// Types derived from schemas
export type SendEmailRequest = z.infer<typeof sendEmailSchema>
export type CreateAppKeyRequest = z.infer<typeof createAppKeySchema>
