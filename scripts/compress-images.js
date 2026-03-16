import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets');

const JPEG_QUALITY = 72;
const PNG_QUALITY = 75;
const MAX_WIDTH = 1920;

async function compressFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const before = (await stat(filePath)).size;
    const img = sharp(filePath);
    const meta = await img.metadata();

    let pipeline = sharp(filePath);
    if (meta.width > MAX_WIDTH) pipeline = pipeline.resize(MAX_WIDTH);

    if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
    } else if (ext === '.png') {
        pipeline = pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 });
    } else {
        return;
    }

    const buffer = await pipeline.toBuffer();
    if (buffer.length < before) {
        await sharp(buffer).toFile(filePath);
        const after = buffer.length;
        const pct = ((1 - after / before) * 100).toFixed(1);
        console.log(`  ✓ ${path.relative(ASSETS_DIR, filePath)}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB (−${pct}%)`);
    } else {
        console.log(`  – ${path.relative(ASSETS_DIR, filePath)}: already optimal`);
    }
}

async function walkDir(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await walkDir(full);
        } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
            await compressFile(full);
        }
    }
}

console.log('Compressing images in src/assets/...');
await walkDir(ASSETS_DIR);
console.log('Done.');
