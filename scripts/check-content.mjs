// Fails the build if an unfinished case-study template reaches production.
// Two of three case pages once shipped live with raw {{TOKEN}} placeholders
// and author instructions rendered as body copy; this stops that recurring.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "src/pages";

const RULES = [
  [/\{\{[A-Z][A-Z0-9_]*\}\}/g, "unfilled {{TOKEN}} placeholder"],
  [/A paragraph or two|One or two lines|keep it short|the rhythm is the point|swap: \{\{/g,
   "author instruction left in copy"],
  [/TOKEN KEY/g, "template legend comment"],
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith(".html")) yield full;
  }
}

const problems = [];
for await (const file of walk(ROOT)) {
  const text = await readFile(file, "utf8");
  for (const [pattern, label] of RULES) {
    const hits = text.match(pattern);
    if (hits) problems.push(`${file}: ${hits.length} x ${label} (${hits[0]})`);
  }
}

if (problems.length) {
  console.error("Unfinished content found:\n" + problems.map(p => "  " + p).join("\n"));
  process.exit(1);
}
console.log("Content check passed: no unfinished template content in src/pages.");
