# Chat usage limits

Implemented limits:

- 10 `/chat` requests per minute per IP (Cloudflare Rate Limiting binding)
- 5 new conversations per UTC day per IP
- 75 user turns per UTC day per IP
- 25 user turns per conversation
- 60-minute conversation lifetime
- 24,000 maximum characters in submitted conversation history
- 600 maximum Anthropic output tokens per model call

## Frontend protocol change

The first `/chat` request starts a conversation and must contain exactly one user message:

```json
{
  "messages": [{ "role": "user", "content": "..." }]
}
```

The response now includes:

```json
{
  "reply": "...",
  "formFill": null,
  "conversationId": "...",
  "usage": { "userTurns": 1, "turnsRemaining": 24 }
}
```

Store `conversationId` in the page's chat state. Send it with every later request:

```json
{
  "conversationId": "the-id-from-the-first-response",
  "messages": ["the existing message history"]
}
```

Starting a new session means clearing the local message history and omitting
`conversationId` on the next request.

## Deploy

```bash
npm install
npx wrangler dev
npx wrangler deploy
```

The rate-limit binding requires Wrangler 4.36.0 or newer. This project's lock
file currently resolves Wrangler 4.112.0.

## Notes

IP-based quotas can affect multiple legitimate visitors sharing an office,
mobile carrier, VPN, or household IP. If authentication is added later, use a
verified user/account ID as the primary quota key and retain IP limiting only as
a secondary abuse control.
