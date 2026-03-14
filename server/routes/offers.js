import { Router } from 'express';
import Offer from '../models/Offer.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { mongoError, offerSchema, zodError } from '../lib/validate.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        res.set('Cache-Control', 'public, max-age=60');
        res.json(await Offer.find().lean().sort({ createdAt: -1 }));
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/active', async (req, res) => {
    try {
        res.set('Cache-Control', 'public, max-age=60');
        res.json(await Offer.findOne({ active: true }).lean() || null);
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const parsed = offerSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        const data = parsed.data;
        // Enforce max 3 non-popup banners
        if (data.title !== '__popup__') {
            const bannerCount = await Offer.countDocuments({ title: { $ne: '__popup__' } });
            if (bannerCount >= 3) {
                return res.status(400).json({ message: 'Maximum of 3 offer banners allowed. Delete one before adding a new one.' });
            }
        }
        // Only deactivate the old popup — don't touch banners
        if (data.active) {
            if (data.title === '__popup__') {
                await Offer.updateMany({ title: '__popup__' }, { active: false });
            } else {
                await Offer.updateMany({ title: { $ne: '__popup__' } }, { active: false });
            }
        }
        const offer = await new Offer(data).save();
        res.status(201).json(offer);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        // Strip immutable fields so MongoDB doesn't throw "Mod on _id not allowed"
        const { _id, id, __v, ...raw } = req.body;
        const parsed = offerSchema.partial().safeParse(raw);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        if (parsed.data.active) {
            const existing = await Offer.findById(req.params.id);
            if (existing) {
                if (existing.title === '__popup__') {
                    await Offer.updateMany({ _id: { $ne: req.params.id }, title: '__popup__' }, { active: false });
                } else {
                    await Offer.updateMany({ _id: { $ne: req.params.id }, title: { $ne: '__popup__' } }, { active: false });
                }
            }
        }
        const updated = await Offer.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
        if (!updated) return res.status(404).json({ message: 'Offer not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const deleted = await Offer.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Offer not found' });
        res.json({ message: 'Offer deleted' });
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
