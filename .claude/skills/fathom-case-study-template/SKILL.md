---
name: fathom-case-study-template
description: >-
  Build or revise a Fathom Research & Strategy case-study page template — a self-contained
  static HTML/CSS page in Fathom's house style, anchored on ONE at-a-glance visualization
  matched to a research method, carrying a shareable process ("how we built it") layer with
  no redaction. Use when asked to create, extend, or fix a case-study template
  (references/case-study-template-N.html) or a Fathom case page. Do NOT use for the live
  marketing pages, the chat widget / Cloudflare worker, or any non-Fathom project.
---

# Fathom Case-Study Template Builder

Build a new case-study template (or revise an existing one) as a **single self-contained
`.html` file**: inline `<style>` and `<script>`, no framework, no build step, no npm, **no
chart library**. Every template shares one visual family and differs only in its **signature
visualization** and its **process layer**.

The deliverable is a reusable, tokenized page a non-technical teammate can fill in by editing
`{{TOKENS}}` and inline data values without touching CSS.

---

## 1. When to use / when NOT to use

**Use when** the request is any of:
- "Make a new case-study template" / "template N" / "a template for a <research-method> case."
- "Fix / redesign / revise the signature (or process layer, or outcome) of template N."
- "Turn this research method into a case page in our style."

**Do NOT use for:**
- The live marketing site pages (home, about, work, what-we-do, insights, challenge-us).
- The AI chat widget, the Cloudflare worker, webhooks, or deployment.
- Any project that is not Fathom Research & Strategy.
- Requests for a redaction/blackout aesthetic (explicitly rejected — see Rules).

---

## 2. Inputs

**Required (ask only if you cannot infer a sensible default):**
- **Research method** the case is about (e.g. segmentation, customer journey, funnel/drop-off,
  key-driver, conjoint/pricing, MaxDiff message testing, tracking/longitudinal, social
  listening, jobs-to-be-done, tension/paradox, brand audit, anomaly/outlier, cohort/retention).
  This drives the signature.
- **The one finding** the case turns on (the "aha"), stated as a claim.
- **Template number / file name** (default `references/case-study-template-N.html`, next free N).

**Optional:**
- Real illustrative data (segment sizes, %s, verbatims, benchmark grades, prices, dates).
  If absent, invent **plausible, internally-consistent placeholder data** and leave `{{TOKENS}}`
  for the client-specific copy.
- A preferred signature form. **Treat as a suggestion, not a mandate** — override it if it
  misrepresents the method (see Step 3, override rule).
- Sector / client framing for the cover copy.

**When information is missing or ambiguous:**
- Method unclear → infer from the finding's shape (a comparison of options → MaxDiff/driver;
  a change over time → tracking; two opposed desires → tension; a step where people are lost →
  funnel). State the assumption in one line and proceed.
- Data absent → **mode-dependent (see §2A). TEMPLATE mode invents self-consistent placeholders
  and leaves `{{TOKENS}}`. REAL-CASE mode NEVER fabricates a client's numbers, quotes, or
  outcomes — ask for the figure, or leave a clearly-marked gap and list it in the delivery
  report.**
- Only ask the user when the *method itself* is genuinely undetermined and the finding doesn't
  disambiguate it (either mode), or whenever a real figure/quote/permission is missing
  (real-case mode).

## 2A. Mode — real case vs template (decide this first)

The same page structure serves two modes. **Confirm which you are in before writing anything.**

- **REAL-CASE mode (default when the user supplies actual research):** you are turning a real
  engagement into a finished, structured page. Copy is finished (minimal or no `{{TOKENS}}`);
  every stat, quote, and outcome is the client's real material; the signature encodes the real
  data. **Fabrication is prohibited** — see §5A/§5B. Read all provided source files first.
- **TEMPLATE mode (only when explicitly asked for a reusable/blank template):** you are building
  a tokenized shell with plausible placeholder data and a `TOKEN KEY`, to be filled later.

If the user provides source material (a report, deck, findings doc, quotes, stats), you are in
**real-case mode** even if they say "template."

---

## 3. The core principle (do this before anything else)

**One signature per template, and the signature MUST be an at-a-glance visualization — a chart,
diagram, map, or set of cards — that communicates the concept in ~2 seconds without reading.**
Text supports the picture; it never carries it. A signature you have to *read* (a table, a
ranked text list, a rate-card of numbers) has failed, however well written.

Reference bar (approved exemplars): a 2-axis positioning **map**, two overlapping **circles**
for a paradox, a benchmark **heatmap**, a **funnel**, an emotion **curve**, a **forces**
diagram, a diverging **value/tornado chart**.

### Pick the signature from the method's native artifact
| Method | Native signature |
|---|---|
| Segmentation | radar "fingerprint" cards, one per segment |
| Customer journey / CX | emotion curve across stages, moment-of-truth flagged |
| Funnel / drop-off | funnel with the biggest drop lit |
| Key-driver | slopegraph (stated→derived rank) |
| Conjoint / pricing | diverging value chart (worth in money, gains right / costs left) |
| MaxDiff / message testing | sorted best-minus-worst diverging bars |
| Tracking / longitudinal | time **horizon** with markers (NOT a plain trend line) |
| Social listening | quote **wall** — cards sized by volume, tinted by sentiment |
| Jobs-to-be-Done | four-**forces** diagram (push/pull vs habit/anxiety) |
| Tension / paradox | overlapping fields; the intersection is the finding |
| Brand audit / health | benchmark **heatmap** (diverging ramp, letter printed in cell) |
| Anomaly / outlier | one point lit in a 1-D field of points |
| Cohort / retention | survival/retention curves (or a cohort triangle) |

### Override rule (strict)
If the obvious/requested chart **misrepresents the method or is a generic default**, override it
and say why in one line. Proven cases:
- Tension → **not** a slider. A slider reifies the trade-off the research disproves; use an
  overlap (people want both ends).
- MaxDiff → **not** a knockout bracket. MaxDiff runs every item against every other; a bracket
  draws a method that never happened. Use judged/sorted bars.
- Tracking → **not** a plain trend line (it reads as a generic line chart and clashes with the
  journey curve). Use a dated horizon.
- Brand audit → **not** a report-card of letter grades in columns (reads as a table). Use a
  heatmap whose row-patterns carry the finding.

### Cross-template diversity (strict)
No two templates may read as the same layout. Keep a running inventory of geometries already
used in the library and avoid repeats. Watch specifically for **table fatigue, axis fatigue,
and bar reuse** (bars are legitimate for a funnel or time-spans; avoid a fourth bar chart).
When two templates would share a geometry, rework the weaker one.

### One device, once per page (strict)
The signature geometry appears **exactly once**. The cover must not pre-draw a ghost of it; the
outcome must not redraw it. If you catch the same shape twice on one page, remove the lesser use.

---

## 4. The shared base (identical across every template)

**Reliable procedure: copy an existing finished template (e.g.
`references/case-study-template-11.html`) and replace only the middle** (cover copy, the
signature section, the process section, the climax line, the outcome). This guarantees the base
is byte-identical across the family. Only hand-author the base if none exists.

The base contains, verbatim:
- **`:root` tokens** (brand — do not change):
  `--navy:#0A1628; --navy-deep:#050B14; --navy-mid:#122a44; --teal:#00D6B3; --teal-dim:#009E85;`
  `--warm:#F8F7F4; --paper:#FDFCFA; --ink:#121d2b; --body:#2C3E50; --muted:#6B7280;`
  `--line:#E7E2D9; --struck:#8b96a3; --bdr:rgba(255,255,255,.09);`
- **Three type roles:** `--serif:'Spectral'` (display), `--sans:'IBM Plex Sans'` (body/UI),
  `--mono:'IBM Plex Mono'` (data labels, eyebrows). Loaded via a Google Fonts `<link>`.
  `--struck` is reserved for the rejected/expected path and for "weak"; `--muted` for secondary
  text. **Text never wears the series colour** — values and labels stay ink/body/muted.
- **Devices:** `.section-mark` eyebrow, `.btn` / `.btn-ghost`, `.sa` scroll-reveal
  (`opacity/translateY`, `.d1/.d2/.d3/.d4` delays), a sticky **nav** and **footer** matching the
  live site, `@media(prefers-reduced-motion:reduce){.sa{...none}}`, `:focus-visible`.
- **Script:** one `IntersectionObserver` that adds `.in` to `.sa` elements at threshold ~0.14.
- Footer tagline **"Clarity Beneath the Surface"**; contact block. `[VERIFY against current live
  footer: contact email info@fathomresearch.ai, phone, LinkedIn URL, and whether nav/footer
  links point at bare filenames or a src/ path.]`

**Section rhythm (6 sections):**
`cover (navy + 4-cell dossier rail) → setup/tension (paper) → PROCESS LAYER → SIGNATURE →
climax line (navy-deep) → outcome (navy) → close/CTA (paper) → footer`.
Alternate grounds so **no two dark sections abut**; invest all distinctiveness in the signature.

---

## 5. The process layer ("How we built it")

Every template carries a shareable method section. Rules:
- **Process-forward, method not client findings.** Show *how Fathom works* (rigour, design,
  sampling), never confidential results. Illustrative sample sizes / markets are fine.
- **NEVER show redaction / blackout bars.** Reading as "hidden on your own page" was explicitly
  rejected. Show real illustrative values or genericise.
- **Its FORM must differ per template — do NOT copy-paste one four-step grid into every file.**
  Derive the form from the method (a filed pre-registration slip, a coverage matrix, a
  reconciliation brace, a recruitment spread, a rubric, a specimen strike-through, a switch-
  interview reconstruction, a "tension vs two tribes" diagnostic, etc.).
- **Storytelling, not procedure.** Lead with the *insight* (e.g. "a purchase is a moment; the
  decision took fourteen weeks"), make the method the supporting evidence beneath it. Where it
  helps, **foreshadow the signature** from the process section so process → signature → outcome
  reads as one spine.

---

## 5A. Writing the content (real-case mode)

**Intake — do this before writing.** Read every source the user provides in full (PDF via the
Read tool's `pages`, HTML, decks, notes). From them, extract and confirm back in one line each:
- **Client and sector**; the **research method**; the **one finding** (as a claim);
- the **evidence** (stats, verbatims, the artifact the finding rests on);
- the **outcome / impact** (what the work became or moved);
- **what is confidential vs shareable.**

**Confidentiality decision — make it before drafting (this is the team's stated concern):**
- **Lead with process/method** — it is freely shareable and is the product a prospect is buying.
- **Client-specific results:** show only what the user confirms is shareable. Otherwise
  **genericise** (index/normalise to relative values, drop identifying specifics) — **never
  redact or black anything out** (explicitly rejected; it reads as hidden on your own page).
- Illustrative **sample sizes, markets, and methods are fine** to show.
- If unsure whether a specific figure or quote may be published, **ask — do not guess.**

**Voice (Fathom house style):** editorial, confident, plain, **active voice**, process-forward
("we tell you what to do, not just what happened"). Concrete over clever; sentence case; no hype,
no filler. Each section carries one idea. Keep it tight — long copy crowds out the visual.

**Section jobs (what to write):**
- **Cover title** — the finding as a short, provocative claim (a serif line, ~≤15 words).
- **Cover deck / dossier** — one line of framing + the four filing facts (client, industry,
  engagement, output).
- **Setup (paper)** — the tension or the trap: the obvious-but-wrong path the case overturns.
- **Process layer** — how Fathom did it, insight-first (see §5); real method detail, no findings.
- **Signature caption + foot** — tell the reader how to *read the picture*, then the one-line
  takeaway. The picture does the work; the text confirms it.
- **Climax (navy-deep)** — the decision/reframe in a single serif line.
- **Outcome** — what it became or moved, in a varied register (§7).

**Fabrication rule (STRICT, real-case):** never invent a stat, quote, or outcome. Use the
client's real verbatims verbatim (light cleanup only), attributed generically. If a needed
element is missing, ask for it or leave a visible, labelled gap — never fill with plausible
fiction. (This is the exact inverse of template mode.)

## 5B. Developing the visual from real data (real-case mode)

1. **Pick the signature** via the §3 method→artifact map and the override rule — same as always.
2. **Encode the client's ACTUAL values** into the geometry (bar lengths, positions, colours,
   region sizes). The picture must be *true to the data*; a reader should be able to trust that
   the shape reflects the real result.
3. **Fit the visual to the data, not the data to the visual.** If the real case has six segments
   not four, or values that barely separate, adapt the signature (more cards, a different cut, a
   different device) rather than distorting numbers to fit an ideal chart.
4. **Data hygiene:** round sensibly and consistently; label units; keep one source of truth for
   each figure. If an exact value is sensitive, show the honest *shape* with indexed/relative
   axes rather than redacting.
5. **Reconcile (see §6):** recompute every derived value from the real inputs and assert it. For
   real data this is non-negotiable — a published number that doesn't reconcile is a credibility
   failure, and the audience is exactly the kind that checks.
6. **Missing values:** ask for the specific numbers the signature needs. If you must proceed
   provisionally, label the visual "illustrative — pending final figures" (never redacted) and
   flag it in the delivery report.

## 6. Numbers must be visual AND internally consistent (strict)

Whenever the signature encodes data:
- **Length/position/colour carries the value; the printed figure is only a label.** (Bars encode
  by length off a shared baseline; heatmap cells print the value so colour is reinforcement, not
  the only channel.)
- **Recompute every derived value from the printed inputs and fail on mismatch.** This caught a
  real bug (crossover years that didn't follow from the shares/rates beside them). Examples of
  invariants to assert: bar width % = value / maxAbs × scale; force magnitudes sum to the printed
  net; overlap regions sum to 100; a projected "year X overtakes" = derived from the printed
  rates; a marker's position % = its value mapped onto the axis span.
- Put the invariant in a short throwaway node check and run it (Step 8).

### dataviz rules (apply when charting)
- **Sequential** ramp = one hue light→dark (magnitude). **Diverging** = two hues + a neutral
  midpoint with a *meaningful* mid (e.g. "meets category standard"). Fathom's diverging pair is
  **teal (strong/positive) ↔ struck-grey (weak/negative)**, neutral `--line`/`--warm` at mid.
- **Status/sentiment colour is never alone** — pair every colour with a glyph (+ / − / ·) and a
  word in a key.
- **Validate contrast** on any text-on-fill (WCAG AA ≥ 4.5 for normal text; darken a fill rather
  than ship a failing cell). Compute it; don't eyeball.
- Rounded 4px data-ends; ~2px surface gap between adjacent fills; recessive grid/axes; **never a
  dual-axis chart**; a single series needs no legend.
- Charts are **static editorial visuals** (no hover/tooltip/table) unless asked.

---

## 7. The outcome section

- A shared **frame** is fine (navy ground, the mark, one mono label), but the **content and
  register must vary across the library** — never the same big teal number every time. (User
  correction: outcomes were "highly identical.")
- **The outcome refers to the signature in a DIFFERENT register — it never redraws the
  signature's geometry.** Approved registers: a plain-language before/now, an arithmetic
  sentence, one elevated instance of the signature (e.g. a single quote lifted from the wall), a
  decision (2→1 products; 0 features), a duration, a rank, a single figure with the one line only
  this case can say.
- **Short realistic value in any oversized display slot**, with the `{{TOKEN}}` in an inline
  comment — a long literal token at 100px+ overflows and breaks layout (bug hit in early
  templates).

---

## 8. Tokenize, then verify (no build step)

**Tokenize:** put a `TOKEN KEY` block in the top HTML comment listing every `{{TOKEN}}`; set
signature data values inline per element so a teammate swaps numbers without touching CSS.

**Verify — run all of these before delivering:**
1. `<section>`, `<div>`, `<span>`, `<svg>` open/close counts balance; `{`/`}` balance.
2. `node --check` on the extracted inline `<script>`.
3. `grep` for leftover long `{{TOKENS}}` sitting in oversized display slots.
4. `grep -i redact` returns nothing.
5. Chart-SVG count is what you intend (typographic signatures = 0 beyond the 2 logo SVGs).
6. The **arithmetic invariant** from Step 6 recomputes and matches every printed figure.
7. Responsive: wide content sits in an `overflow-x:auto` wrapper; the page body never scrolls
   sideways; the signature has a mobile fallback.
8. If a browser is available, screenshot the signature and eyeball geometry/labels/overflow.

---

## 9. Rules & constraints (quick reference)

**Strict (never violate):**
- Signature is an at-a-glance visualization, never a table or text list.
- No chart library; self-contained inline CSS/JS; no build step.
- Never show redaction/blackout.
- Process layer shows method, never confidential client findings; its form differs per template.
- One device once per page; outcome never redraws the signature.
- Brand tokens and the three type roles are fixed.
- Numbers are internally consistent (recompute + assert).
- Status/sentiment colour always paired with glyph + label; validate text contrast.

**Flexible (guidelines — adapt with judgement):**
- Exact clamp() sizes, paddings, and section copy.
- Which non-dark grounds (paper vs warm) a light section uses — just avoid two dark sections
  adjoining. `[Weak evidence: the "no two dark sections abut" rule was applied consistently and
  never objected to, but was not explicitly requested — treat as a guideline.]`
- The shared outcome frame `[Weak evidence: introduced by the builder, not explicitly approved;
  keep only while outcome CONTENT stays varied.]`
- Whether the process layer sits before or after the signature (before is typical; after can work
  if it sets up the outcome).

**Corrections encoded (mistakes to avoid):**
- Do **not** drop the same process-layer structure into every template ("looks very template
  like").
- Do **not** default to typographic/table signatures because you're avoiding chart repetition —
  that trades one rut for another; make it a real visualization.
- Do **not** let the signature geometry appear more than once on a page.
- Do **not** publish numbers that don't follow from each other.

---

## 10. Output format

- **One file.** Real-case mode: name it for the case (e.g. `case-<client-or-topic>.html`) at the
  path the user gives, with **finished copy and real values inline**; use `{{TOKENS}}` only for
  genuinely unknown fields and list every such gap in the delivery report. Template mode:
  `references/case-study-template-N.html` (next free N), fully tokenized.
- Top HTML comment: the case/template name in quotes, one-paragraph purpose, and (template mode)
  a `TOKEN KEY` block, or (real-case mode) a short note of any unresolved gaps.
- Structure exactly: doctype → head (fonts, meta, inline `<style>`) → nav → main(6 sections) →
  footer → inline `<script>` → close.
- After writing, report to the user: the signature chosen and **why that form** (incl. any
  override), the process-layer form, the outcome register, the verification results (balance,
  `node --check`, arithmetic check, contrast if charted), and any remaining `{{TOKENS}}`.
- Keep files local; do not commit unless asked.

---

## 11. Examples

### Example A — standard
**Input:** "Template for a segmentation case; finding = the audience is really four people, and
one is the one to build for."
**Reasoning (summary):** Method = segmentation → signature = four radar "fingerprint" cards (one
visual per segment), priority segment highlighted. Process layer = how the segments were
*derived* (needs-based latent class; N=1,200; validated distinct/stable/reachable) — a method
grid is acceptable *here* because it's this template's own form, not a copy. Outcome = the one
segment to prioritise, as a single figure + the targeting call (different register from the
cards). Verify radar polygon points, brace balance, no redaction.
**Output:** `case-study-template-N.html` — navy cover + dossier → paper "averaging trap" →
process (derive-the-segments) → signature (radar cards) → navy-deep priority line → navy outcome
→ close. Report names the signature and confirms checks pass.

### Example B — difficult / ambiguous (override a requested visual)
**Input:** "Tension/paradox case. Use spectrum sliders showing where people sit between two
poles."
**Reasoning (summary):** A slider **reifies the trade-off the research disproves** — people
refuse the line and want both ends. Override: signature = two overlapping fields; the
intersection (the plurality) is the finding, with a one-mouth contradictory verbatim as proof.
State the override in one line. Process layer = "a tension, or two tribes?" (within-person test,
not the sliders). Outcome = "2 → 1 products" (a decision; a different register). Verify the three
region %s sum to 100 and the intersection clip is wired.
**Output:** overlap-circle signature, not sliders; response explains the override and shows the
region-sum check passing.

### Example C — edge case (numbers that must stay consistent + a non-numeric outcome)
**Input:** "Tracking case; finding = we're ahead today but overtaken soon. Here are shares and
annual rates for four rivals."
**Reasoning (summary):** Method = tracking → signature = a dated **horizon** (not a trend line).
Each rival sits at its crossover year; rivals falling faster than the client sit "beyond the
horizon." **Edge risk:** the crossover years must follow from `(theirShare − yourShare) /
(theirRate − yourRate)` and each marker's `left%` must map that year onto the axis span —
recompute both and fail on mismatch (this exact check caught a real bug where the years didn't
follow from the rates). Outcome = a duration ("4 years of lead time"), not a bare number.
**Output:** horizon signature with markers whose positions and years both reconcile to the
printed shares/rates; response shows the recomputation passing.

---

## 12. Quality checklist (run before delivering)

- [ ] Signature is an **at-a-glance visualization** (chart/diagram/map/cards), understandable in
      ~2s without reading. Not a table, not a text list.
- [ ] Signature form is the method's native artifact — or a justified override, stated in one line.
- [ ] Signature geometry appears **once**; cover doesn't pre-draw it; outcome doesn't redraw it.
- [ ] Geometry is **not** a repeat of another template's (checked against the library; no table/
      axis/bar fatigue).
- [ ] Process layer shows **method, no client findings, no redaction**, in a form unique to this
      template, told insight-first.
- [ ] Outcome varies in content/register from other templates and refers to the signature in a
      **different register**.
- [ ] Any encoded number: length/position/colour carries it; printed figure is only a label.
- [ ] **Arithmetic recomputed from printed inputs and matches** (bar widths, sums, projections,
      positions).
- [ ] If charted: correct sequential/diverging use; status colour paired with glyph+label;
      text-on-fill contrast ≥ AA (computed, not eyeballed); no dual axis.
- [ ] Brand tokens + three type roles unchanged; shared base byte-identical to the family.
- [ ] Oversized display slots hold a short realistic value (token in a comment), no overflow.
- [ ] Balanced tags/braces; `node --check` on the script passes; `grep -i redact` empty.
- [ ] Responsive: wide content in `overflow-x:auto`; mobile fallback for the signature; reduced-
      motion respected; `:focus-visible` present.
- [ ] Tokenized with a `TOKEN KEY` comment; data values inline for easy swapping.
- [ ] **Real-case mode:** every stat, quote, and outcome is the client's real material — nothing
      fabricated; missing items are asked for or flagged, not invented.
- [ ] **Real-case mode:** the confidentiality call is made — process shown freely, sensitive
      results shown only if cleared or genericised, nothing redacted; the signature encodes the
      real data and reconciles to it.
