import express from 'express';
import User from '../models/User.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/admin/users — list all users (admin only)
router.get('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id — toggle active status (admin only)
router.patch('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot modify admin users' });

    user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
    await user.save();

    const { password, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

export default router;
