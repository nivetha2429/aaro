import { Router } from 'express';
import Order from '../models/Order.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { orderSchema, orderStatusSchema, zodError } from '../lib/validate.js';

const router = Router();

// ── Admin routes (must come before user routes) ──

// GET /api/orders/admin — all orders (admin), supports ?page=&limit=&status=
router.get('/admin', authMiddleware, isAdmin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 20);
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
    } catch {
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
    } catch {
        res.status(400).json({ message: 'Failed to update order' });
    }
});

// ── User routes ──

// POST /api/orders — create order (authenticated user)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const parsed = orderSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });

        const { items, shippingAddress } = parsed.data;
        const computedTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const safeAddress = shippingAddress.replace(/<[^>]*>/g, '').trim();

        const order = await Order.create({
            userId: req.userId,
            items,
            totalAmount: Math.round(computedTotal * 100) / 100,
            shippingAddress: safeAddress,
        });
        res.status(201).json(order);
    } catch {
        res.status(500).json({ message: 'Order creation failed' });
    }
});

// GET /api/orders — user's own orders
router.get('/', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

export default router;
