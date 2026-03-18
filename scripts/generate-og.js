import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const INPUT = path.join(ROOT, 'public/logo-transparent.png');

async function generateWideOG() {
  const W = 1200, H = 630;

  // Create gradient background using SVG
  const bgSvg = `<svg width="${W}" height="${H}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a1a1a"/>
        <stop offset="100%" style="stop-color:#2d1810"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
  </svg>`;

  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  // Resize logo
  const logo = await sharp(INPUT)
    .resize(200, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Create text overlay with SVG
  const textSvg = `<svg width="${W}" height="${H}">
    <text x="520" y="260" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="bold" fill="white">Aaro Groups</text>
    <text x="520" y="340" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="#e05a1e">Buy Phones, Laptops &amp; Accessories</text>
    <text x="${W / 2}" y="${H - 40}" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#888888" text-anchor="middle">aarogroups.com</text>
  </svg>`;

  const textOverlay = await sharp(Buffer.from(textSvg)).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: logo, left: 160, top: 215 },
      { input: textOverlay, left: 0, top: 0 },
    ])
    .jpeg({ quality: 90 })
    .toFile(path.join(ROOT, 'public/og-image.jpg'));

  const stat = fs.statSync(path.join(ROOT, 'public/og-image.jpg'));
  console.log(`og-image.jpg (1200x630) — ${(stat.size / 1024).toFixed(1)} KB`);
}

async function generateSquareOG() {
  const S = 600;

  const bgSvg = `<svg width="${S}" height="${S}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a1a1a"/>
        <stop offset="100%" style="stop-color:#2d1810"/>
      </linearGradient>
    </defs>
    <rect width="${S}" height="${S}" fill="url(#bg)"/>
  </svg>`;

  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  const logo = await sharp(INPUT)
    .resize(200, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const textSvg = `<svg width="${S}" height="${S}">
    <text x="${S / 2}" y="380" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">Aaro Groups</text>
    <text x="${S / 2}" y="430" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#e05a1e" text-anchor="middle">Buy Phones, Laptops &amp; Accessories</text>
    <text x="${S / 2}" y="${S - 30}" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#888888" text-anchor="middle">aarogroups.com</text>
  </svg>`;

  const textOverlay = await sharp(Buffer.from(textSvg)).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: logo, left: 200, top: 80 },
      { input: textOverlay, left: 0, top: 0 },
    ])
    .jpeg({ quality: 90 })
    .toFile(path.join(ROOT, 'public/og-image-square.jpg'));

  const stat = fs.statSync(path.join(ROOT, 'public/og-image-square.jpg'));
  console.log(`og-image-square.jpg (600x600) — ${(stat.size / 1024).toFixed(1)} KB`);
}

async function main() {
  console.log('Generating OG images...');
  await generateWideOG();
  await generateSquareOG();
  console.log('Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
