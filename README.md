# Embedded Chat Interface

Embeddable chat web component built with Vue 3 + TypeScript.

## Usage

```html
<script src="https://cdn.jsdelivr.net/npm/n8n-embedded-chat-interface@latest/output/index.js"></script>

<embedded-chat-interface
  label="Support Chat"
  hostname="https://your-webhook-url.com"
  open-on-start="false">
</embedded-chat-interface>
```

Backward-compatible tag is also supported:

```html
<n8n-embedded-chat-interface
  label="Support Chat"
  hostname="https://your-webhook-url.com"
  open-on-start="false">
</n8n-embedded-chat-interface>
```

## Webhook Contract

Request:

```json
{
  "chatInput": "Hello",
  "sessionId": "optional"
}
```

Response:

```json
{
  "output": "Chatbot response",
  "sessionId": "session-id"
}
```

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Attributes

- `label`: chat title
- `description`: optional description
- `hostname`: webhook URL (required)
- `mode`: currently `n8n`
- `open-on-start`: `true` or `false`
- `initial-message`: optional first assistant message

## Custom Colors

Optional color attributes:

- `primary-color`
- `secondary-color`
- `background-color`
- `text-color`
- `accent-color`
- `surface-color`
- `border-color`
- `success-color`
- `warning-color`
- `error-color`
