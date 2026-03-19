import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { authMiddleware, isSuperAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require superadmin
router.use(authMiddleware, isSuperAdmin);

// GET /api/superadmin/stats
router.get('/stats', async (_req, res) => {
    try {
        const [totalUsers, totalAdmins, totalProducts, orderStats] = await Promise.all([
            User.countDocuments({ role: 'customer' }),
            User.countDocuments({ role: 'admin' }),
            Product.countDocuments(),
            Order.aggregate([
                { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } }
            ]),
        ]);
        const stats = orderStats[0] || { totalOrders: 0, totalRevenue: 0 };
        res.json({ totalUsers, totalAdmins, totalProducts, totalOrders: stats.totalOrders, totalRevenue: stats.totalRevenue });
    } catch { res.status(500).json({ message: 'Failed to fetch stats' }); }
});

// GET /api/superadmin/admins
router.get('/admins', async (_req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 }).lean();
        res.json(admins);
    } catch { res.status(500).json({ message: 'Failed to fetch admins' }); }
});

// POST /api/superadmin/admins
router.post('/admins', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });

        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });

        const hash = await bcrypt.hash(password, 12);
        const admin = await User.create({ name, email, password: hash, phone, role: 'admin' });
        res.status(201).json({ id: admin._id, name: admin.name, email: admin.email, phone: admin.phone, role: admin.role, createdAt: admin.createdAt });
    } catch { res.status(500).json({ message: 'Failed to create admin' }); }
});

// PUT /api/superadmin/admins/:id
router.put('/admins/:id', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const admin = await User.findById(req.params.id);
        if (!admin || admin.role !== 'admin') return res.status(404).json({ message: 'Admin not found' });

        if (email && email !== admin.email) {
            if (await User.findOne({ email, _id: { $ne: admin._id } })) return res.status(400).json({ message: 'Email already in use' });
            admin.email = email;
        }
        if (name) admin.name = name;
        if (phone) admin.phone = phone;
        if (password) admin.password = await bcrypt.hash(password, 12);

        await admin.save();
        res.json({ id: admin._id, name: admin.name, email: admin.email, phone: admin.phone, role: admin.role, createdAt: admin.createdAt });
    } catch { res.status(500).json({ message: 'Failed to update admin' }); }
});

// DELETE /api/superadmin/admins/:id
router.delete('/admins/:id', async (req, res) => {
    try {
        const admin = await User.findById(req.params.id);
        if (!admin) return res.status(404).json({ message: 'User not found' });
        if (admin.role === 'superadmin') return res.status(403).json({ message: 'Cannot delete superadmin' });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Admin deleted' });
    } catch { res.status(500).json({ message: 'Failed to delete admin' }); }
});

// GET /api/superadmin/users
router.get('/users', async (_req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'superadmin' } }).select('-password').sort({ createdAt: -1 }).lean();
        res.json(users);
    } catch { res.status(500).json({ message: 'Failed to fetch users' }); }
});

// PUT /api/superadmin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!['customer', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'superadmin') return res.status(403).json({ message: 'Cannot change superadmin role' });
        user.role = role;
        await user.save();
        res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
    } catch { res.status(500).json({ message: 'Failed to update role' }); }
});

// GET /api/superadmin/system
router.get('/system', async (_req, res) => {
    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const collectionStats = await Promise.all(
            collections.map(async (c) => ({ name: c.name, count: await db.collection(c.name).countDocuments() }))
        );
        res.json({
            nodeEnv: process.env.NODE_ENV || 'development',
            port: process.env.PORT || 5000,
            dbName: db.databaseName,
            dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            uptime: Math.floor(process.uptime()),
            collections: collectionStats,
        });
    } catch { res.status(500).json({ message: 'Failed to fetch system info' }); }
});

// POST /api/superadmin/seed-admin
router.post('/seed-admin', async (_req, res) => {
    try {
        const hash = await bcrypt.hash('Admin@1402', 12);
        const admin = await User.findOneAndUpdate(
            { email: 'admin@aaro.com' },
            { name: 'Admin', email: 'admin@aaro.com', password: hash, role: 'admin', phone: '7094223143' },
            { upsert: true, new: true }
        );
        res.json({ message: 'Default admin seeded', email: admin.email });
    } catch { res.status(500).json({ message: 'Failed to seed admin' }); }
});

export default router;
