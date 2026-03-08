import { Router } from 'express';
import Banner from '../models/Banner.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { mongoError, bannerSchema, zodError } from '../lib/validate.js';

const router = Router();

// GET /api/banners — public, returns active banners grouped by position
router.get('/', async (req, res) => {
    try {
        res.set('Cache-Control', 'public, max-age=60');
        res.json(await Banner.find().lean().sort({ position: 1, order: 1 }));
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/banners — admin only
router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const parsed = bannerSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        const { position } = parsed.data;
        // Enforce max 3 hero banners, max 1 center banner
        const maxCount = position === 'center' ? 1 : 3;
        const existing = await Banner.countDocuments({ position });
        if (existing >= maxCount) {
            return res.status(400).json({ message: `Maximum ${maxCount} ${position} banner(s) allowed. Delete one first.` });
        }
        const banner = await new Banner(parsed.data).save();
        res.status(201).json(banner);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

// PUT /api/banners/:id — admin only
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { _id, id, __v, ...raw } = req.body;
        const parsed = bannerSchema.partial().safeParse(raw);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        const updated = await Banner.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'Banner not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

// DELETE /api/banners/:id — admin only
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const deleted = await Banner.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Banner not found' });
        res.json({ message: 'Banner deleted' });
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
