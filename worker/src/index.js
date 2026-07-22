import { runTurn } from "./anthropic.js";
import { saveTranscriptTurn } from "./transcripts.js";
export { IpUsageLimiter } from "./usage-limiter.js";

const JSON_HEADERS = { "content-type": "application/json" };

function isAllowedOrigin(origin, env) {
  if (!origin) return false;

  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.includes(origin)) return true;
  // Cloudflare Pages preview deployments get a new *.pages.dev URL per branch/PR --
  // allow those without having to hardcode every preview URL into ALLOWED_ORIGINS.
  try {
    return /\.pages\.dev$/.test(new URL(origin).hostname);
  } catch {
    return false;
  }
}

function corsHeaders(origin, env) {
  if (!isAllowedOrigin(origin, env)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

// Bounds cost/abuse per request -- not a substitute for the dashboard rate-limiting
// rule (see plan), just a cheap guardrail against a single pathological request.
function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 50) return false;

  let totalCharacters = 0;
  let userTurns = 0;
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return false;
    if (typeof m.content !== "string" || !m.content.trim() || m.content.length > 4000) return false;
    totalCharacters += m.content.length;
    if (m.role === "user") userTurns += 1;
  }

  // Caps history cost even when each individual message is valid.
  return totalCharacters <= 24000 && userTurns >= 1 && userTurns <= 25;
}

function utcDay(timestamp = Date.now()) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getClientIp(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

function validateSubmitPayload(body) {
  if (!body || typeof body !== "object") return false;
  if (typeof body.name !== "string" || !body.name.trim()) return false;
  if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return false;
  if (typeof body.challenge !== "string" || !body.challenge.trim()) return false;
  return true;
}

async function handleChat(request, env, cors) {
  const ipHash = await sha256(getClientIp(request));
  const minuteLimit = await env.IP_MINUTE_LIMITER.limit({ key: ipHash });
  if (!minuteLimit.success) {
    return json(
      { error: "rate_limit_exceeded", message: "You are sending messages too quickly. Please wait a minute." },
      429,
      { ...cors, "Retry-After": "60", "Cache-Control": "no-store" },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, cors);
  }
  if (!validateMessages(body?.messages)) {
    return json({ error: "Invalid messages" }, 400, cors);
  }

  const userTurns = body.messages.filter((message) => message.role === "user").length;
  const now = Date.now();
  const day = utcDay(now);
  const limiter = env.IP_USAGE.getByName(ipHash);

  let usageResult;
  if (body.conversationId == null) {
    // A new conversation must begin with a single user message. Otherwise a
    // client could omit conversationId to reset its per-conversation counter.
    if (body.messages.length !== 1 || userTurns !== 1) {
      return json(
        { error: "conversation_id_required", message: "Please start a new conversation and keep its conversation ID." },
        400,
        cors,
      );
    }
    const conversationId = crypto.randomUUID();
    usageResult = await limiter.startConversation({ day, conversationId, now });
  } else {
    if (typeof body.conversationId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.conversationId)) {
      return json({ error: "Invalid conversation ID" }, 400, cors);
    }
    usageResult = await limiter.recordTurn({
      day,
      conversationId: body.conversationId,
      now,
      presentedUserTurns: userTurns,
    });
  }

  if (!usageResult.allowed) {
    return json(
      { error: usageResult.code, message: usageResult.message },
      429,
      { ...cors, "Cache-Control": "no-store" },
    );
  }

  try {
    const result = await runTurn(env, body.messages);

    // Transcript storage is deliberately non-blocking for the visitor: a D1
    // outage should be visible in logs, but must never take down the chat.
    try {
      await saveTranscriptTurn(env.CHAT_TRANSCRIPTS, {
        conversationId: usageResult.conversationId,
        turnNumber: usageResult.userTurns,
        userMessage: body.messages.at(-1).content,
        assistantMessage: result.reply,
        formFill: result.formFill,
        createdAt: new Date(now).toISOString(),
      });
    } catch (transcriptError) {
      console.error("transcript storage error", transcriptError);
    }

    return json(
      {
        ...result,
        conversationId: usageResult.conversationId,
        usage: {
          userTurns: usageResult.userTurns,
          turnsRemaining: usageResult.turnsRemaining,
        },
      },
      200,
      { ...cors, "Cache-Control": "no-store" },
    );
  } catch (err) {
    console.error("chat error", err);
    return json({ error: "Something went wrong" }, 500, cors);
  }
}

async function handleSubmit(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400, cors);
  }
  if (!validateSubmitPayload(body)) {
    return json({ ok: false, error: "Missing required fields" }, 400, cors);
  }

  const payload = {
    name: body.name.trim(),
    email: body.email.trim(),
    company: (body.company || "").trim(),
    position: (body.position || "").trim(),
    challenge: body.challenge.trim(),
    submitted_at: new Date().toISOString(),
    source: "challenge-us-page",
  };

  if (env.LEAD_WEBHOOK_URL) {
    try {
      const res = await fetch(env.LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) console.error("webhook responded non-2xx:", res.status);
    } catch (err) {
      // Don't leave the visitor stuck over a delivery failure on our end --
      // log it, still confirm receipt. The real listener/retry story is a
      // later phase.
      console.error("webhook fetch failed:", err);
    }
  } else {
    // No-op default until the client's real listener exists.
    console.log("[no-op] would have posted lead:", payload);
  }

  return json({ ok: true }, 200, cors);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method === "POST" && url.pathname === "/chat") {
      return handleChat(request, env, cors);
    }

    if (request.method === "POST" && url.pathname === "/submit") {
      return handleSubmit(request, env, cors);
    }

    return json({ error: "Not found" }, 404, cors);
  },
};
