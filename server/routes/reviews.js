import { Router } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { reviewSchema, zodError, mongoError } from '../lib/validate.js';

const router = Router();

router.get('/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).lean().sort({ createdAt: -1 });
        res.json(reviews);
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const parsed = reviewSchema.safeParse({ ...req.body, rating: Number(req.body.rating) });
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });

        const { productId, comment, rating } = parsed.data;

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const review = await Review.create({ productId, userId: req.userId, name: user.name, comment, rating });

        // Recalculate product rating using $avg aggregation
        const [agg] = await Review.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId) } },
            { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        await Product.findByIdAndUpdate(productId, {
            reviewCount: agg?.count || 1,
            rating: Math.round((agg?.avg || rating) * 10) / 10,
        });

        res.status(201).json(review);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!comment?.trim()) return res.status(400).json({ message: 'Comment is required' });
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });

        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { rating: Number(rating), comment: comment.trim() },
            { new: true }
        );
        if (!review) return res.status(404).json({ message: 'Review not found' });

        // Recalculate product rating
        const [agg] = await Review.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(review.productId) } },
            { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        await Product.findByIdAndUpdate(review.productId, {
            reviewCount: agg?.count || 1,
            rating: Math.round((agg?.avg || rating) * 10) / 10,
        });

        res.json(review);
    } catch {
        res.status(500).json({ message: 'Failed to update review' });
    }
});

router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        const [agg] = await Review.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(review.productId) } },
            { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        await Product.findByIdAndUpdate(review.productId, {
            reviewCount: agg?.count || 0,
            rating: Math.round((agg?.avg || 0) * 10) / 10,
        });

        res.json({ message: 'Review deleted' });
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
