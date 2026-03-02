import { Router } from 'express';
import Brand from '../models/Brand.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { mongoError } from '../lib/validate.js';

const router = Router();

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

async function fetchBrandLogo(brandName) {
    const key = brandName.toLowerCase().replace(/\s+/g, '');
    const domain = BRAND_DOMAINS[key] || `${key}.com`;
    const response = await fetch(`https://logo.clearbit.com/${domain}`, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Logo not found for ${brandName}`);
    const contentType = response.headers.get('content-type') || 'image/png';
    if (!contentType.startsWith('image/')) throw new Error('Response is not an image');
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > 2 * 1024 * 1024) throw new Error('Logo image exceeds 2MB');
    return `data:${contentType};base64,${buffer.toString('base64')}`;
}

router.get('/', async (req, res) => {
    try {
        res.json(await Brand.find());
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/fetch-logo', authMiddleware, isAdmin, async (req, res) => {
    const { brandName } = req.body;
    if (!brandName?.trim()) return res.status(400).json({ message: 'Brand name required' });
    try {
        res.json({ url: await fetchBrandLogo(brandName.trim()) });
    } catch (err) {
        res.status(404).json({ message: err.message || 'Logo not found' });
    }
});

// Must come before /:id to avoid route conflict
router.post('/fetch-all-logos', authMiddleware, isAdmin, async (req, res) => {
    const allBrands = await Brand.find({});
    const results = { success: [], failed: [] };
    for (const brand of allBrands) {
        try {
            brand.image = await fetchBrandLogo(brand.name);
            await brand.save();
            results.success.push(brand.name);
        } catch (err) {
            results.failed.push({ name: brand.name, reason: err.message });
        }
    }
    res.json({ ...results, total: allBrands.length });
});

router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const brandData = { ...req.body };
        if (!brandData.image && brandData.name) {
            try { brandData.image = await fetchBrandLogo(brandData.name); } catch { /* skip */ }
        }
        const brand = await new Brand(brandData).save();
        res.status(201).json(brand);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(brand);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.post('/:id/fetch-logo', authMiddleware, isAdmin, async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });
        brand.image = await fetchBrandLogo(brand.name);
        await brand.save();
        res.json({ url: brand.image, brand });
    } catch (err) {
        res.status(404).json({ message: err.message || 'Logo not found' });
    }
});

router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await Brand.findByIdAndDelete(req.params.id);
        res.json({ message: 'Brand deleted' });
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
