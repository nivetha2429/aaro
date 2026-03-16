import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Order from '../models/Order.js';
import Variant from '../models/Variant.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { orderSchema, orderStatusSchema, zodError } from '../lib/validate.js';
import logger from '../config/logger.js';

const router = Router();

const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many orders, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── Admin routes (must come before user routes) ──

// GET /api/orders/admin — all orders (admin), supports ?page=&limit=&status=
router.get('/admin', authMiddleware, isAdmin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const filter = req.query.status ? { status: req.query.status } : {};

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('userId', 'name email phone')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Order.countDocuments(filter),
        ]);

        res.json({ orders, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        logger.error('Failed to fetch orders:', err);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// PUT /api/orders/admin/:id — update order status (admin)
router.put('/admin/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const parsed = orderStatusSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });

        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            { status: parsed.data.status },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Order not found' });
        res.json(updated);
    } catch (err) {
        logger.error('Failed to update order:', err);
        res.status(400).json({ message: 'Failed to update order' });
    }
});

// ── User routes ──

// POST /api/orders — create order (authenticated user)
router.post('/', orderLimiter, authMiddleware, async (req, res) => {
    try {
        const parsed = orderSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });

        const { items, shippingAddress } = parsed.data;
        const safeAddress = shippingAddress.replace(/<[^>]*>/g, '').trim();

        // Validate each item's variant and check stock
        let computedTotal = 0;
        const validatedItems = [];

        for (const item of items) {
            // Look up variant by productId + specs
            const variant = await Variant.findOne({
                productId: item.product?._id || item.product,
                ram: item.ram,
                storage: item.storage,
                color: item.color,
            });

            if (!variant) {
                return res.status(400).json({ message: `Variant not found for specified configuration` });
            }

            // Validate price matches actual variant price
            if (item.price !== variant.price) {
                return res.status(400).json({ message: `Price mismatch for item: expected ${variant.price}, got ${item.price}` });
            }

            // Check stock
            if (variant.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for item: only ${variant.stock} available` });
            }

            // Atomically decrement stock
            await Variant.findByIdAndUpdate(
                variant._id,
                { $inc: { stock: -item.quantity } },
                { new: true }
            );

            computedTotal += item.price * item.quantity;
            validatedItems.push(item);
        }

        const order = await Order.create({
            userId: req.userId,
            items: validatedItems,
            totalAmount: Math.round(computedTotal * 100) / 100,
            shippingAddress: safeAddress,
        });
        res.status(201).json(order);
    } catch (err) {
        logger.error('Order creation failed:', err);
        res.status(500).json({ message: 'Order creation failed' });
    }
});

// GET /api/orders — user's own orders
router.get('/', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        logger.error('Failed to fetch orders:', err);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

export default router;
