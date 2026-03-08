import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { registerSchema, loginSchema, profileSchema, changePasswordSchema, forgotPasswordSchema, zodError } from '../lib/validate.js';

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const sign = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (user) => ({
    id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role,
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });

        const { name, email, password, phone } = parsed.data;

        if (await User.findOne({ email }))
            return res.status(400).json({ message: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, password: hashedPassword, phone });

        res.status(201).json({ token: sign(user), user: safeUser(user) });
    } catch {
        res.status(500).json({ message: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });

        const { email, password } = parsed.data;
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        res.json({ token: sign(user), user: safeUser(user) });
    } catch {
        res.status(500).json({ message: 'Login failed' });
    }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const parsed = profileSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, phone } = parsed.data;
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;

        await user.save();
        res.json({ user: safeUser(user) });
    } catch {
        res.status(500).json({ message: 'Update failed' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req, res) => {
    try {
        const parsed = forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });

        const { email, phone, newPassword } = parsed.data;
        const user = await User.findOne({ email });

        if (!user || user.phone !== phone) {
            return res.status(400).json({ message: 'No account found with this email and phone combination' });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.json({ message: 'Password reset successfully. Please login with your new password.' });
    } catch {
        res.status(500).json({ message: 'Password reset failed' });
    }
});

// PUT /api/auth/password
router.put('/password', authMiddleware, async (req, res) => {
    try {
        const parsed = changePasswordSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        const user = await User.findById(req.userId).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        const isMatch = await bcrypt.compare(parsed.data.currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
        user.password = await bcrypt.hash(parsed.data.newPassword, 12);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch { res.status(500).json({ message: 'Password update failed' }); }
});

export default router;
