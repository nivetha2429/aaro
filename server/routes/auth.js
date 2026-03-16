import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { registerSchema, loginSchema, profileSchema, changePasswordSchema, forgotPasswordSchema, adminUpdateEmailSchema, adminUpdatePasswordSchema, zodError } from '../lib/validate.js';

const router = Router();

// Login: 5 attempts per 15 min
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Register: 10 attempts per hour
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { message: 'Too many registration attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// General auth limiter (forgot-password, etc.)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Admin update email: 5 attempts per 15 min
const adminUpdateEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many email update attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Admin update password: 5 attempts per 15 min
const adminUpdatePasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many password update attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const IS_PROD = process.env.NODE_ENV === 'production';

// Access token: short-lived (15 min), sent in response body, stored in memory
const signAccess = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

// Refresh token: long-lived (7 days), set as HttpOnly cookie
const signRefresh = (user) =>
    jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Keep backward compat alias for admin credential routes that return a token
const sign = signAccess;

const REFRESH_COOKIE = 'aaro_refresh';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
};

const setRefreshCookie = (res, user) => {
    res.cookie(REFRESH_COOKIE, signRefresh(user), COOKIE_OPTIONS);
};

const safeUser = (user) => ({
    id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role,
});

// POST /api/auth/register
router.post('/register', registerLimiter, async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });

        const { name, email, password, phone } = parsed.data;

        if (await User.findOne({ email }))
            return res.status(400).json({ message: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, password: hashedPassword, phone });

        setRefreshCookie(res, user);
        res.status(201).json({ token: signAccess(user), user: safeUser(user) });
    } catch {
        res.status(500).json({ message: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });

        const { email, password } = parsed.data;
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (user.isActive === false) return res.status(403).json({ message: 'Account has been deactivated. Contact support.' });

        setRefreshCookie(res, user);
        res.json({ token: signAccess(user), user: safeUser(user) });
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

        // Check for duplicate email if email is being changed
        if (email && email !== user.email) {
            const existing = await User.findOne({ email, _id: { $ne: req.userId } });
            if (existing) return res.status(400).json({ message: 'Email already in use' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;

        await user.save();
        res.json({ user: safeUser(user) });
    } catch (err) {
        console.error('Profile update failed:', err);
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

// PATCH /api/auth/admin/update-email
router.patch('/admin/update-email', authMiddleware, isAdmin, adminUpdateEmailLimiter, async (req, res) => {
    try {
        const parsed = adminUpdateEmailSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });

        const user = await User.findById(req.userId).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(parsed.data.currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        const existing = await User.findOne({ email: parsed.data.newEmail, _id: { $ne: req.userId } });
        if (existing) return res.status(400).json({ message: 'Email already in use by another account' });

        user.email = parsed.data.newEmail;
        await user.save();

        res.json({ message: 'Email updated successfully', user: safeUser(user), token: sign(user) });
    } catch { res.status(500).json({ message: 'Email update failed' }); }
});

// PATCH /api/auth/admin/update-password
router.patch('/admin/update-password', authMiddleware, isAdmin, adminUpdatePasswordLimiter, async (req, res) => {
    try {
        const parsed = adminUpdatePasswordSchema.safeParse(req.body);
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

// POST /api/auth/refresh — exchange refresh cookie for new access token
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];
        if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'User not found' });
        if (user.isActive === false) return res.status(403).json({ message: 'Account deactivated' });

        // Rotate refresh token for security
        setRefreshCookie(res, user);
        res.json({ token: signAccess(user), user: safeUser(user) });
    } catch {
        res.clearCookie(REFRESH_COOKIE, { path: '/' });
        res.status(401).json({ message: 'Invalid refresh token' });
    }
});

// POST /api/auth/logout — clear refresh cookie
router.post('/logout', (_req, res) => {
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    res.json({ message: 'Logged out' });
});

export default router;
