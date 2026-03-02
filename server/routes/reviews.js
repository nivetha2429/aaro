import { Router } from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { reviewSchema, zodError, mongoError } from '../lib/validate.js';

const router = Router();

router.get('/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const parsed = reviewSchema.safeParse({ ...req.body, rating: Number(req.body.rating) });
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });

        const { productId, comment, rating } = parsed.data;

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const review = await Review.create({ productId, userId: req.userId, name: user.name, comment, rating });

        // Recalculate product rating
        const allReviews = await Review.find({ productId });
        const avg = allReviews.reduce((a, r) => a + r.rating, 0) / allReviews.length;
        await Product.findByIdAndUpdate(productId, {
            reviewCount: allReviews.length,
            rating: Math.round(avg * 10) / 10,
        });

        res.status(201).json(review);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        const remaining = await Review.find({ productId: review.productId });
        const avg = remaining.length ? remaining.reduce((a, r) => a + r.rating, 0) / remaining.length : 0;
        await Product.findByIdAndUpdate(review.productId, {
            reviewCount: remaining.length,
            rating: Math.round(avg * 10) / 10,
        });

        res.json({ message: 'Review deleted' });
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
