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
        if (req.body.active) await Offer.updateMany({}, { active: false });
        const offer = await new Offer(req.body).save();
        res.status(201).json(offer);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        if (req.body.active) {
            await Offer.updateMany({ _id: { $ne: req.params.id } }, { active: false });
        }
        const updated = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
