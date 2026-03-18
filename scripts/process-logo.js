import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const INPUT = path.join(ROOT, 'src/assets/logo.png');
const OUT_TRANSPARENT = path.join(ROOT, 'public/logo-transparent.png');
const OUT_WHITE = path.join(ROOT, 'public/logo-white-bg.png');

async function main() {
  const img = sharp(INPUT);
  const { width, height } = await img.metadata();

  // Extract raw pixel data
  const { data, info } = await img
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Make near-white and very light pixels transparent (background removal)
  // The logo has a white/light background
  const buf = Buffer.from(data);
  for (let i = 0; i < buf.length; i += 4) {
    const r = buf[i], g = buf[i + 1], b = buf[i + 2];
    // If pixel is very light (near white), make transparent
    if (r > 230 && g > 230 && b > 230) {
      buf[i + 3] = 0; // fully transparent
    }
    // Also handle near-black background pixels just in case
    if (r < 30 && g < 30 && b < 30) {
      buf[i + 3] = 0;
    }
  }

  // Save transparent version
  await sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(OUT_TRANSPARENT);
  console.log(`Transparent logo saved: ${OUT_TRANSPARENT}`);

  // Save white-background version (for OG image)
  await sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toFile(OUT_WHITE);
  console.log(`White-bg logo saved: ${OUT_WHITE}`);
}

main().catch(err => { console.error(err); process.exit(1); });
