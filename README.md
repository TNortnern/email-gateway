# Email Gateway v1

A reusable email platform backed by Brevo, built with Nuxt 3. This service wraps the Brevo Transactional Email API and provides a stable API for all your applications.

## Features

- 🔐 **API Key Management** - Create and manage application-specific API keys
- 📧 **Email Sending** - Send transactional emails with attachments
- 🎯 **Default Configuration** - Set default "from" addresses per app key
- 🔄 **Idempotency** - Prevent duplicate sends with idempotency keys
- 📊 **Message Tracking** - View and track all sent emails
- 🎨 **Admin UI** - Beautiful Nuxt UI interface for management
- 🏷️ **Tagging** - Organize emails with custom tags
- 📎 **Attachments** - Support for email attachments (up to 20MB)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
BREVO_API_KEY=your-brevo-api-key-here
DEFAULT_FROM_EMAIL=support@tnorthern.com
DEFAULT_FROM_NAME=Support
ADMIN_PASSWORD=your-secure-admin-password
```

### 3. Initialize Database

```bash
npm run db:init
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and login with your admin password.

## API Documentation

Base URL: `/v1`

### Authentication

All API endpoints (except `/health`) require authentication using Bearer tokens:

```
Authorization: Bearer <app_key>
```

### Endpoints

#### Health Check

```http
GET /v1/health
```

Returns API health status.

**Response:**
```json
{
  "ok": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

#### Send Email

```http
POST /v1/send
```

Send a transactional email.

**Request Body:**
```json
{
  "to": [
    { "email": "user@example.com", "name": "User Name" }
  ],
  "cc": [],
  "bcc": [],
  "from": {
    "email": "no-reply@tnorthern.com",
    "name": "My App"
  },
  "replyTo": {
    "email": "support@tnorthern.com"
  },
  "subject": "Welcome",
  "text": "Hello!",
  "html": "<p>Hello!</p>",
  "templateId": 123,
  "params": {
    "firstName": "Ada"
  },
  "tags": ["welcome", "onboarding"],
  "attachments": [
    {
      "name": "invoice.pdf",
      "contentBase64": "JVBERi0xL..."
    }
  ],
  "idempotencyKey": "unique-key-123"
}
```

**Required Fields:**
- `to` - At least one recipient
- Either `subject` + (`text` or `html`) OR `templateId`

**Optional Fields:**
- `from` - Defaults to configured sender
- `cc`, `bcc` - Additional recipients
- `replyTo` - Reply-to address
- `templateId` + `params` - Use Brevo template
- `tags` - Categorization tags
- `attachments` - File attachments (base64 encoded)
- `idempotencyKey` - Prevent duplicate sends

**Response (201):**
```json
{
  "messageId": "msg_01J....",
  "status": "queued",
  "provider": "brevo"
}
```

#### List Messages

```http
GET /v1/messages?limit=50&cursor=...
```

List sent messages for your app key.

**Query Parameters:**
- `limit` - Number of messages (max 100, default 50)
- `cursor` - Pagination cursor from previous response

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_123",
      "messageId": "<email@provider.com>",
      "to": [{ "email": "user@example.com", "name": "User" }],
      "from": { "email": "support@tnorthern.com", "name": "Support" },
      "subject": "Welcome",
      "status": "queued",
      "tags": ["welcome"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "cursor": "2024-01-01T00:00:00.000Z"
}
```

#### Get Message Details

```http
GET /v1/messages/:messageId
```

Get detailed information about a specific message.

**Response:**
```json
{
  "id": "msg_123",
  "messageId": "<email@provider.com>",
  "to": [{ "email": "user@example.com", "name": "User" }],
  "cc": null,
  "bcc": null,
  "from": { "email": "support@tnorthern.com", "name": "Support" },
  "subject": "Welcome",
  "status": "queued",
  "tags": ["welcome"],
  "providerResponse": { ... },
  "idempotencyKey": "unique-key-123",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Admin UI

### Login

Navigate to `/login` and enter your admin password.

### Manage API Keys

- **Create Keys**: Click "Create API Key" to generate a new app key
- **Copy Keys**: Keys are only shown once during creation
- **Revoke Keys**: Revoke keys that are no longer needed
- **Configure Defaults**: Set default sender per key

### Send Test Emails

Use the "Send Test" page to test email sending with any API key.

### View Messages

Browse all sent messages, filter by status, and view detailed information.

## Usage Examples

### Node.js

```javascript
const response = await fetch('http://localhost:3000/v1/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer egw_live_...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: [{ email: 'user@example.com', name: 'User' }],
    subject: 'Hello from Email Gateway',
    html: '<h1>Welcome!</h1><p>This is a test email.</p>',
    text: 'Welcome! This is a test email.',
    tags: ['test']
  })
})

const data = await response.json()
console.log('Message ID:', data.messageId)
```

### cURL

```bash
curl -X POST http://localhost:3000/v1/send \
  -H "Authorization: Bearer egw_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "to": [{"email": "user@example.com"}],
    "subject": "Test Email",
    "html": "<p>Hello!</p>"
  }'
```

### Python

```python
import requests
import base64

# Send email with attachment
with open('invoice.pdf', 'rb') as f:
    attachment_base64 = base64.b64encode(f.read()).decode()

response = requests.post(
    'http://localhost:3000/v1/send',
    headers={
        'Authorization': 'Bearer egw_live_...',
        'Content-Type': 'application/json'
    },
    json={
        'to': [{'email': 'user@example.com', 'name': 'User'}],
        'subject': 'Your Invoice',
        'html': '<p>Please find your invoice attached.</p>',
        'attachments': [
            {
                'name': 'invoice.pdf',
                'contentBase64': attachment_base64
            }
        ],
        'tags': ['invoice', 'billing']
    }
)

print('Message ID:', response.json()['messageId'])
```

## Architecture

### Tech Stack

- **Framework**: Nuxt 3 (with Nitro server)
- **UI**: Nuxt UI (TailwindCSS + Headless UI)
- **Database**: SQLite (via better-sqlite3)
- **Email Provider**: Brevo (formerly Sendinblue)
- **Validation**: Zod

### Database Schema

#### app_keys
- `id` - Unique key ID
- `name` - Human-readable name
- `key_hash` - SHA-256 hash of API key
- `key_prefix` - Display prefix (first 16 chars)
- `default_from_name` - Default sender name
- `default_from_email` - Default sender email
- `tags` - JSON array of tags
- `revoked_at` - Revocation timestamp
- `created_at` - Creation timestamp

#### messages
- `id` - Internal message ID
- `app_key_id` - Reference to app_keys
- `message_id` - Brevo message ID
- `to_addresses` - JSON array of recipients
- `cc_addresses` - JSON array of CC recipients
- `bcc_addresses` - JSON array of BCC recipients
- `from_email` - Sender email
- `from_name` - Sender name
- `subject` - Email subject
- `template_id` - Brevo template ID (if used)
- `tags` - JSON array of tags
- `status` - Message status (pending/queued/failed)
- `provider_response` - JSON response from Brevo
- `idempotency_key` - Idempotency key
- `created_at` - Creation timestamp

## Security

- **API Keys**: Stored as SHA-256 hashes, never plain text
- **Admin Auth**: Cookie-based authentication for UI
- **HTTPS**: Use HTTPS in production
- **Rate Limiting**: Add rate limiting for production (not included in v1)

## Production Deployment

### Environment Variables

```env
BREVO_API_KEY=xkeysib-...
DEFAULT_FROM_EMAIL=support@yourdomain.com
DEFAULT_FROM_NAME=Your Company
ADMIN_PASSWORD=strong-random-password
NODE_ENV=production
```

### Build and Start

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Recommended Setup

- Use a reverse proxy (nginx, Caddy)
- Enable HTTPS/TLS
- Set secure admin password
- Regular database backups
- Add rate limiting middleware
- Monitor Brevo API usage

## Future Enhancements (v1.1+)

- [ ] Webhook receiver for delivery/bounce events
- [ ] Per-app rate limiting
- [ ] Template alias support
- [ ] Retry logic for failed sends
- [ ] Email preview in UI
- [ ] Scheduled sending
- [ ] Bulk email support
- [ ] Analytics dashboard

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
