import { chromium } from 'playwright';

const OUT = process.env.SHOT_OUT || 'C:/Users/HP/AppData/Local/Temp/claude/d--my-website/58340f9b-0159-4ac3-89f8-2045abbf88ae/scratchpad';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1200 }, deviceScaleFactor: 1 });
await page.goto('file:///d:/my%20website/marketing/carousel-02-questions.html');
await page.waitForTimeout(5000);
// Fixed-position chrome bleeds into per-element screenshots; hide it so the
// verification renders match what html2canvas will actually export.
await page.addStyleTag({ content: '.download-btn,.size-label{display:none!important}' });
const slides = await page.$$('.slide');
console.log('slides found:', slides.length);
for (let i = 0; i < slides.length; i++) {
  await slides[i].screenshot({ path: `${OUT}/c02-${String(i + 1).padStart(2, '0')}.png` });
}
await browser.close();
console.log('done ->', OUT);
