/*
 * Strips OS/browser chrome from the raw gallery screenshots so they can sit
 * inside the carousel's device frames.
 *
 * Desktop shots are 1366x768 Windows captures: ~28px title bar on top, ~52px
 * taskbar at the bottom, plus a floating green WhatsApp CTA around y=658..706.
 * Cutting at y=643 clears the button without eating meaningful content.
 *
 * Phone shots are 1080x2340 Android captures: ~200px of status + URL bar on
 * top, the nav bar at the very bottom, and the same WhatsApp CTA near y=1840.
 */
import sharp from 'sharp';
import fs from 'fs';

const SHOTS = 'shots';
const OUT   = 'shots/clean';
fs.mkdirSync(OUT, { recursive: true });

const DESKTOP = { left: 8,  top: 28,  width: 1350, height: 615 };
const PHONE   = { left: 0,  top: 200, width: 1080, height: 1590 };

const phoneSet = new Set(['41', '53']);

for (const f of fs.readdirSync(SHOTS).filter(f => f.endsWith('.png'))) {
  const id  = f.replace('.png', '');
  const box = phoneSet.has(id) ? PHONE : DESKTOP;
  const src = `${SHOTS}/${f}`;

  const meta = await sharp(src).metadata();
  // Guard: a shot captured at a different resolution would otherwise throw.
  if (meta.width < box.left + box.width || meta.height < box.top + box.height) {
    console.log(`skip ${f} — ${meta.width}x${meta.height} smaller than crop box`);
    continue;
  }

  await sharp(src).extract(box).toFile(`${OUT}/${f}`);
  console.log(`${f}  ${meta.width}x${meta.height}  ->  ${box.width}x${box.height}`);
}
