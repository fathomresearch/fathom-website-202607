# Case-study page builder — team quickstart

This folder's case-study pages are produced with a reusable **Claude skill**, so anyone on the
team can turn a real research engagement into a finished, on-brand page — or spin up a new
reusable template — without starting from scratch.

## How to use it (in Claude Code, from this repo)

Either invoke the skill by name:

```
/fathom-case-study-template
```

…or just paste this trigger prompt and fill in the blanks:

> **Use the `fathom-case-study-template` skill.** Build a case page for `<client / topic>` from
> the attached research (`<files>`). The method is `<research method>` and the finding is
> `<the aha, as a claim>`. Pick the signature from the method's native artifact (override any
> naive chart that misrepresents it and say why), give it a process ("how we built it") layer
> with no redaction, and an outcome that doesn't redraw the signature. Verify tag/brace balance,
> `node --check`, no redaction, and that every printed number recomputes from the real inputs.

Two modes, picked automatically:
- **Real case** (you attach actual research) → a finished page with your real data and quotes;
  nothing is fabricated, confidentiality is respected, and the visual encodes the real numbers.
- **Template** (you ask for a blank/reusable shell) → a tokenized `case-study-template-N.html`
  with `{{TOKENS}}` and placeholder data.

## The two rules worth knowing before you start

1. **The signature is a visualization, not a table.** Each page is anchored on ONE at-a-glance
   chart/diagram/map/cards that carries the finding in ~2 seconds. If you have to *read* it, it's
   wrong. (Exemplars in this folder: the positioning map, the overlapping-circles tension, the
   benchmark heatmap.)
2. **Lead with process, never redact.** Show *how Fathom works*; show client results only where
   cleared, genericise the rest — never black anything out.

## Where the full instructions live (source of truth)

`.claude/skills/fathom-case-study-template/SKILL.md`

That file is the complete, self-contained procedure (inputs, workflow, content-writing and
visual-development steps, rules, examples, and a QA checklist). **Edit the skill there, not this
README** — this page is only a pointer, so it can't drift into a second, conflicting spec.
