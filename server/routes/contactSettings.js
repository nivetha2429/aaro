import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import ContactSettings from '../models/ContactSettings.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { mongoError, contactSettingsSchema, zodError } from '../lib/validate.js';

const router = Router();

// Rate limiter for PUT endpoint: 10 attempts per 15 min
const contactSettingsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many contact settings updates, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// GET /api/contact-settings — public, cached
router.get('/', async (req, res) => {
    try {
        res.set('Cache-Control', 'public, max-age=300');
        const settings = await ContactSettings.findOne().lean();
        res.json(settings || {});
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/contact-settings — admin only, upsert
router.put('/', authMiddleware, isAdmin, contactSettingsLimiter, async (req, res) => {
    try {
        const { _id, __v, createdAt, updatedAt, ...raw } = req.body;
        const parsed = contactSettingsSchema.safeParse(raw);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        const updated = await ContactSettings.findOneAndUpdate(
            {},
            parsed.data,
            { new: true, upsert: true, runValidators: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

export default router;
