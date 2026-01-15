# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-14

### Added
- Initial release of Email Gateway v1
- Public API endpoints:
  - `GET /v1/health` - Health check
  - `POST /v1/send` - Send transactional emails
  - `GET /v1/messages` - List sent messages
  - `GET /v1/messages/:id` - Get message details
- Admin UI features:
  - App key management (create, list, revoke)
  - Send test emails interface
  - Message history browser
  - Message detail viewer
- Email features:
  - Support for HTML and plain text content
  - Attachment support (up to 20MB)
  - Multiple recipients (to, cc, bcc)
  - Custom sender (with defaults)
  - Reply-to support
  - Tag-based categorization
  - Brevo template support
  - Idempotency keys for duplicate prevention
- Security features:
  - Bearer token authentication for API
  - Cookie-based admin authentication
  - API key hashing (SHA-256)
  - One-time key display on creation
- Database:
  - SQLite with better-sqlite3
  - Message logging
  - App key management
  - Idempotency tracking
- Documentation:
  - Comprehensive README
  - OpenAPI 3.1 specification
  - Usage examples (JavaScript, TypeScript, Python, cURL, PHP, Ruby)
  - API documentation

### Technical Details
- Built with Nuxt 3
- Nuxt UI for admin interface
- Zod for validation
- Brevo (formerly Sendinblue) as email provider
- WAL mode for SQLite

## [Unreleased]

### Planned for v1.1
- [ ] Webhook receiver for delivery/bounce events
- [ ] Per-app rate limiting
- [ ] Template alias support
- [ ] Retry logic for failed sends
- [ ] Email preview in UI
- [ ] Scheduled sending

### Planned for v1.2
- [ ] Bulk email support
- [ ] Analytics dashboard
- [ ] Multi-user admin access
- [ ] API key rotation
- [ ] Webhook signature verification
