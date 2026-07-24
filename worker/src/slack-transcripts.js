const MAX_PENDING_MESSAGES = 500;
const MAX_SLACK_TEXT_LENGTH = 3500;
const UPDATE_BATCH_SIZE = 80;

function escapeSlackText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function conversationHeading(conversationId, createdAt, part, totalParts) {
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));
  const partLabel = totalParts > 1 ? ` · Part ${part}/${totalParts}` : "";
  return `*Fathom agent conversation${partLabel}*\n_${date} CT · ${conversationId.slice(0, 8)}_`;
}

function messageText(message) {
  const speaker = message.role === "user" ? "User" : "Fathom";
  return `*${speaker}:*\n${escapeSlackText(message.content)}`;
}

function splitLongText(text, maxLength) {
  const chunks = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf("\n", maxLength);
    if (splitAt < Math.floor(maxLength * 0.6)) {
      splitAt = remaining.lastIndexOf(" ", maxLength);
    }
    if (splitAt < Math.floor(maxLength * 0.6)) splitAt = maxLength;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

export function formatConversationForSlack(messages, maxLength = MAX_SLACK_TEXT_LENGTH) {
  if (!messages.length) return [];

  const bodyParts = messages.flatMap((message) =>
    splitLongText(messageText(message), maxLength - 200),
  );
  const bodies = [];
  let current = "";

  for (const part of bodyParts) {
    const candidate = current ? `${current}\n\n${part}` : part;
    if (candidate.length > maxLength - 120 && current) {
      bodies.push(current);
      current = part;
    } else {
      current = candidate;
    }
  }
  if (current) bodies.push(current);

  return bodies.map((body, index) => {
    const heading = conversationHeading(
      messages[0].conversation_id,
      messages[0].created_at,
      index + 1,
      bodies.length,
    );
    return `${heading}\n\n${body}`.slice(0, maxLength);
  });
}

function groupByConversation(messages) {
  const groups = new Map();
  for (const message of messages) {
    if (!groups.has(message.conversation_id)) {
      groups.set(message.conversation_id, []);
    }
    groups.get(message.conversation_id).push(message);
  }
  return [...groups.values()];
}

async function postToSlack(webhookUrl, text) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 200);
    throw new Error(`Slack webhook returned ${response.status}: ${detail}`);
  }
}

async function markDelivered(db, messageIds, deliveredAt) {
  for (let offset = 0; offset < messageIds.length; offset += UPDATE_BATCH_SIZE) {
    const ids = messageIds.slice(offset, offset + UPDATE_BATCH_SIZE);
    const placeholders = ids.map((_, index) => `?${index + 2}`).join(", ");
    await db.prepare(`
      UPDATE messages
      SET slack_delivered_at = ?1
      WHERE slack_delivered_at IS NULL
        AND id IN (${placeholders})
    `).bind(deliveredAt, ...ids).run();
  }
}

export async function deliverPendingTranscripts(env) {
  if (!env.SLACK_TRANSCRIPT_WEBHOOK_URL) {
    console.log("Slack transcript delivery skipped: webhook secret is not configured");
    return { skipped: true, conversations: 0, messages: 0 };
  }

  const pending = await env.CHAT_TRANSCRIPTS.prepare(`
    SELECT id, conversation_id, turn_number, role, content, created_at
    FROM messages
    WHERE slack_delivered_at IS NULL
    ORDER BY created_at ASC, id ASC
    LIMIT ?1
  `).bind(MAX_PENDING_MESSAGES).all();

  const messages = pending.results || [];
  if (!messages.length) {
    console.log("Slack transcript delivery: no pending messages");
    return { skipped: false, conversations: 0, messages: 0 };
  }

  let deliveredConversations = 0;
  let deliveredMessages = 0;

  for (const conversation of groupByConversation(messages)) {
    const chunks = formatConversationForSlack(conversation);
    for (const text of chunks) {
      await postToSlack(env.SLACK_TRANSCRIPT_WEBHOOK_URL, text);
    }

    const deliveredAt = new Date().toISOString();
    await markDelivered(
      env.CHAT_TRANSCRIPTS,
      conversation.map((message) => message.id),
      deliveredAt,
    );
    deliveredConversations += 1;
    deliveredMessages += conversation.length;
  }

  console.log("Slack transcript delivery complete", {
    conversations: deliveredConversations,
    messages: deliveredMessages,
  });
  return {
    skipped: false,
    conversations: deliveredConversations,
    messages: deliveredMessages,
  };
}
