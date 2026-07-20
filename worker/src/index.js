import { runTurn } from "./anthropic.js";

const JSON_HEADERS = { "content-type": "application/json" };

function isAllowedOrigin(origin, env) {
  if (!origin) return false;

  // ============================================================
  // TEMPORARY — INTERNAL TEAM TESTING ONLY. REMOVE BEFORE LAUNCH.
  // ============================================================
  // Browsers send Origin: "null" for pages opened directly as a local file
  // (file://...), which lets the team open challenge-us.html by double-click
  // and still have it talk to this Worker, no local server needed. Real site
  // visitors never send Origin: null (only local file:// pages do), so this
  // doesn't weaken anything for them -- but while this is in place, ANY local
  // file on ANY machine can also call this Worker and read the response, not
  // just this one. Delete this block (and this comment) before the site goes
  // to production / real publication.
  if (origin === "null") return true;
  // ============================================================

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
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 40) return false;
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return false;
    if (typeof m.content !== "string" || !m.content.trim() || m.content.length > 4000) return false;
  }
  return true;
}

function validateSubmitPayload(body) {
  if (!body || typeof body !== "object") return false;
  if (typeof body.name !== "string" || !body.name.trim()) return false;
  if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return false;
  if (typeof body.challenge !== "string" || !body.challenge.trim()) return false;
  return true;
}

async function handleChat(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, cors);
  }
  if (!validateMessages(body?.messages)) {
    return json({ error: "Invalid messages" }, 400, cors);
  }
  try {
    const result = await runTurn(env, body.messages);
    return json(result, 200, cors);
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
