import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const INPUT = path.join(ROOT, 'public/logo-transparent.png');
const ICONS_DIR = path.join(ROOT, 'public/icons');

if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });

const BG_COLOR = { r: 26, g: 26, b: 26, alpha: 1 }; // #1a1a1a
const WHITE_BG = { r: 255, g: 255, b: 255, alpha: 1 };

async function generateIcon(size, outputPath, { bg = BG_COLOR, padding = 0.15 } = {}) {
  const logoSize = Math.round(size * (1 - padding * 2));
  const logo = await sharp(INPUT)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: bg }
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toFile(outputPath);

  const stat = fs.statSync(outputPath);
  console.log(`  ${path.basename(outputPath)} (${size}x${size}) — ${(stat.size / 1024).toFixed(1)} KB`);
}

async function main() {
  console.log('Generating PWA icons...');
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  for (const size of sizes) {
    await generateIcon(size, path.join(ICONS_DIR, `icon-${size}x${size}.png`));
  }

  // Maskable icon — extra safe-zone padding (30%)
  console.log('\nGenerating maskable icon...');
  await generateIcon(512, path.join(ICONS_DIR, 'maskable-icon-512x512.png'), { padding: 0.30 });

  // Favicons
  console.log('\nGenerating favicons...');
  await generateIcon(32, path.join(ROOT, 'public/favicon-32x32.png'), { padding: 0.10 });
  await generateIcon(16, path.join(ROOT, 'public/favicon-16x16.png'), { padding: 0.10 });

  // favicon.ico (32x32 PNG renamed — browsers accept PNG-based .ico)
  const favicon32 = await sharp(INPUT)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .flatten({ background: BG_COLOR })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(ROOT, 'public/favicon.ico'), favicon32);
  console.log('  favicon.ico (32x32)');

  // Apple touch icon — white background, 180x180
  console.log('\nGenerating apple-touch-icon...');
  await generateIcon(180, path.join(ROOT, 'public/apple-touch-icon.png'), { bg: WHITE_BG, padding: 0.15 });

  console.log('\nAll icons generated!');
}

main().catch(err => { console.error(err); process.exit(1); });
