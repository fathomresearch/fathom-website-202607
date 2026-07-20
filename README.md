# Fathom Website — Project Notes

Working notes for this repo: what's been built, the reasoning behind key decisions, and what's
still open before anything here goes live to real visitors. Two active threads live here right
now — a site redesign exploration, and a working AI chat agent prototype.

---

## 1. Site redesign (`references/`)

All pages are self-contained static HTML — inline `<style>`/`<script>`, no build step, no
bundler. This is the established pattern for the whole repo, including the chat widget below.

### Starting point: auditing what already existed

Before any redesign work, went through every file in `references/` to establish what design
system was already in place, since the goal was "rebuild in a better way," not "start over."
Found two genuinely different design languages coexisting in the folder:

- **The core site family** — `index (1).html`, `about.html`, `work.html`, `what-we-do.html`,
  `insights.html`, `challenge-us.html`, and the `case-*.html` case study pages. One coherent,
  polished system:
  - **Colors:** navy `#0A1628` (primary dark ground — nav, hero, footer, alternating
    sections), teal `#00D6B3` / hover `#009E85` (the single brand accent — labels, CTAs,
    underlines), warm off-white `#F8F7F4` (secondary background band), body text `#2C3E50`,
    muted `#6B7280`, hairline borders `#ECEAE6`. One outlier: a coral accent (`#FF4369`) used
    exactly once, on an Insights page tag.
  - **Type:** IBM Plex Sans for all UI/body text (weights 300–700), Spectral (serif) for every
    headline — always light-weight, with italic spans in a lighter tone for emphasis, the same
    device repeated on literally every page.
  - **Structure:** sticky navy nav with an inline SVG logo; teal "eyebrow" labels (dash +
    tracked uppercase text) opening every section; duotone-teal case-study cards with
    lift-on-hover; metrics rows with a teal top border; alternating navy/white/warm background
    bands; scroll-triggered fade-up reveals via `IntersectionObserver`; a consistent footer
    closing on the tagline "Clarity Beneath the Surface." Case study pages use a distinct
    "editorial magazine" template — full-bleed duotone cover photo, a meta slab, a 3-up "at a
    glance" summary, dropcap chapters, centered closing CTA.
- **`fathom-mockup-3.html`** — an explicitly separate, more experimental concept the user
  flagged as not part of the main family: a dark teal/navy radial-gradient background, Space
  Mono (terminal/glitch labels) + Georgia serif headlines, a full-viewport canvas of animated
  "noise" words that glitch and clear around the cursor, a custom cursor dot, single-page
  JS-routed case studies. Distinctive and bold, but not brand-consistent with the rest.

### The brief, as it evolved through conversation

The user's direction, gathered over several exchanges rather than stated all at once:
1. Use the **core site family** as the foundation, not mockup-3 — the color and type system
   were already right, the site just "isn't visually aesthetic yet."
2. New sections would be added later based on a "refined user journey" (not yet specified).
3. The real ask: **mockup-3's noise/glitch concept becomes the new landing page**, and the
   *current* landing page (hero → proposition → work → how-we-work → who-we-work-with → CTA)
   becomes a subpage — but restyled to match the core system, not kept in its original
   Space Mono/Georgia/dark-teal palette.

### The design concept

Rather than importing mockup-3's palette wholesale, the concept was grounded in assets Fathom
already owns: the name "Fathom" itself (a unit for sounding ocean depth) and the existing
footer tagline "Clarity Beneath the Surface." Mockup-3's core mechanic — chaotic scattered
words that clear as the cursor moves through them — maps directly onto "noise clearing to
reveal signal beneath the surface," so that mechanic was kept, but restyled entirely in the
core system's navy/teal palette, with IBM Plex Sans/Spectral for real content and IBM Plex
Mono (a sibling of the body face, not a new imported identity) used only for the noise-particle
texture itself, since that's literally rendering unstructured "data noise." This became
`references/landing-concept.html` — see the timeline below for how it evolved through review.

### `landing-concept.html` iteration history

- Removed the sonar-ring / cursor-repulsion "ripple" effect per feedback that it didn't fit;
  later brought back cursor-repulsion physics matching mockup-3's actual constants when asked
  to try it, then removed it again per a follow-up "don't like it."
- Rebuilt the scroll behavior after mockup-3's real pattern: a `position:fixed` noise canvas
  behind everything, fading out on a smoothed/lerped scroll-driven curve as the hero is
  scrolled past, instead of a hard cut.
- Matched noise density/opacity/glitch pacing to mockup-3's actual constants (found ours was
  running at roughly half the density), then later reduced ~25% further per request; added the
  ambient scanline sweep mockup-3 also used.
- Added a dedicated `#signal` section between the hero and the first real content section:
  noise persists, then dissolves, then a line fades in — independently timed (not a single
  crossfade) and scroll-scrubbed via a sticky-positioned line, tuned over several rounds for
  pacing, hold time, and overall section length.
- Tried a permanent "clearing zone" around the headline for legibility against the noise
  background (tracked via the element's bounding box); rejected as feeling too clean/empty,
  replaced with a text-shadow only.
- Removed the eyebrow line and one of two buttons per feedback ("clean" hero); later brought
  back a single button + a new sub-line ("We're fast, we're focused, and we cut through the
  noise to tell you what to do with it.") explicitly naming "noise" to tie back to the visual.
- Fixed a vertical centering offset (asymmetric hero padding held over from when the eyebrow
  existed).
- Fixed a text-reflow flash on load/scroll caused by animating `letter-spacing` in the resolve
  keyframes (widening letter-spacing changes real text width, which re-wraps mid-animation);
  first fix removed the letter-spacing animation, then restored it per request and instead
  forced each line to `white-space:nowrap` (gated to `min-width:821px` so mobile still wraps
  normally) so the animation can't change line count.
- Replaced the single blurred-block resolve animation with a per-word staggered
  blur/opacity/settle reveal for a more "coalescing out of noise" feel, matching the concept.
- Added a hardcoded 3-line mobile headline break ("Research should tell you" / "what to do" /
  "— not just what happened.") as a separate markup set from the desktop 2-line version, plus
  a slightly smaller mobile font-size floor so the longest line fits narrow phones (iPhone SE).

### Not yet done

This hasn't been wired into the rest of the site's navigation/IA yet (what exactly the "old
landing page as subpage" becomes, URL-wise, is still open), and the rest of `references/`
hasn't been visually reworked to match — that's a separate, larger pass whenever it's picked
back up.

---

## 2. AI chat agent (Challenge Us page)

A chat widget on `references/challenge-us.html` that talks to a visitor, gathers the same five
fields as the page's existing form (name, email, company, position, challenge), fills the real
form fields for the visitor to review, and lets them submit it themselves — the agent never
submits on its own.

### Architecture

- **`worker/`** — a Cloudflare Worker, plain JS, no bundler:
  - `src/index.js` — routing (`/chat`, `/submit`), CORS, request validation
  - `src/anthropic.js` — `runTurn()`, a bounded tool-use round-trip loop against the Claude API
  - `src/system-prompt.js`, `src/tools.js` — isolated persona and tool schema (the seam for
    extending this into a longer, general-purpose chat later without replumbing anything)
  - `wrangler.toml` / `package.json` — Worker config and deps
- **`references/challenge-us.html`** — the widget itself: a bottom-right FAB that expands into
  a chat panel, styled entirely from the page's existing design tokens. Sends the full message
  history to `/chat` each turn (stateless), writes any captured fields into the real
  `#name`/`#email`/`#company`/`#position`/`#challenge` inputs with a highlight pulse, and shows
  an animated "thinking" bubble that gets overwritten in place once the real reply lands. The
  page's form itself was rewired from a non-functional `mailto:` placeholder to actually
  `POST` to `/submit`.

### Key decisions from our discussion

- **Model:** `claude-sonnet-5` by default (proportionate to a low-complexity chat + extraction
  task); `claude-opus-4-8` is a one-line swap in `anthropic.js` if quality ever needs it.
- **`/submit` is a separate endpoint from `/chat`, on purpose** — this is what guarantees the
  agent itself can never trigger a submission; only the visitor clicking the real button does.
- **Submission goes browser → Worker → webhook, not browser → webhook directly.** Keeps the
  real webhook URL server-side-only (never shipped to the browser/visible in page source),
  gives one place to validate/sanitize before anything reaches the database, and one place to
  rate-limit. The real "listener that stores this in our database" doesn't exist yet — the
  Worker just POSTs to `LEAD_WEBHOOK_URL` if it's set, and no-ops (logs only) if it isn't.
- **CORS `null`-origin exception is TEMPORARY, for internal team testing only.** Lets anyone
  on the team open `challenge-us.html` by double-clicking it (no local server needed) and still
  have it talk to the deployed Worker. Clearly marked in `worker/src/index.js` — search for
  `TEMPORARY — INTERNAL TEAM TESTING ONLY` — **must be deleted before public launch** (see
  checklist below).
- **Custom domain (`chat-api.fathomresearch.ai`) is blocked, not broken.** Cloudflare's Custom
  Domain feature for Workers requires the zone to live on Cloudflare — `fathomresearch.ai` is
  currently on GoDaddy, so there's nothing to attach the route to. The Worker runs fine on its
  `workers.dev` URL in the meantime (functionally identical, just an ad-blocker-resilience and
  branding tradeoff — see chat history for the full pros/cons).
- **Dashboard rate limiting is blocked for the same reason** (WAF rate-limiting rules are a
  zone-level Cloudflare feature). Acceptable for now since the Worker's URL isn't linked
  anywhere public yet; the in-Worker request-shape guardrails (message count/length caps in
  `index.js`) are the only abuse bound currently in place.
- **Worker was renamed** from `fathom-challenge-chat` to `fathom-website-chat-agent` — the old
  Worker (and its copy of the secret) was fully deleted, not left orphaned.

### Current deployed state

- **Worker:** `fathom-website-chat-agent`, live at
  `https://fathom-website-chat-agent.polished-resonance-6f57.workers.dev`
- **Secrets set:** `ANTHROPIC_API_KEY` ✅. `LEAD_WEBHOOK_URL` ❌ (unset — no-op/log path active)
- **`CHAT_API_BASE`** in `challenge-us.html` points at the `workers.dev` URL above for
  anything not on `localhost`/`127.0.0.1`.
- **Cloudflare account:** "Admin@fathomresearch.ai's Account" (logged in via a personal
  account with full workspace access).

### Local dev setup

```bash
# Terminal 1 — local Worker
cd worker && npx wrangler dev --port 8787

# Terminal 2 — static site
cd references && python3 -m http.server 8000
```
Open `http://localhost:8000/challenge-us.html` (not the file directly, unless relying on the
temporary null-origin exception above). `worker/.dev.vars` already has the API key and a local
CORS override (`ALLOWED_ORIGINS=http://localhost:8000,...`) — nothing to re-enter. First
request after starting `wrangler dev` takes ~20s (cold start); fast after that.

---

## 3. Before publishing to the real live site

- [ ] **Delete the temporary CORS `null`-origin exception** in `worker/src/index.js` (marked
      `TEMPORARY — INTERNAL TEAM TESTING ONLY — REMOVE BEFORE LAUNCH`), then redeploy.
- [ ] **Point `LEAD_WEBHOOK_URL` at the real listener** once it exists (`wrangler secret put
      LEAD_WEBHOOK_URL`), and confirm the payload shape (`name`, `email`, `company`,
      `position`, `challenge`, `submitted_at`, `source`) matches what that listener expects.
- [ ] **Decide on a custom domain vs. staying on `workers.dev` long-term.** If moving
      `fathomresearch.ai`'s DNS to Cloudflare, that's a bigger decision than just this widget
      (affects the whole domain, email included) — worth deciding deliberately, not as a side
      effect of this feature.
- [ ] **Set up real rate limiting / abuse protection.** Either the Cloudflare dashboard WAF
      rule (needs the custom domain above first) or a lightweight in-Worker per-IP limiter if
      staying on `workers.dev`.
- [ ] **Update `CHAT_API_BASE`** in `challenge-us.html` to whatever the final production URL
      ends up being (custom domain or `workers.dev`).
- [ ] **Confirm `ALLOWED_ORIGINS`** in `worker/wrangler.toml` matches wherever the static site
      actually ends up deployed (currently assumes `fathomresearch.ai`/`www.fathomresearch.ai`
      — Cloudflare Pages was the assumed host, not yet actually set up).
- [ ] **Decide whether the widget should stay Challenge-Us-only** or extend to other pages —
      currently scoped to that one page on purpose.
- [ ] **General QA pass**: multi-turn conversations that reveal fields gradually, confirm no
      fabricated field values, confirm manual edits after auto-fill aren't stomped, confirm
      graceful behavior if the Worker is unreachable, confirm required-field validation blocks
      empty submissions.
- [ ] Fold `references/challenge-us.html` (and the rest of `references/`) into whatever the
      real deployed site structure ends up being — right now everything is still living under
      `references/` as a working/prototype location, not the final site paths.
