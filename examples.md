# Email Gateway API Examples

## Table of Contents
- [JavaScript/Node.js](#javascriptnodejs)
- [TypeScript](#typescript)
- [Python](#python)
- [cURL](#curl)
- [PHP](#php)
- [Ruby](#ruby)

## JavaScript/Node.js

### Simple Email

```javascript
const API_KEY = 'egw_live_your_key_here'
const API_URL = 'http://localhost:3000/v1'

async function sendEmail() {
  const response = await fetch(`${API_URL}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: [
        { email: 'user@example.com', name: 'John Doe' }
      ],
      subject: 'Welcome to our service',
      html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
      text: 'Welcome! Thanks for signing up.',
      tags: ['welcome', 'onboarding']
    })
  })

  const data = await response.json()
  console.log('Email sent:', data.messageId)
  return data
}

sendEmail()
```

### Email with Attachment

```javascript
const fs = require('fs')

async function sendEmailWithAttachment() {
  // Read file and convert to base64
  const fileBuffer = fs.readFileSync('./invoice.pdf')
  const base64Content = fileBuffer.toString('base64')

  const response = await fetch(`${API_URL}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: [{ email: 'customer@example.com' }],
      subject: 'Your Invoice',
      html: '<p>Please find your invoice attached.</p>',
      attachments: [
        {
          name: 'invoice.pdf',
          contentBase64: base64Content
        }
      ],
      tags: ['invoice', 'billing']
    })
  })

  return await response.json()
}
```

### Using Templates

```javascript
async function sendTemplateEmail() {
  const response = await fetch(`${API_URL}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: [
        { email: 'user@example.com', name: 'Ada Lovelace' }
      ],
      templateId: 123,
      params: {
        firstName: 'Ada',
        orderNumber: '12345',
        orderTotal: '$99.99'
      },
      tags: ['order-confirmation']
    })
  })

  return await response.json()
}
```

### With Idempotency

```javascript
async function sendEmailIdempotent(userId, emailType) {
  const idempotencyKey = `${userId}-${emailType}-${Date.now()}`

  const response = await fetch(`${API_URL}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: [{ email: 'user@example.com' }],
      subject: 'Your order confirmation',
      html: '<p>Thank you for your order!</p>',
      idempotencyKey
    })
  })

  const data = await response.json()

  // If you call this again with the same key, you'll get the cached response
  console.log('Cached:', data.cached)

  return data
}
```

## TypeScript

```typescript
interface EmailRecipient {
  email: string
  name?: string
}

interface SendEmailRequest {
  to: EmailRecipient[]
  cc?: EmailRecipient[]
  bcc?: EmailRecipient[]
  from?: EmailRecipient
  replyTo?: EmailRecipient
  subject?: string
  text?: string
  html?: string
  templateId?: number
  params?: Record<string, any>
  tags?: string[]
  attachments?: {
    name: string
    contentBase64: string
  }[]
  idempotencyKey?: string
}

interface SendEmailResponse {
  messageId: string
  status: string
  provider: string
  cached?: boolean
}

class EmailGatewayClient {
  constructor(
    private apiKey: string,
    private baseUrl: string = 'http://localhost:3000/v1'
  ) {}

  async send(request: SendEmailRequest): Promise<SendEmailResponse> {
    const response = await fetch(`${this.baseUrl}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Email send failed: ${error.message}`)
    }

    return await response.json()
  }

  async getMessages(limit: number = 50, cursor?: string) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (cursor) params.append('cursor', cursor)

    const response = await fetch(`${this.baseUrl}/messages?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    return await response.json()
  }

  async getMessage(messageId: string) {
    const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    return await response.json()
  }
}

// Usage
const client = new EmailGatewayClient('egw_live_your_key_here')

await client.send({
  to: [{ email: 'user@example.com', name: 'User' }],
  subject: 'Hello',
  html: '<p>Hello from TypeScript!</p>',
  tags: ['test']
})
```

## Python

### Simple Email

```python
import requests
import base64
import json

API_KEY = 'egw_live_your_key_here'
API_URL = 'http://localhost:3000/v1'

def send_email():
    response = requests.post(
        f'{API_URL}/send',
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'to': [
                {'email': 'user@example.com', 'name': 'User Name'}
            ],
            'subject': 'Welcome',
            'html': '<h1>Welcome!</h1><p>Thanks for joining.</p>',
            'text': 'Welcome! Thanks for joining.',
            'tags': ['welcome']
        }
    )

    response.raise_for_status()
    return response.json()

result = send_email()
print(f"Email sent: {result['messageId']}")
```

### Email with Attachment

```python
def send_email_with_attachment():
    # Read file and encode to base64
    with open('invoice.pdf', 'rb') as f:
        attachment_base64 = base64.b64encode(f.read()).decode('utf-8')

    response = requests.post(
        f'{API_URL}/send',
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'to': [{'email': 'customer@example.com'}],
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

    response.raise_for_status()
    return response.json()
```

### Using a Class

```python
class EmailGatewayClient:
    def __init__(self, api_key, base_url='http://localhost:3000/v1'):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })

    def send(self, **kwargs):
        response = self.session.post(f'{self.base_url}/send', json=kwargs)
        response.raise_for_status()
        return response.json()

    def get_messages(self, limit=50, cursor=None):
        params = {'limit': limit}
        if cursor:
            params['cursor'] = cursor

        response = self.session.get(f'{self.base_url}/messages', params=params)
        response.raise_for_status()
        return response.json()

    def get_message(self, message_id):
        response = self.session.get(f'{self.base_url}/messages/{message_id}')
        response.raise_for_status()
        return response.json()

# Usage
client = EmailGatewayClient('egw_live_your_key_here')

result = client.send(
    to=[{'email': 'user@example.com'}],
    subject='Hello from Python',
    html='<p>Hello!</p>',
    tags=['test']
)

print(f"Message ID: {result['messageId']}")
```

## cURL

### Simple Email

```bash
curl -X POST http://localhost:3000/v1/send \
  -H "Authorization: Bearer egw_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": [{"email": "user@example.com", "name": "User"}],
    "subject": "Test Email",
    "html": "<h1>Hello!</h1>",
    "text": "Hello!",
    "tags": ["test"]
  }'
```

### Email with Multiple Recipients

```bash
curl -X POST http://localhost:3000/v1/send \
  -H "Authorization: Bearer egw_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": [
      {"email": "user1@example.com", "name": "User One"},
      {"email": "user2@example.com", "name": "User Two"}
    ],
    "cc": [{"email": "manager@example.com"}],
    "subject": "Team Update",
    "html": "<p>Important team update...</p>",
    "tags": ["team", "update"]
  }'
```

### Get Messages

```bash
# List recent messages
curl -X GET "http://localhost:3000/v1/messages?limit=10" \
  -H "Authorization: Bearer egw_live_your_key_here"

# Get specific message
curl -X GET "http://localhost:3000/v1/messages/msg_abc123" \
  -H "Authorization: Bearer egw_live_your_key_here"
```

## PHP

```php
<?php

class EmailGatewayClient {
    private $apiKey;
    private $baseUrl;

    public function __construct($apiKey, $baseUrl = 'http://localhost:3000/v1') {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
    }

    public function send($data) {
        $ch = curl_init($this->baseUrl . '/send');

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json'
            ],
            CURLOPT_POSTFIELDS => json_encode($data)
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 201) {
            throw new Exception('Email send failed: ' . $response);
        }

        return json_decode($response, true);
    }

    public function sendWithAttachment($to, $subject, $html, $filePath) {
        $fileContent = file_get_contents($filePath);
        $base64Content = base64_encode($fileContent);

        return $this->send([
            'to' => [['email' => $to]],
            'subject' => $subject,
            'html' => $html,
            'attachments' => [
                [
                    'name' => basename($filePath),
                    'contentBase64' => $base64Content
                ]
            ]
        ]);
    }
}

// Usage
$client = new EmailGatewayClient('egw_live_your_key_here');

$result = $client->send([
    'to' => [
        ['email' => 'user@example.com', 'name' => 'User Name']
    ],
    'subject' => 'Hello from PHP',
    'html' => '<h1>Hello!</h1><p>This is a test email.</p>',
    'tags' => ['test', 'php']
]);

echo "Email sent: " . $result['messageId'] . "\n";

// Send with attachment
$result = $client->sendWithAttachment(
    'customer@example.com',
    'Your Invoice',
    '<p>Invoice attached.</p>',
    './invoice.pdf'
);
```

## Ruby

```ruby
require 'net/http'
require 'json'
require 'base64'

class EmailGatewayClient
  def initialize(api_key, base_url = 'http://localhost:3000/v1')
    @api_key = api_key
    @base_url = base_url
  end

  def send_email(data)
    uri = URI("#{@base_url}/send")

    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Post.new(uri.path)
    request['Authorization'] = "Bearer #{@api_key}"
    request['Content-Type'] = 'application/json'
    request.body = data.to_json

    response = http.request(request)

    unless response.code == '201'
      raise "Email send failed: #{response.body}"
    end

    JSON.parse(response.body)
  end

  def send_with_attachment(to, subject, html, file_path)
    file_content = File.read(file_path)
    base64_content = Base64.strict_encode64(file_content)

    send_email(
      to: [{ email: to }],
      subject: subject,
      html: html,
      attachments: [
        {
          name: File.basename(file_path),
          contentBase64: base64_content
        }
      ]
    )
  end
end

# Usage
client = EmailGatewayClient.new('egw_live_your_key_here')

result = client.send_email(
  to: [
    { email: 'user@example.com', name: 'User Name' }
  ],
  subject: 'Hello from Ruby',
  html: '<h1>Hello!</h1><p>This is a test email.</p>',
  tags: ['test', 'ruby']
)

puts "Email sent: #{result['messageId']}"

# Send with attachment
result = client.send_with_attachment(
  'customer@example.com',
  'Your Invoice',
  '<p>Invoice attached.</p>',
  './invoice.pdf'
)
```

## Error Handling

### JavaScript

```javascript
async function sendEmailWithErrorHandling() {
  try {
    const response = await fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: [{ email: 'user@example.com' }],
        subject: 'Test',
        html: '<p>Test</p>'
      })
    })

    if (!response.ok) {
      const error = await response.json()

      switch (response.status) {
        case 400:
          console.error('Validation error:', error.message)
          break
        case 401:
          console.error('Invalid API key')
          break
        case 502:
          console.error('Brevo API error:', error.message)
          break
        default:
          console.error('Unknown error:', error)
      }

      throw new Error(error.message)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}
```

### Python

```python
def send_email_with_error_handling():
    try:
        response = requests.post(
            f'{API_URL}/send',
            headers={
                'Authorization': f'Bearer {API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'to': [{'email': 'user@example.com'}],
                'subject': 'Test',
                'html': '<p>Test</p>'
            }
        )

        response.raise_for_status()
        return response.json()

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 400:
            print('Validation error:', e.response.json()['message'])
        elif e.response.status_code == 401:
            print('Invalid API key')
        elif e.response.status_code == 502:
            print('Brevo API error:', e.response.json()['message'])
        raise

    except requests.exceptions.RequestException as e:
        print('Network error:', str(e))
        raise
```
