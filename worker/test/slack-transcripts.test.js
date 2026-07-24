import test from "node:test";
import assert from "node:assert/strict";
import { formatConversationForSlack } from "../src/slack-transcripts.js";

const baseMessage = {
  id: 1,
  conversation_id: "12345678-1234-1234-1234-123456789abc",
  turn_number: 1,
  role: "user",
  content: "We need help understanding our customers.",
  created_at: "2026-07-23T14:00:00.000Z",
};

test("formats user and assistant messages with a conversation heading", () => {
  const chunks = formatConversationForSlack([
    baseMessage,
    {
      ...baseMessage,
      id: 2,
      role: "assistant",
      content: "Let’s unpack the decision behind that request.",
    },
  ]);

  assert.equal(chunks.length, 1);
  assert.match(chunks[0], /Fathom agent conversation/);
  assert.match(chunks[0], /\*User:\*/);
  assert.match(chunks[0], /\*Fathom:\*/);
  assert.match(chunks[0], /12345678/);
});

test("escapes Slack control characters in transcript content", () => {
  const [text] = formatConversationForSlack([
    { ...baseMessage, content: "Revenue < cost & risk > reward" },
  ]);

  assert.match(text, /Revenue &lt; cost &amp; risk &gt; reward/);
});

test("splits long conversations without exceeding the configured limit", () => {
  const chunks = formatConversationForSlack([
    { ...baseMessage, content: "Long response ".repeat(500) },
  ], 1000);

  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 1000));
  assert.match(chunks[0], /Part 1/);
});
