import { Router } from 'express';
import Category from '../models/Category.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { mongoError } from '../lib/validate.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        res.json(await Category.find());
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const category = await new Category(req.body).save();
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
