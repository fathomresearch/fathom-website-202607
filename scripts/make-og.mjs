// Generates the social share card and favicons.
// Run once (npm run assets); outputs are committed under public/.
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const LOGO = `<path d="M23.22,29.56v18.81h27.06v6.63h-27.06v21.82h-7.71V22.86h38.09v6.71h-30.38Z"/><path d="M92.14,30.72l-20.28,46.11h-7.94l24.44-53.97h7.63l24.52,53.97h-8.1l-20.28-46.11Z"/><path d="M148.89,29.56h-18.5v-6.71h44.64v6.71h-18.5v47.26h-7.63V29.56Z"/><path d="M242.19,22.86v53.97h-7.71v-24.06h-31v24.06h-7.71V22.86h7.71v23.21h31v-23.21h7.71Z"/><path d="M261.42,49.84c0-15.81,12.18-27.6,28.76-27.6s28.61,11.72,28.61,27.6-12.18,27.6-28.61,27.6-28.76-11.8-28.76-27.6ZM311.07,49.84c0-11.95-8.94-20.74-20.89-20.74s-21.05,8.79-21.05,20.74,8.94,20.74,21.05,20.74,20.89-8.79,20.89-20.74Z"/><path d="M387.6,76.83l-.08-39.32-19.51,32.77h-3.55l-19.51-32.54v39.09h-7.4V22.86h6.32l22.51,37.93,22.21-37.93h6.32l.08,53.97h-7.4Z"/>`;

const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g" cx="50%" cy="34%" r="78%">
      <stop offset="0%" stop-color="#16304d"/>
      <stop offset="52%" stop-color="#0A1628"/>
      <stop offset="100%" stop-color="#050B14"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g transform="translate(96,300) scale(0.92)" fill="#00D6B3">
    <g transform="translate(0,-96)">${LOGO}</g>
  </g>
  <text x="96" y="196" fill="rgba(0,214,179,.72)" font-family="IBM Plex Mono, monospace"
        font-size="19" letter-spacing="5.4">RESEARCH &amp; STRATEGY</text>
  <text x="96" y="392" fill="#ffffff" font-family="Spectral, Georgia, serif" font-size="62" font-weight="300">Research should tell you what to do</text>
  <text x="96" y="470" fill="rgba(255,255,255,.62)" font-family="Spectral, Georgia, serif" font-size="62" font-style="italic" font-weight="300">not just what happened.</text>
  <rect x="96" y="534" width="132" height="3" fill="#00D6B3"/>
  <text x="96" y="580" fill="rgba(255,255,255,.50)" font-family="IBM Plex Sans, sans-serif" font-size="21">fathomresearch.ai</text>
</svg>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0A1628"/>
  <g fill="#00D6B3" transform="translate(74,150) scale(1.52)">
    <path d="M23.22,29.56v18.81h27.06v6.63h-27.06v21.82h-7.71V22.86h38.09v6.71h-30.38Z" transform="translate(-10,-22)"/>
  </g>
  <text x="256" y="336" fill="#00D6B3" font-family="IBM Plex Sans, Helvetica, sans-serif"
        font-size="270" font-weight="600" text-anchor="middle">F</text>
</svg>`;

await sharp(Buffer.from(card)).png().toFile("public/images/og-card.png");
await sharp(Buffer.from(icon)).resize(180, 180).png().toFile("public/images/apple-touch-icon.png");
await sharp(Buffer.from(icon)).resize(32, 32).png().toFile("public/favicon-32.png");
await writeFile("public/images/og-card.svg", card);

console.log("Wrote og-card.png (1200x630), apple-touch-icon.png, favicon-32.png");
