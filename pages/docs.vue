<template>
  <div class="docs-container">
    <!-- Sidebar Navigation -->
    <aside class="docs-sidebar">
      <div class="sidebar-header">
        <h1 class="sidebar-title">API Docs</h1>
        <div class="version-badge">v1.0</div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title">Getting Started</div>
          <a href="#introduction" class="nav-link" :class="{ active: activeSection === 'introduction' }">
            <span class="nav-icon">→</span>
            Introduction
          </a>
          <a href="#authentication" class="nav-link" :class="{ active: activeSection === 'authentication' }">
            <span class="nav-icon">→</span>
            Authentication
          </a>
          <a href="#quick-start" class="nav-link" :class="{ active: activeSection === 'quick-start' }">
            <span class="nav-icon">→</span>
            Quick Start
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">API Endpoints</div>
          <a href="#send-email" class="nav-link" :class="{ active: activeSection === 'send-email' }">
            <span class="nav-icon">→</span>
            Send Email
          </a>
          <a href="#list-messages" class="nav-link" :class="{ active: activeSection === 'list-messages' }">
            <span class="nav-icon">→</span>
            List Messages
          </a>
          <a href="#get-message" class="nav-link" :class="{ active: activeSection === 'get-message' }">
            <span class="nav-icon">→</span>
            Get Message
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Resources</div>
          <a href="#templates" class="nav-link" :class="{ active: activeSection === 'templates' }">
            <span class="nav-icon">→</span>
            Email Templates
          </a>
          <a href="#errors" class="nav-link" :class="{ active: activeSection === 'errors' }">
            <span class="nav-icon">→</span>
            Error Codes
          </a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="footer-links">
          <a href="https://github.com" target="_blank" class="footer-link">GitHub</a>
          <a href="#" class="footer-link">Support</a>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="docs-content">
      <div class="content-inner">
        <!-- Introduction -->
        <section id="introduction" class="doc-section">
          <div class="section-badge">Getting Started</div>
          <h2 class="section-title">Introduction</h2>
          <p class="section-description">
            The Email Gateway API enables you to send transactional emails through a simple REST interface.
            Built for developers who need reliable email delivery with minimal configuration.
          </p>

          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <h3>Fast Delivery</h3>
              <p>Sub-second API response times with queued processing</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔒</div>
              <h3>Secure by Default</h3>
              <p>API key authentication with automatic key rotation</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📊</div>
              <h3>Full Tracking</h3>
              <p>Monitor delivery status and email metrics in real-time</p>
            </div>
          </div>
        </section>

        <!-- Authentication -->
        <section id="authentication" class="doc-section">
          <div class="section-badge">Security</div>
          <h2 class="section-title">Authentication</h2>
          <p class="section-description">
            All API requests require authentication using an API key. Include your key in the
            <code class="inline-code">Authorization</code> header using the Bearer scheme.
          </p>

          <CodeBlock
            language="bash"
            :code="authExample"
            title="Authentication Header"
          />

          <div class="info-box">
            <div class="info-icon">ℹ️</div>
            <div>
              <strong>Keep your API keys secure!</strong> Never commit them to version control.
              Use environment variables to store your keys safely.
            </div>
          </div>
        </section>

        <!-- Quick Start -->
        <section id="quick-start" class="doc-section">
          <div class="section-badge">Getting Started</div>
          <h2 class="section-title">Quick Start</h2>
          <p class="section-description">
            Send your first email in under 60 seconds. Here's a complete example using cURL.
          </p>

          <CodeBlock
            language="bash"
            :code="quickStartExample"
            title="Send Your First Email"
          />
        </section>

        <!-- Send Email Endpoint -->
        <section id="send-email" class="doc-section">
          <div class="section-badge">API Reference</div>
          <h2 class="section-title">Send Email</h2>

          <div class="endpoint-header">
            <span class="http-method post">POST</span>
            <code class="endpoint-path">/api/v1/send</code>
          </div>

          <p class="section-description">
            Send a transactional email with full HTML support, attachments, and template rendering.
          </p>

          <h3 class="subsection-title">Request Body</h3>
          <div class="param-table">
            <div class="param-row">
              <div class="param-name">
                <code>to</code>
                <span class="param-required">required</span>
              </div>
              <div class="param-type">array</div>
              <div class="param-description">
                Array of recipient objects with <code>email</code> and optional <code>name</code> fields
              </div>
            </div>
            <div class="param-row">
              <div class="param-name">
                <code>subject</code>
                <span class="param-required">required</span>
              </div>
              <div class="param-type">string</div>
              <div class="param-description">Email subject line</div>
            </div>
            <div class="param-row">
              <div class="param-name"><code>html</code></div>
              <div class="param-type">string</div>
              <div class="param-description">HTML content of the email</div>
            </div>
            <div class="param-row">
              <div class="param-name"><code>text</code></div>
              <div class="param-type">string</div>
              <div class="param-description">Plain text version (fallback)</div>
            </div>
            <div class="param-row">
              <div class="param-name"><code>from</code></div>
              <div class="param-type">object</div>
              <div class="param-description">
                Sender information with <code>email</code> and <code>name</code>
              </div>
            </div>
            <div class="param-row">
              <div class="param-name"><code>template</code></div>
              <div class="param-type">string</div>
              <div class="param-description">
                Template name: <code>modern</code>, <code>simple</code>, <code>newsletter</code>,
                <code>transactional</code>, or <code>announcement</code>
              </div>
            </div>
            <div class="param-row">
              <div class="param-name"><code>templateData</code></div>
              <div class="param-type">object</div>
              <div class="param-description">
                Template variables like <code>companyName</code> and <code>brandColor</code>
              </div>
            </div>
            <div class="param-row">
              <div class="param-name"><code>attachments</code></div>
              <div class="param-type">array</div>
              <div class="param-description">
                Array of attachment objects with <code>name</code> and <code>contentBase64</code>
              </div>
            </div>
            <div class="param-row">
              <div class="param-name"><code>idempotencyKey</code></div>
              <div class="param-type">string</div>
              <div class="param-description">
                Unique key to prevent duplicate sends (max 24 hours)
              </div>
            </div>
          </div>

          <h3 class="subsection-title">Example Request</h3>
          <CodeBlock
            language="javascript"
            :code="sendEmailExample"
            title="Node.js / JavaScript"
          />

          <h3 class="subsection-title">Response</h3>
          <CodeBlock
            language="json"
            :code="sendEmailResponse"
            title="200 OK"
          />
        </section>

        <!-- List Messages Endpoint -->
        <section id="list-messages" class="doc-section">
          <div class="section-badge">API Reference</div>
          <h2 class="section-title">List Messages</h2>

          <div class="endpoint-header">
            <span class="http-method get">GET</span>
            <code class="endpoint-path">/api/v1/messages</code>
          </div>

          <p class="section-description">
            Retrieve a paginated list of sent messages with filtering and sorting options.
          </p>

          <h3 class="subsection-title">Query Parameters</h3>
          <div class="param-table">
            <div class="param-row">
              <div class="param-name"><code>page</code></div>
              <div class="param-type">number</div>
              <div class="param-description">Page number (default: 1)</div>
            </div>
            <div class="param-row">
              <div class="param-name"><code>limit</code></div>
              <div class="param-type">number</div>
              <div class="param-description">Results per page (default: 50, max: 100)</div>
            </div>
            <div class="param-row">
              <div class="param-name"><code>status</code></div>
              <div class="param-type">string</div>
              <div class="param-description">
                Filter by status: <code>queued</code>, <code>sent</code>, <code>delivered</code>,
                <code>failed</code>, <code>bounced</code>
              </div>
            </div>
          </div>

          <h3 class="subsection-title">Example Request</h3>
          <CodeBlock
            language="bash"
            :code="listMessagesExample"
            title="cURL"
          />

          <h3 class="subsection-title">Response</h3>
          <CodeBlock
            language="json"
            :code="listMessagesResponse"
            title="200 OK"
          />
        </section>

        <!-- Get Message Endpoint -->
        <section id="get-message" class="doc-section">
          <div class="section-badge">API Reference</div>
          <h2 class="section-title">Get Message</h2>

          <div class="endpoint-header">
            <span class="http-method get">GET</span>
            <code class="endpoint-path">/api/v1/messages/:messageId</code>
          </div>

          <p class="section-description">
            Retrieve detailed information about a specific message including delivery status and metadata.
          </p>

          <h3 class="subsection-title">Example Request</h3>
          <CodeBlock
            language="bash"
            :code="getMessageExample"
            title="cURL"
          />

          <h3 class="subsection-title">Response</h3>
          <CodeBlock
            language="json"
            :code="getMessageResponse"
            title="200 OK"
          />
        </section>

        <!-- Templates -->
        <section id="templates" class="doc-section">
          <div class="section-badge">Resources</div>
          <h2 class="section-title">Email Templates</h2>
          <p class="section-description">
            Built-in responsive email templates that work across all major email clients.
          </p>

          <div class="template-grid">
            <div class="template-card">
              <div class="template-preview modern"></div>
              <h4>Modern</h4>
              <p>Gradient header with clean layout</p>
              <code>template: "modern"</code>
            </div>
            <div class="template-card">
              <div class="template-preview simple"></div>
              <h4>Simple</h4>
              <p>Minimal design for transactional emails</p>
              <code>template: "simple"</code>
            </div>
            <div class="template-card">
              <div class="template-preview newsletter"></div>
              <h4>Newsletter</h4>
              <p>Multi-section layout for content</p>
              <code>template: "newsletter"</code>
            </div>
            <div class="template-card">
              <div class="template-preview transactional"></div>
              <h4>Transactional</h4>
              <p>Clear CTAs and status indicators</p>
              <code>template: "transactional"</code>
            </div>
          </div>
        </section>

        <!-- Error Codes -->
        <section id="errors" class="doc-section">
          <div class="section-badge">Resources</div>
          <h2 class="section-title">Error Codes</h2>
          <p class="section-description">
            The API uses standard HTTP response codes and returns detailed error messages in JSON format.
          </p>

          <div class="error-table">
            <div class="error-row">
              <div class="error-code">400</div>
              <div class="error-info">
                <strong>Bad Request</strong>
                <p>Invalid request parameters or missing required fields</p>
              </div>
            </div>
            <div class="error-row">
              <div class="error-code">401</div>
              <div class="error-info">
                <strong>Unauthorized</strong>
                <p>Missing or invalid API key</p>
              </div>
            </div>
            <div class="error-row">
              <div class="error-code">403</div>
              <div class="error-info">
                <strong>Forbidden</strong>
                <p>API key is revoked or lacks required permissions</p>
              </div>
            </div>
            <div class="error-row">
              <div class="error-code">429</div>
              <div class="error-info">
                <strong>Too Many Requests</strong>
                <p>Rate limit exceeded - wait before retrying</p>
              </div>
            </div>
            <div class="error-row">
              <div class="error-code">500</div>
              <div class="error-info">
                <strong>Internal Server Error</strong>
                <p>Something went wrong on our end - please retry</p>
              </div>
            </div>
          </div>

          <h3 class="subsection-title">Error Response Format</h3>
          <CodeBlock
            language="json"
            :code="errorExample"
            title="Example Error Response"
          />
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: false
})

const activeSection = ref('introduction')

const authExample = `curl https://yourdomain.com/api/v1/send \\
  -H "Authorization: Bearer egw_live_abc123xyz789"`

const quickStartExample = `curl -X POST https://yourdomain.com/api/v1/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": [{"email": "user@example.com", "name": "John Doe"}],
    "subject": "Welcome to our platform!",
    "html": "<h1>Hello!</h1><p>Welcome aboard.</p>"
  }'`

const sendEmailExample = `const response = await fetch('https://yourdomain.com/api/v1/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: [
      { email: 'user@example.com', name: 'John Doe' }
    ],
    subject: 'Welcome to our platform!',
    html: '<h1>Hello!</h1><p>Thanks for signing up.</p>',
    text: 'Hello! Thanks for signing up.',
    from: {
      email: 'hello@yourdomain.com',
      name: 'Your Company'
    },
    template: 'modern',
    templateData: {
      companyName: 'Your Company',
      brandColor: '#4F46E5'
    }
  })
})

const data = await response.json()
console.log(data)`

const sendEmailResponse = `{
  "success": true,
  "messageId": "msg_abc123",
  "internalId": "EI_xyz789",
  "provider": "brevo",
  "status": "queued"
}`

const listMessagesExample = `curl https://yourdomain.com/api/v1/messages?page=1&limit=50 \\
  -H "Authorization: Bearer YOUR_API_KEY"`

const listMessagesResponse = `{
  "messages": [
    {
      "id": "msg_abc123",
      "messageId": "<202601151715.98511438670@smtp-relay.mailin.fr>",
      "to": "user@example.com",
      "subject": "Welcome to our platform!",
      "status": "delivered",
      "createdAt": "2026-01-15T17:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  }
}`

const getMessageExample = `curl https://yourdomain.com/api/v1/messages/msg_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`

const getMessageResponse = `{
  "id": "msg_abc123",
  "messageId": "<202601151715.98511438670@smtp-relay.mailin.fr>",
  "internalId": "EI_xyz789",
  "to": [{"email": "user@example.com", "name": "John Doe"}],
  "from": {"email": "hello@yourdomain.com", "name": "Your Company"},
  "subject": "Welcome to our platform!",
  "status": "delivered",
  "provider": "brevo",
  "createdAt": "2026-01-15T17:15:00.000Z",
  "sentAt": "2026-01-15T17:15:01.000Z"
}`

const errorExample = `{
  "error": "Invalid request",
  "message": "Missing required field: subject",
  "code": "VALIDATION_ERROR"
}`

// Intersection Observer for active section tracking
onMounted(() => {
  const sections = document.querySelectorAll('.doc-section')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    },
    {
      rootMargin: '-100px 0px -80% 0px'
    }
  )

  sections.forEach((section) => observer.observe(section))

  onUnmounted(() => {
    sections.forEach((section) => observer.unobserve(section))
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@400;600;700;800&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.docs-container {
  display: flex;
  min-height: 100vh;
  background: #0a0e1a;
  color: #e2e8f0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* Animated background grid */
.docs-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

/* Sidebar */
.docs-sidebar {
  width: 280px;
  min-width: 280px;
  background: #0f1420;
  border-right: 1px solid rgba(0, 217, 255, 0.1);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 32px 24px;
  border-bottom: 1px solid rgba(0, 217, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-title {
  font-family: 'Syne', sans-serif;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #00d9ff 0%, #00ff88 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.version-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  background: rgba(0, 217, 255, 0.1);
  color: #00d9ff;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(0, 217, 255, 0.2);
}

.sidebar-nav {
  flex: 1;
  padding: 24px 0;
}

.nav-section {
  margin-bottom: 32px;
}

.nav-section-title {
  font-family: 'Syne', sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
  padding: 0 24px;
  margin-bottom: 12px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 24px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
}

.nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #00d9ff;
  transform: scaleY(0);
  transition: transform 0.2s;
}

.nav-link:hover {
  color: #00d9ff;
  background: rgba(0, 217, 255, 0.05);
}

.nav-link.active {
  color: #00d9ff;
  background: rgba(0, 217, 255, 0.1);
}

.nav-link.active::before {
  transform: scaleY(1);
}

.nav-icon {
  font-size: 12px;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.2s;
}

.nav-link:hover .nav-icon,
.nav-link.active .nav-icon {
  opacity: 1;
  transform: translateX(0);
}

.sidebar-footer {
  padding: 24px;
  border-top: 1px solid rgba(0, 217, 255, 0.1);
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-link {
  color: #64748b;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #00d9ff;
}

/* Main Content */
.docs-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.content-inner {
  max-width: 900px;
  padding: 80px 60px;
  margin: 0 auto;
}

.doc-section {
  margin-bottom: 120px;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-badge {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #00d9ff;
  background: rgba(0, 217, 255, 0.1);
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(0, 217, 255, 0.2);
  margin-bottom: 16px;
}

.section-title {
  font-family: 'Syne', sans-serif;
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 20px;
  line-height: 1.1;
}

.section-description {
  font-size: 18px;
  line-height: 1.7;
  color: #94a3b8;
  margin-bottom: 40px;
}

.inline-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
  background: rgba(0, 217, 255, 0.1);
  color: #00d9ff;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(0, 217, 255, 0.2);
}

/* Feature Grid */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.feature-card {
  background: rgba(15, 20, 32, 0.5);
  border: 1px solid rgba(0, 217, 255, 0.1);
  border-radius: 12px;
  padding: 28px;
  transition: all 0.3s;
}

.feature-card:hover {
  border-color: rgba(0, 217, 255, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 217, 255, 0.1);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.feature-card p {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.6;
}

/* Info Box */
.info-box {
  display: flex;
  gap: 16px;
  background: rgba(0, 217, 255, 0.05);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-top: 32px;
  font-size: 14px;
  line-height: 1.6;
  color: #cbd5e1;
}

.info-icon {
  font-size: 20px;
  flex-shrink: 0;
}

/* Endpoint Header */
.endpoint-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: rgba(15, 20, 32, 0.5);
  border: 1px solid rgba(0, 217, 255, 0.1);
  border-radius: 12px;
}

.http-method {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
  text-transform: uppercase;
}

.http-method.get {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.http-method.post {
  background: rgba(0, 217, 255, 0.1);
  color: #00d9ff;
  border: 1px solid rgba(0, 217, 255, 0.2);
}

.endpoint-path {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  color: #ffffff;
}

/* Subsection Title */
.subsection-title {
  font-family: 'Syne', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-top: 48px;
  margin-bottom: 24px;
}

/* Parameter Table */
.param-table {
  margin-top: 24px;
  margin-bottom: 40px;
}

.param-row {
  display: grid;
  grid-template-columns: 1fr 120px 2fr;
  gap: 20px;
  padding: 20px;
  background: rgba(15, 20, 32, 0.3);
  border: 1px solid rgba(0, 217, 255, 0.1);
  margin-bottom: -1px;
}

.param-row:first-child {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.param-row:last-child {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.param-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  color: #00d9ff;
}

.param-required {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  background: rgba(255, 100, 100, 0.1);
  color: #ff6464;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(255, 100, 100, 0.2);
}

.param-type {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #00ff88;
}

.param-description {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.6;
}

/* Template Grid */
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.template-card {
  background: rgba(15, 20, 32, 0.5);
  border: 1px solid rgba(0, 217, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
}

.template-card:hover {
  border-color: rgba(0, 217, 255, 0.3);
  transform: translateY(-4px);
}

.template-preview {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.template-preview.modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.template-preview.simple {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.template-preview.newsletter {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.template-preview.transactional {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.template-card h4 {
  font-family: 'Syne', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.template-card p {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.template-card code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #00d9ff;
}

/* Error Table */
.error-table {
  margin-top: 32px;
}

.error-row {
  display: flex;
  gap: 24px;
  padding: 24px;
  background: rgba(15, 20, 32, 0.3);
  border: 1px solid rgba(0, 217, 255, 0.1);
  margin-bottom: -1px;
}

.error-row:first-child {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.error-row:last-child {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.error-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  font-weight: 700;
  color: #00d9ff;
  min-width: 60px;
}

.error-info strong {
  display: block;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 6px;
}

.error-info p {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.6;
}

/* Scrollbar */
.docs-sidebar::-webkit-scrollbar {
  width: 8px;
}

.docs-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.docs-sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 217, 255, 0.2);
  border-radius: 4px;
}

.docs-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 217, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .docs-sidebar {
    display: none;
  }

  .content-inner {
    padding: 40px 24px;
  }

  .section-title {
    font-size: 36px;
  }

  .param-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
