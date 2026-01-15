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
- **UI**: TailwindCSS + Radix Vue
- **Database**: PostgreSQL with Drizzle ORM
- **Migrations**: Drizzle Kit (Django-like strict migrations)
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

## Database Migrations

This project uses Drizzle ORM with PostgreSQL and implements a **strict, Django-like migration system** for safe schema changes.

### Migration Philosophy

- **Data Safety First**: Migrations are validated to prevent data loss
- **Fail-Fast**: Dangerous operations (DROP TABLE, DROP COLUMN, TRUNCATE, DELETE) are blocked
- **CI/CD Ready**: Failed migrations = failed deployment
- **Transactional**: All migrations run in transactions
- **Audit Trail**: Full logging of all migration operations

### Migration Commands

```bash
# Generate a new migration after schema changes
npm run db:generate

# Check pending migrations (CI/CD safe - read-only)
npm run db:migrate:check

# Apply pending migrations to database
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### CI/CD Integration

Add this to your deployment pipeline:

```yaml
# Example for Railway/Vercel/etc.
build:
  - npm install
  - npm run db:migrate:check  # Validates migrations
  - npm run db:migrate        # Applies migrations
  - npm run build             # Build the app
```

If `db:migrate` fails, the deployment stops automatically - protecting your data.

### Creating Schema Changes

1. Edit `server/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Review the generated SQL in `drizzle/migrations/`
4. Run `npm run db:migrate` to apply
5. Commit both schema and migration files

### Blocked Operations

These operations are rejected by the migration validator:
- `DROP TABLE` - Data loss risk
- `DROP COLUMN` - Data loss risk
- `TRUNCATE` - Data loss risk
- `DELETE FROM` - Data loss risk

To perform these operations, manually review and apply the SQL after careful consideration.

## Production Deployment

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:port/database
BREVO_API_KEY=xkeysib-...
DEFAULT_FROM_EMAIL=support@yourdomain.com
DEFAULT_FROM_NAME=Your Company
ADMIN_PASSWORD=strong-random-password
NODE_ENV=production
```

### Build and Start

```bash
# Run migrations first
npm run db:migrate

# Build for production
npm run build

# Start production server
npm start
```

### Recommended Setup

- Use a reverse proxy (nginx, Caddy)
- Enable HTTPS/TLS
- Set secure admin password
- Regular database backups (PostgreSQL dumps)
- Add rate limiting middleware
- Monitor Brevo API usage
- Run migrations before each deployment

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
