import { Router } from 'express';
import Offer from '../models/Offer.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { mongoError } from '../lib/validate.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        res.json(await Offer.find().sort({ createdAt: -1 }));
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/active', async (req, res) => {
    try {
        res.json(await Offer.findOne({ active: true }) || null);
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        // Enforce max 3 non-popup banners
        if (req.body.title !== '__popup__') {
            const bannerCount = await Offer.countDocuments({ title: { $ne: '__popup__' } });
            if (bannerCount >= 3) {
                return res.status(400).json({ message: 'Maximum of 3 offer banners allowed. Delete one before adding a new one.' });
            }
        }
        if (req.body.active) await Offer.updateMany({}, { active: false });
        const offer = await new Offer(req.body).save();
        res.status(201).json(offer);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        // Strip immutable fields so MongoDB doesn't throw "Mod on _id not allowed"
        const { _id, id, __v, ...updateData } = req.body;
        if (updateData.active) {
            await Offer.updateMany({ _id: { $ne: req.params.id } }, { active: false });
        }
        const updated = await Offer.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await Offer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Offer deleted' });
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
