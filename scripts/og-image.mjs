// Genereert public/og-image.png (1200x630) uit het logo.
// Opnieuw draaien na het vervangen van src/assets/logo.svg: node scripts/og-image.mjs
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const logo = await sharp(await readFile(new URL('../src/assets/logo.svg', import.meta.url)))
  .resize(400, 400)
  .png()
  .toBuffer();

const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <text x="80" y="270" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="700" font-size="58" fill="#1e1926">Dagvers, huisbereid ijs</text>
  <text x="80" y="350" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="700" font-size="58" fill="#1e1926">in Alken</text>
  <text x="80" y="430" font-family="Arial, sans-serif" font-size="30" fill="#3a3346">Smaken van vandaag, openingsuren en liters ijs</text>
</svg>`);

await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#f6dd66' } })
  .composite([
    { input: text, top: 0, left: 0 },
    { input: logo, top: 115, left: 760 },
  ])
  .png()
  .toFile(new URL('../public/og-image.png', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));

console.log('public/og-image.png geschreven');
