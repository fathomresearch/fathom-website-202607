// Re-crops team portraits to the 4:5 the About grid actually uses.
//
// .tm-photo-frame is aspect-ratio:4/5 with object-fit:cover, so a landscape
// source loses 40% of its width to an automatic centre crop that also cuts
// into the shoulders. These crops are placed by hand against the face instead:
// eyes land near 40% from the top, which is the conventional headshot line.
//
// Originals are preserved in assets-source/team-originals/.
import sharp from "sharp";
import { stat } from "node:fs/promises";

const JOBS = [
  {
    name: "Tom-Colville.jpg",
    src: "assets-source/team-originals/Tom-Colville.jpg",
    // 2775x2097 landscape. Tighten onto the face rather than just slicing
    // the sides: head fills ~63% of frame height, eyes at ~40%.
    extract: { left: 606, top: 60, width: 1480, height: 1850 },
  },
  {
    name: "Namasya-Patel.png",
    src: "assets-source/team-originals/Namasya-Patel.png",
    // 800x800 square, already tightly framed. Full height keeps every pixel
    // of the limited headroom; only the width is trimmed, centred on the face.
    extract: { left: 64, top: 0, width: 640, height: 800 },
  },
  {
    name: "Kelvin-Wong.jpeg",
    src: "assets-source/team-originals/Kelvin-Wong.jpeg",
    // 800x800. A standing portrait with crossed arms: cropping to head and
    // shoulders would cut the arms mid-forearm, so the height is kept whole
    // and only the width is trimmed, centred on him.
    extract: { left: 88, top: 0, width: 640, height: 800 },
  },
  {
    name: "Ellaine-Tsai.jpeg",
    src: "assets-source/team-originals/Ellaine-Tsai.jpeg",
    // 800x800, already well centred with eyes near 38%. Width trim only.
    extract: { left: 80, top: 0, width: 640, height: 800 },
  },
  {
    name: "Danni-Bayn.jpg",
    src: "assets-source/team-originals/Danni-Bayn.jpg",
    // 5115x7161, taller than 4:5, so height comes off the BOTTOM. Anchoring
    // at the top preserves the headroom and holds the eyes near a third.
    extract: { left: 0, top: 0, width: 5115, height: 6394 },
  },
  {
    name: "Preeti-Ganesh.jpg",
    src: "assets-source/team-originals/Preeti-Ganesh.jpg",
    // 1200x1600. She sits at ~62% horizontally, so a height-only crop would
    // leave her off centre. Taking width as well recentres her to ~53% and
    // brings the eyes from 28% to ~37%.
    extract: { left: 240, top: 0, width: 960, height: 1200 },
  },
];

for (const { name, src, extract } of JOBS) {
  const before = await sharp(src).metadata();
  const dest = `src/assets/team/${name}`;
  const ratio = (extract.width / extract.height).toFixed(3);
  if (Math.abs(extract.width / extract.height - 0.8) > 0.002)
    throw new Error(`${name}: crop is ${ratio}, expected 0.800`);
  if (extract.left + extract.width > before.width || extract.top + extract.height > before.height)
    throw new Error(`${name}: crop falls outside the source`);

  const pipe = sharp(src).extract(extract).resize({ width: 1200, withoutEnlargement: true });
  await (name.endsWith(".png") ? pipe.png({ compressionLevel: 9 }) : pipe.jpeg({ quality: 88 })).toFile(dest + ".tmp");

  const { default: fs } = await import("node:fs/promises");
  await fs.rename(dest + ".tmp", dest);
  const after = await sharp(dest).metadata();
  const kb = Math.round((await stat(dest)).size / 1024);
  console.log(`${name.padEnd(20)} ${before.width}x${before.height} (${(before.width/before.height).toFixed(2)})`
            + `  ->  ${after.width}x${after.height} (${(after.width/after.height).toFixed(2)})  ${kb}KB`);
}
