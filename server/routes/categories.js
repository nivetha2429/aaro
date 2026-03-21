import { Router } from 'express';
import Category from '../models/Category.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { mongoError, categorySchema, zodError } from '../lib/validate.js';
import { getCache, setCache, invalidateCache } from '../lib/cache.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const cached = getCache('categories');
        if (cached) { res.set('Cache-Control', 'public, max-age=300'); return res.json(cached); }
        const data = await Category.find().lean();
        setCache('categories', data, 300_000);
        res.set('Cache-Control', 'public, max-age=300');
        res.json(data);
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const parsed = categorySchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        const category = await new Category(parsed.data).save();
        invalidateCache('categories');
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const parsed = categorySchema.partial().safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        const updated = await Category.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
        if (!updated) return res.status(404).json({ message: 'Category not found' });
        invalidateCache('categories');
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Category not found' });
        invalidateCache('categories');
        res.json({ message: 'Category deleted' });
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
