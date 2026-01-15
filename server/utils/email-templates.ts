import juice from 'juice'

export interface EmailTemplate {
  name: string
  description: string
  render: (content: string, data?: Record<string, string>) => string
}

// Base responsive email wrapper
const baseWrapper = (content: string, brandColor: string = '#4F46E5') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .email-header {
      background: linear-gradient(135deg, ${brandColor} 0%, ${adjustBrightness(brandColor, -20)} 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .email-body {
      padding: 40px 30px;
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
    }
    .email-footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    h1, h2, h3 {
      color: #111827;
      margin-top: 0;
    }
    a {
      color: ${brandColor};
      text-decoration: none;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: ${brandColor};
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    @media only screen and (max-width: 600px) {
      .email-body, .email-header, .email-footer {
        padding: 20px !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    ${content}
  </div>
</body>
</html>
`

// Helper function to adjust color brightness
function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255))
    .toString(16).slice(1)
}

// Template: Modern (default)
export const modernTemplate: EmailTemplate = {
  name: 'modern',
  description: 'Clean, modern design with gradient header',
  render: (content: string, data?: Record<string, string>) => {
    const brandColor = data?.brandColor || '#4F46E5'
    const companyName = data?.companyName || 'Company'

    return baseWrapper(`
      <div class="email-header">
        <h1 style="color: white; margin: 0; font-size: 28px;">${companyName}</h1>
      </div>
      <div class="email-body">
        ${content}
      </div>
      <div class="email-footer">
        <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        <p style="margin: 0; font-size: 12px;">This email was sent from an automated system. Please do not reply.</p>
      </div>
    `, brandColor)
  }
}

// Template: Simple
export const simpleTemplate: EmailTemplate = {
  name: 'simple',
  description: 'Minimal design, perfect for plain text with light styling',
  render: (content: string, data?: Record<string, string>) => {
    const brandColor = data?.brandColor || '#4F46E5'

    return baseWrapper(`
      <div class="email-body" style="padding: 50px 30px;">
        ${content}
      </div>
    `, brandColor)
  }
}

// Template: Newsletter
export const newsletterTemplate: EmailTemplate = {
  name: 'newsletter',
  description: 'Newsletter style with prominent header',
  render: (content: string, data?: Record<string, string>) => {
    const brandColor = data?.brandColor || '#4F46E5'
    const companyName = data?.companyName || 'Newsletter'
    const heading = data?.heading || 'Latest Updates'

    return baseWrapper(`
      <div class="email-header">
        <h2 style="color: white; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">${companyName}</h2>
        <h1 style="color: white; margin: 0; font-size: 32px;">${heading}</h1>
      </div>
      <div class="email-body">
        ${content}
      </div>
      <div class="email-footer">
        <p style="margin: 0;">${companyName} | <a href="#">Unsubscribe</a> | <a href="#">Preferences</a></p>
      </div>
    `, brandColor)
  }
}

// Template: Transactional
export const transactionalTemplate: EmailTemplate = {
  name: 'transactional',
  description: 'Clean design for receipts, confirmations, and notifications',
  render: (content: string, data?: Record<string, string>) => {
    const brandColor = data?.brandColor || '#4F46E5'
    const companyName = data?.companyName || 'Company'

    return baseWrapper(`
      <div style="background-color: ${brandColor}; padding: 20px 30px; border-bottom: 4px solid ${adjustBrightness(brandColor, -20)};">
        <h2 style="color: white; margin: 0; font-size: 20px;">${companyName}</h2>
      </div>
      <div class="email-body">
        ${content}
      </div>
      <div class="email-footer">
        <p style="margin: 0 0 5px 0;">Need help? Contact us at <a href="mailto:support@example.com">support@example.com</a></p>
        <p style="margin: 0; font-size: 12px;">&copy; ${new Date().getFullYear()} ${companyName}</p>
      </div>
    `, brandColor)
  }
}

// Template: Announcement
export const announcementTemplate: EmailTemplate = {
  name: 'announcement',
  description: 'Bold design for important announcements',
  render: (content: string, data?: Record<string, string>) => {
    const brandColor = data?.brandColor || '#DC2626'
    const title = data?.title || '📢 Important Announcement'

    return baseWrapper(`
      <div class="email-header" style="padding: 50px 30px;">
        <h1 style="color: white; margin: 0; font-size: 36px;">${title}</h1>
      </div>
      <div class="email-body" style="padding: 50px 30px; background-color: #fffbeb; border-left: 4px solid ${brandColor};">
        ${content}
      </div>
    `, brandColor)
  }
}

// Map of all templates
export const templates: Record<string, EmailTemplate> = {
  modern: modernTemplate,
  simple: simpleTemplate,
  newsletter: newsletterTemplate,
  transactional: transactionalTemplate,
  announcement: announcementTemplate
}

/**
 * Process HTML email with template and CSS inlining
 */
export function processEmailHtml(
  html: string,
  options?: {
    template?: string
    templateData?: Record<string, string>
    inlineCss?: boolean
  }
): string {
  let processedHtml = html

  // Apply template if specified
  if (options?.template && templates[options.template]) {
    processedHtml = templates[options.template].render(processedHtml, options.templateData)
  }

  // Inline CSS (enabled by default unless explicitly disabled)
  if (options?.inlineCss !== false) {
    try {
      processedHtml = juice(processedHtml)
    } catch (error) {
      console.error('CSS inlining failed:', error)
      // Continue with non-inlined CSS if inlining fails
    }
  }

  return processedHtml
}

/**
 * Get list of available templates
 */
export function getAvailableTemplates(): Array<{ name: string; description: string }> {
  return Object.values(templates).map(t => ({
    name: t.name,
    description: t.description
  }))
}
