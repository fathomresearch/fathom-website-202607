// Recomputes every encoded position in the two new case signatures from the
// printed inputs and fails on mismatch. The skill requires that a published
// chart reconciles to its own data; these pages are read by people who check.
import { readFileSync } from "node:fs";

let failures = 0;
const ok = (label, cond, detail = "") => {
  console.log(`${cond ? "  PASS" : "  FAIL"}  ${label}${detail ? "  " + detail : ""}`);
  if (!cond) failures++;
};

// ---------- contrast helpers ----------
const lum = ([r, g, b]) => {
  const a = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
};
const ratio = (f, b) => {
  const [x, y] = [lum(f), lum(b)].sort((p, q) => q - p);
  return +((x + 0.05) / (y + 0.05)).toFixed(2);
};
const over = (fg, alpha, bg) => fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));

const warm = [248, 247, 244];
const teal = [0, 214, 179];

// ---------- 1. AUTOMOTIVE: meaning drift map ----------
// Two words, each plotted where it used to sit and where it sits now. The
// finding is that both moved the same way, so what has to reconcile is that
// every "then" lands upper-left, every "now" lands lower-right, and the shaded
// quadrant is exactly the one both arrows point into.
console.log();
console.log("AUTOMOTIVE - meaning drift map");
const PLOT = { x0: 96, y0: 54, w: 530, h: 330 };
const pt = (px, py) => [
  +(PLOT.x0 + px / 100 * PLOT.w).toFixed(1),
  +(PLOT.y0 + py / 100 * PLOT.h).toFixed(1),
];
const PCT = {
  freedom_then: [14, 26], freedom_now: [72, 74],
  adventure_then: [26, 12], adventure_now: [86, 58],
};
const auto = readFileSync("src/pages/cases/automotive.html", "utf8");
const midx = PLOT.x0 + PLOT.w / 2;
const midy = PLOT.y0 + PLOT.h / 2;

for (const [name, pct] of Object.entries(PCT)) {
  const [cx, cy] = pt(...pct);
  ok(`${name} plotted at (${cx}, ${cy})`, auto.includes(`cx="${cx}" cy="${cy}"`), `from ${pct}%`);
  const isNow = name.endsWith("_now");
  ok(`  ${name} in ${isNow ? "lower-right" : "upper-left"} quadrant`,
     isNow ? (cx > midx && cy > midy) : (cx < midx && cy < midy));
}
ok("shaded quadrant = lower-right",
   auto.includes(`x="${midx}" y="${midy}" width="${PLOT.w / 2}" height="${PLOT.h / 2}"`),
   `x=${midx} y=${midy} w=${PLOT.w / 2} h=${PLOT.h / 2}`);
for (const w of ["freedom", "adventure"]) {
  const a = pt(...PCT[`${w}_then`]);
  const b = pt(...PCT[`${w}_now`]);
  ok(`${w} vector points right and down`, b[0] > a[0] && b[1] > a[1],
     `dx=+${(b[0] - a[0]).toFixed(1)} dy=+${(b[1] - a[1]).toFixed(1)}`);
}
const zoneLabel = [0, 112, 94]; // #00705E, darkened from #009E85 which failed AA on the tint
const tint = over(teal, 0.08, warm);
ok("zone label contrast on 8% teal tint", ratio(zoneLabel, tint) >= 4.5,
   `${ratio(zoneLabel, tint)}:1 (AA needs 4.5)`);

// ---------- 2. CANDY: exaggeration dial ----------
// Three EQUAL bands, evenly spaced across the axis. The source gives rank order
// and reasons, not scores, so no dimension encodes a value: position carries the
// ordering and colour carries the verdict. What has to reconcile is that the
// bands really are equal, evenly spread, and span the whole axis.
console.log();
console.log("CANDY - exaggeration dial");
const TRACK = { x0: 92, w: 516 };
const BAND_W = 132;
const BANDS = 3;
const GAP = (TRACK.w - BANDS * BAND_W) / (BANDS - 1);
const xs = Array.from({ length: BANDS }, (_, i) => +(TRACK.x0 + i * (BAND_W + GAP)).toFixed(1));
const centres = xs.map(x => +(x + BAND_W / 2).toFixed(1));
const candy = readFileSync("src/pages/cases/candy.html", "utf8");

xs.forEach((x, i) => {
  ok(`band ${i + 1} at x=${x} width=${BAND_W}`, candy.includes(`<rect x="${x}" y=`));
});
const widthHits = (candy.match(new RegExp(`width="${BAND_W}"`, "g")) || []).length;
ok("all three bands share one width", widthHits === BANDS, `${widthHits} of ${BANDS}`);
ok("gaps between bands are equal", GAP > 0 && Number.isFinite(GAP), `gap=${GAP}`);
ok("bands span the full axis", xs[BANDS - 1] + BAND_W === TRACK.x0 + TRACK.w,
   `ends at ${xs[BANDS - 1] + BAND_W}, axis ends at ${TRACK.x0 + TRACK.w}`);
ok(`aim marker centred on the far band (x=${centres[2]})`,
   candy.includes(`x1="${centres[2]}"`) && candy.includes(`x="${centres[2]}" y="40"`));
ok("winning band is the raised one",
   candy.includes('height="66"') && (candy.match(/height="40"/g) || []).length === 2);
ok("axis is drawn as a direction", candy.includes('marker-end="url(#axisArrow)"'));
ok("winning label contrast on teal fill",
   ratio([5, 38, 32], [0, 199, 166]) >= 4.5, `${ratio([5, 38, 32], [0, 199, 166])}:1`);
ok("rejected label contrast on grey fill",
   ratio([74, 84, 98], over([174, 182, 192], 0.38, warm)) >= 4.5,
   `${ratio([74, 84, 98], over([174, 182, 192], 0.38, warm))}:1`);

console.log(failures ? `\n${failures} FAILURE(S)\n` : "\nAll case-signature geometry reconciles.\n");
process.exit(failures ? 1 : 0);
