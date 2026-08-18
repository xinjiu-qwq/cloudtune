// Generates the 1024x1024 app icon PNG from inline SVG.
// Run: node scripts/gen-icon.mjs && npx tauri icon app-icon.png
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const svg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#D92D20"/>
      <stop offset="1" stop-color="#7F1D1D"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="230" fill="url(#bg)"/>
  <g fill="#FFFFFF">
    <ellipse cx="352" cy="704" rx="96" ry="70" transform="rotate(-18 352 704)"/>
    <ellipse cx="648" cy="640" rx="96" ry="70" transform="rotate(-18 648 640)"/>
    <rect x="416" y="396" width="36" height="316" rx="14"/>
    <rect x="712" y="332" width="36" height="316" rx="14"/>
    <path d="M416 396 L748 332 L748 410 L416 474 Z"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg), { density: 300 })
  .resize(1024, 1024)
  .png()
  .toFile("app-icon.png");

writeFileSync("app-icon.svg", svg);
console.log("app-icon.png generated");
