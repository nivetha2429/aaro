import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import Brand from '../models/Brand.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { mongoError, brandSchema, zodError } from '../lib/validate.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_PATH = path.join(__dirname, '..', 'uploads');

// Simple Icons CDN slugs — SVG format, vector quality at any size
const SIMPLE_ICONS = {
    apple: 'apple', samsung: 'samsung', oneplus: 'oneplus',
    google: 'google', googlepixel: 'google', xiaomi: 'xiaomi',
    redmi: 'xiaomi', oppo: 'oppo', vivo: 'vivo',
    motorola: 'motorola', nokia: 'nokia', iqoo: 'iqoo',
    infinix: 'infinix', dell: 'dell', hp: 'hp',
    asus: 'asus', lenovo: 'lenovo', lenova: 'lenovo',
    acer: 'acer', msi: 'msi', razer: 'razer',
    sony: 'sony', lg: 'lg', huawei: 'huawei',
    jbl: 'jbl', bose: 'bose', logitech: 'logitech',
    iphone: 'apple', xiaomiredmi: 'xiaomi',
};

const BRAND_DOMAINS = {
    apple: 'apple.com', samsung: 'samsung.com', iphone: 'apple.com',
    oneplus: 'oneplus.com', google: 'google.com', googlepixel: 'google.com',
    xiaomi: 'mi.com', redmi: 'mi.com', realme: 'realme.com',
    oppo: 'oppo.com', vivo: 'vivo.com', nothing: 'nothing.technology',
    motorola: 'motorola.com', dell: 'dell.com', hp: 'hp.com',
    lenovo: 'lenovo.com', lenova: 'lenovo.com', asus: 'asus.com',
    microsoft: 'microsoft.com', acer: 'acer.com', msi: 'msi.com',
    razer: 'razer.com', nokia: 'nokia.com', sony: 'sony.com',
    lg: 'lg.com', huawei: 'huawei.com', poco: 'po.co', iqoo: 'iqoo.com',
    tecno: 'tecno-mobile.com', infinix: 'infinixmobility.com',
    boat: 'boat-lifestyle.com', noise: 'gonoise.com', zebronics: 'zebronics.com',
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

// Download HD logo: Simple Icons SVG → Clearbit 256px → Clearbit → Google Favicons
async function downloadAndSaveLogo(brandName) {
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
            const filename = `brand-${key}-${Date.now()}.png`;
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

// GET /api/brands
router.get('/', async (req, res) => {
    try {
        res.set('Cache-Control', 'public, max-age=300');
        res.json(await Brand.find().lean());
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/brands/fetch-all-logos — download & save logos for every brand
// Must come before /:id to avoid route conflict
router.post('/fetch-all-logos', authMiddleware, isAdmin, async (req, res) => {
    try {
        const allBrands = await Brand.find({});
        const success = [], failed = [];

        for (const brand of allBrands) {
            try {
                const localPath = await downloadAndSaveLogo(brand.name);
                if (localPath) {
                    brand.image = localPath;
                    await brand.save();
                    success.push(brand.name);
                } else {
                    failed.push({ name: brand.name, error: 'Could not download logo' });
                }
            } catch (err) {
                failed.push({ name: brand.name, error: 'Failed to save logo' });
            }
        }

        res.json({ success, failed, total: allBrands.length });
    } catch (err) {
        console.error('Fetch all logos failed:', err);
        res.status(500).json({ message: 'Failed to fetch logos' });
    }
});

// POST /api/brands
router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const parsed = brandSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        const brand = await new Brand(parsed.data).save();
        res.status(201).json(brand);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

// PUT /api/brands/:id
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const parsed = brandSchema.partial().safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        const brand = await Brand.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
        if (!brand) return res.status(404).json({ message: 'Brand not found' });
        res.json(brand);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

// POST /api/brands/:id/fetch-logo — download & save logo for one brand
router.post('/:id/fetch-logo', authMiddleware, isAdmin, async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        const localPath = await downloadAndSaveLogo(brand.name);
        if (!localPath) return res.status(404).json({ message: `Could not fetch logo for ${brand.name}` });

        brand.image = localPath;
        await brand.save();
        res.json({ url: brand.image, brand });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Logo fetch failed' });
    }
});

// DELETE /api/brands/:id
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const deleted = await Brand.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Brand not found' });
        res.json({ message: 'Brand deleted' });
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
