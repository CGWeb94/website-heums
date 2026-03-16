import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/Chris/AppData/Roaming/npm/node_modules/puppeteer/lib/cjs/puppeteer/puppeteer.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

// Auto-increment screenshot number
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'));
const nums = existing.map(f => {
  const m = f.match(/screenshot-(\d+)/);
  return m ? parseInt(m[1]) : 0;
});
const n = nums.length ? Math.max(...nums) + 1 : 1;
const filename = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
const outPath = path.join(dir, filename);

(async () => {
  // Detect Chrome version folder
  const cacheDir = 'C:/Users/Chris/.cache/puppeteer/chrome';
  const versions = fs.readdirSync(cacheDir);
  const version = versions[0];
  const executablePath = `C:/Users/Chris/.cache/puppeteer/chrome/${version}/chrome-win64/chrome.exe`;

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

  // Scroll through page to trigger all ScrollTrigger events
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= pageHeight; y += 400) {
    await page.evaluate(pos => window.scrollTo(0, pos), y);
    await new Promise(r => setTimeout(r, 60));
  }

  // Force all GSAP animations to final visible state
  await page.evaluate(() => {
    if (window.gsap) {
      gsap.killTweensOf('*');
      // Force all scroll-triggered elements to final state
      const finalStates = [
        ['#hero-text',  { opacity: 1, y: 0 }],
        ['#hero-img',   { opacity: 1, x: 0 }],
        ['#about-imgs', { opacity: 1, x: 0 }],
        ['#about-cnt',  { opacity: 1, x: 0 }],
        ['#nd-card',    { opacity: 1, y: 0 }],
        ['#ct-info',    { opacity: 1, y: 0 }],
        ['#ct-form',    { opacity: 1, y: 0 }],
      ];
      finalStates.forEach(([sel, props]) => {
        const el = document.querySelector(sel);
        if (el) gsap.set(el, props);
      });
    }
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();

  console.log('Screenshot saved:', outPath);
})();
