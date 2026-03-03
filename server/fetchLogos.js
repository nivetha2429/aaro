import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import Brand from './models/Brand.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_PATH = path.join(__dirname, 'uploads');

// Simple Icons CDN slugs — SVG format, perfect at any resolution
const SIMPLE_ICONS = {
    apple: 'apple', samsung: 'samsung', oneplus: 'oneplus',
    google: 'google', googlepixel: 'google', xiaomi: 'xiaomi',
    redmi: 'xiaomi', oppo: 'oppo', vivo: 'vivo',
    motorola: 'motorola', nokia: 'nokia', iqoo: 'iqoo',
    infinix: 'infinix', dell: 'dell', hp: 'hp',
    asus: 'asus', lenovo: 'lenovo', lenova: 'lenovo',
    acer: 'acer', msi: 'msi', razer: 'razer',
    sony: 'sony', lg: 'lg', huawei: 'huawei',
    jbl: 'jbl', bose: 'bose',
};

// Clearbit domain map for brands not on Simple Icons
const BRAND_DOMAINS = {
    apple: 'apple.com', samsung: 'samsung.com', oneplus: 'oneplus.com',
    google: 'google.com', googlepixel: 'google.com', xiaomi: 'mi.com',
    redmi: 'mi.com', realme: 'realme.com', oppo: 'oppo.com',
    vivo: 'vivo.com', nothing: 'nothing.technology', motorola: 'motorola.com',
    dell: 'dell.com', hp: 'hp.com', lenovo: 'lenovo.com',
    lenova: 'lenovo.com', asus: 'asus.com', microsoft: 'microsoft.com',
    acer: 'acer.com', msi: 'msi.com', razer: 'razer.com',
    nokia: 'nokia.com', sony: 'sony.com', lg: 'lg.com',
    huawei: 'huawei.com', poco: 'po.co', iqoo: 'iqoo.com',
    tecno: 'tecno-mobile.com', infinix: 'infinixmobility.com',
    logitech: 'logitech.com', jbl: 'jbl.com', bose: 'bose.com',
};

async function tryFetch(url, timeout = 10000) {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 100) return null;
    return { buffer, contentType };
}

async function downloadHDLogo(brandName) {
    const key = brandName.toLowerCase().replace(/\s+/g, '');
    await fs.mkdir(UPLOADS_PATH, { recursive: true });

    // 1. Try Simple Icons SVG (vector — perfect at any size)
    const siSlug = SIMPLE_ICONS[key];
    if (siSlug) {
        try {
            const result = await tryFetch(`https://cdn.simpleicons.org/${siSlug}`);
            if (result) {
                const filename = `brand-${key}.svg`;
                await fs.writeFile(path.join(UPLOADS_PATH, filename), result.buffer);
                return `/uploads/${filename}`;
            }
        } catch { /* fall through */ }
    }

    // 2. Try Clearbit at 256px high-res PNG
    const domain = BRAND_DOMAINS[key] || `${key}.com`;
    try {
        const result = await tryFetch(`https://logo.clearbit.com/${domain}?size=256`);
        if (result) {
            const filename = `brand-${key}-256.png`;
            await fs.writeFile(path.join(UPLOADS_PATH, filename), result.buffer);
            return `/uploads/${filename}`;
        }
    } catch { /* fall through */ }

    // 3. Try Clearbit standard
    try {
        const result = await tryFetch(`https://logo.clearbit.com/${domain}`);
        if (result) {
            const filename = `brand-${key}.png`;
            await fs.writeFile(path.join(UPLOADS_PATH, filename), result.buffer);
            return `/uploads/${filename}`;
        }
    } catch { /* fall through */ }

    // 4. Google Favicons at 128px
    try {
        const result = await tryFetch(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
        if (result) {
            const filename = `brand-${key}-fav.png`;
            await fs.writeFile(path.join(UPLOADS_PATH, filename), result.buffer);
            return `/uploads/${filename}`;
        }
    } catch { /* fall through */ }

    return null;
}

async function main() {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 30000 });
    console.log('✓ Connected to MongoDB\n');

    const brands = await Brand.find({});
    console.log(`Found ${brands.length} brands. Downloading HD logos...\n`);

    let saved = 0, failed = 0;
    for (const brand of brands) {
        const localPath = await downloadHDLogo(brand.name);
        if (localPath) {
            brand.image = localPath;
            await brand.save();
            const type = localPath.endsWith('.svg') ? 'SVG' : 'PNG';
            console.log(`  ✅  ${brand.name.padEnd(15)} [${type}] → ${localPath}`);
            saved++;
        } else {
            console.log(`  ❌  ${brand.name} — no logo found`);
            failed++;
        }
    }

    console.log(`\n✓ Done! ${saved} HD logos saved, ${failed} failed`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
