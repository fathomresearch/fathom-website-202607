// Produces responsive, correctly-sized case imagery.
// All five case cards now use photography. Sources live in assets-source/ so the
// multi-megabyte originals are not deployed; only the generated derivatives
// under public/images/cases/ ship. The work page previously inlined three of
// these as base64 into its HTML.
//
// `ratio` is the master's height/width. Most sources crop to 4:3 (0.75), which
// suits a single subject. The financial services frame is a three-person scene
// spanning the full width, and a 4:3 crop discarded 949px of it — enough to lose
// the advisor and leave what looked like a stock photo of a couple. It keeps its
// native 16:9 so nothing is cut horizontally; the card crops vertically instead.
import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";

const OUT = "public/images/cases";
await mkdir(OUT, { recursive: true });

const SOURCES = {
  motorsports: { src: "assets-source/images/case-motorsports.jpg", ratio: 0.75 },
  sportsbook:  { src: "assets-source/images/case-sportsbook.jpg",  ratio: 0.75 },
  wealth:      { src: "assets-source/images/case-wealth.jpg",      ratio: 0.5625 },
  automotive:  { src: "assets-source/images/case-automotive.jpg",  ratio: 0.75 },
  candy:       { src: "assets-source/images/case-candy.jpg",       ratio: 0.75 },
};
const WIDTHS = [640, 1024, 1600];

let total = 0;
for (const [name, { src, ratio }] of Object.entries(SOURCES)) {
  for (const w of WIDTHS) {
    const dest = `${OUT}/${name}-${w}.webp`;
    await sharp(src)
      .resize({ width: w, height: Math.round(w * ratio), fit: "cover", position: "attention" })
      .webp({ quality: 74 })
      .toFile(dest);
    const kb = Math.round((await stat(dest)).size / 1024);
    total += kb;
    console.log(`${dest.padEnd(42)} ${String(w)}x${Math.round(w * ratio)}  ${kb}KB`);
  }
}
console.log(`\nTotal generated: ${total}KB across ${Object.keys(SOURCES).length * WIDTHS.length} files`);
