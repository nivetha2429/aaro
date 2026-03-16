import express from 'express';
import User from '../models/User.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { userToggleSchema, zodError } from '../lib/validate.js';

const router = express.Router();

// GET /api/admin/users — list all users (admin only)
router.get('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

    const [users, total] = await Promise.all([
      User.find({})
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments({}),
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id — toggle active status (admin only)
router.patch('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const parsed = userToggleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });

    // Prevent admin from deactivating themselves
    if (req.userId === req.params.id) {
      return res.status(403).json({ message: 'Cannot deactivate your own admin account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot modify admin users' });

    user.isActive = parsed.data.isActive;
    await user.save();

    const { password, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

export default router;
