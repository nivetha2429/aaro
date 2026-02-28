import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import { fileURLToPath } from 'url';

import Product from './models/Product.js';
import User from './models/User.js';
import Order from './models/Order.js';
import Category from './models/Category.js';
import Brand from './models/Brand.js';
import Review from './models/Review.js';
import Offer from './models/Offer.js';
import ProductModel from './models/ProductModel.js';
import Variant from './models/Variant.js';
import { authMiddleware, isAdmin } from './middleware/authMiddleware.js';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
    origin: [
        'https://aaro-8w5a.onrender.com',
        'http://localhost:8000',
        'http://localhost:8080',
        'http://localhost:3000'
    ],
    credentials: true
}));

// Parse JSON first
app.use(express.json({ limit: '10mb' }));

// Serve uploaded images
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

// Serve React frontend build
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_me';

const connectDB = async () => {
    let mongoUri = process.env.MONGODB_URI;
    try {
        if (mongoUri) {
            console.log(`Verifying connection to MongoDB...`);
            await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
            console.log('Connected to MongoDB successfully!');
        } else {
            throw new Error('MONGODB_URI not provided, falling back to Memory Server');
        }
    } catch (err) {
        console.log(`${err.message}. Initializing Fallback Memory Server...`);
        try {
            const mongoServer = await MongoMemoryServer.create({ binary: { version: '6.0.0' } });
            const memoryUri = mongoServer.getUri();
            await mongoose.connect(memoryUri);
            console.log('Connected to MongoDB Memory Server');
        } catch (memErr) {
            console.error('All database connections failed:', memErr);
        }
    }
};

connectDB();

// ─────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password || !phone)
            return res.status(400).json({ message: "All fields including phone are required" });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, password: hashedPassword, phone });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;

        await user.save();
        res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
});

// ─────────────────────────────────────────────
// PRODUCT ROUTES
// ─────────────────────────────────────────────

const DEFAULT_REVIEWS = [
    { name: "Priya S.", comment: "Absolutely love it! Build quality is premium and the performance is outstanding.", rating: 5 },
    { name: "Rahul M.", comment: "Great value for money. Highly recommend to anyone looking for a reliable device.", rating: 4 },
    { name: "Asha K.", comment: "Delivered quickly. Exactly as described. Very satisfied with this purchase!", rating: 5 },
];

app.get('/api/products', async (req, res) => {
    try {
        const [products, variants] = await Promise.all([
            Product.find(),
            Variant.find()
        ]);
        const variantMap = {};
        variants.forEach(v => {
            const key = v.productId.toString();
            if (!variantMap[key]) variantMap[key] = [];
            variantMap[key].push(v);
        });
        const result = products.map(p => ({
            ...p.toObject(),
            variants: variantMap[p._id.toString()] || []
        }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new product
app.post('/api/products', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { name, brand, category, description, images, specifications, features, videoUrl, modelId, variants } = req.body;

        // Validate model/brand/category consistency
        if (modelId) {
            const pModel = await ProductModel.findById(modelId);
            if (!pModel) return res.status(400).json({ message: 'Invalid Model ID' });
            if (pModel.category !== category) return res.status(400).json({ message: 'Model does not belong to the selected category' });
            if (pModel.brand !== brand) return res.status(400).json({ message: 'Brand mismatch for the selected model' });
        }

        const product = new Product({
            name, brand, category, description, images, specifications, features, videoUrl, modelId
        });
        await product.save();

        // If variants are provided during creation
        if (variants && Array.isArray(variants)) {
            const variantDocs = variants.map(v => ({ ...v, productId: product._id }));
            await Variant.insertMany(variantDocs);
        }

        // Auto-create default reviews
        const reviewTexts = [
            "Amazing build quality and performance. Worth every penny!",
            "Simply the best in its class. Highly recommended.",
            "Been using it for a week, and I'm impressed with the battery life."
        ];
        const reviewerNames = ["Rahul Sharma", "Priya Patel", "Ankit Verma"];

        for (let i = 0; i < 3; i++) {
            const review = new Review({
                productId: product._id,
                name: reviewerNames[i],
                comment: reviewTexts[i],
                rating: 5
            });
            await review.save();
        }

        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/products/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/products/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        await Review.deleteMany({ productId: req.params.id });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// VARIANTS ROUTES
// ─────────────────────────────────────────────

app.get('/api/variants/:productId', async (req, res) => {
    try {
        const variants = await Variant.find({ productId: req.params.productId }).sort({ price: 1 });
        res.json(variants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/variants', authMiddleware, isAdmin, async (req, res) => {
    try {
        const variant = new Variant(req.body);
        await variant.save();
        res.status(201).json(variant);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/variants/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const variant = await Variant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(variant);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/variants/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await Variant.findByIdAndDelete(req.params.id);
        res.json({ message: 'Variant deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// PRODUCT MODELS ROUTES
// ─────────────────────────────────────────────

app.get('/api/models', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};
        const models = await ProductModel.find(filter).sort({ name: 1 });
        res.json(models);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/models', authMiddleware, isAdmin, async (req, res) => {
    try {
        const model = new ProductModel(req.body);
        await model.save();
        res.status(201).json(model);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// CATEGORY ROUTES
// ─────────────────────────────────────────────

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/categories', authMiddleware, isAdmin, async (req, res) => {
    try {
        const category = new Category(req.body);
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/categories/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/categories/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// BRAND ROUTES
// ─────────────────────────────────────────────

app.get('/api/brands', async (req, res) => {
    try {
        const brands = await Brand.find();
        res.json(brands);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/brands', authMiddleware, isAdmin, async (req, res) => {
    try {
        const brand = new Brand(req.body);
        await brand.save();
        res.status(201).json(brand);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/brands/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(brand);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/brands/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await Brand.findByIdAndDelete(req.params.id);
        res.json({ message: 'Brand deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// REVIEWS ROUTES
// ─────────────────────────────────────────────

app.get('/api/reviews/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/reviews', authMiddleware, async (req, res) => {
    try {
        const { productId, comment, rating } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const review = await Review.create({
            productId,
            userId: req.userId,
            name: user.name,
            comment,
            rating: Number(rating)
        });

        // Update product review count and rating
        const allReviews = await Review.find({ productId });
        const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
        await Product.findByIdAndUpdate(productId, {
            reviewCount: allReviews.length,
            rating: Math.round(avgRating * 10) / 10
        });

        res.status(201).json(review);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/reviews/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        // Recalculate product rating
        const remaining = await Review.find({ productId: review.productId });
        const avgRating = remaining.length > 0
            ? remaining.reduce((a, r) => a + r.rating, 0) / remaining.length
            : 0;
        await Product.findByIdAndUpdate(review.productId, {
            reviewCount: remaining.length,
            rating: Math.round(avgRating * 10) / 10
        });

        res.json({ message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// OFFER ROUTES
// ─────────────────────────────────────────────

app.get('/api/offers', async (req, res) => {
    try {
        const offers = await Offer.find().sort({ createdAt: -1 });
        res.json(offers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/offers/active', async (req, res) => {
    try {
        const offer = await Offer.findOne({ active: true });
        res.json(offer || null);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/offers', authMiddleware, isAdmin, async (req, res) => {
    try {
        const offer = new Offer(req.body);
        if (offer.active) {
            await Offer.updateMany({}, { active: false });
        }
        const newOffer = await offer.save();
        res.status(201).json(newOffer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/offers/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        if (req.body.active) {
            await Offer.updateMany({ _id: { $ne: req.params.id } }, { active: false });
        }
        const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedOffer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/offers/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await Offer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Offer deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// ORDER ROUTES
// ─────────────────────────────────────────────

app.post('/api/orders', authMiddleware, async (req, res) => {
    try {
        const order = await Order.create({
            userId: req.userId,
            items: req.body.items,
            totalAmount: req.body.totalAmount,
            shippingAddress: req.body.shippingAddress
        });
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: "Order creation failed" });
    }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});

app.get('/api/admin/orders', authMiddleware, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch all orders" });
    }
});

app.put('/api/admin/orders/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: "Failed to update order" });
    }
});

// ─────────────────────────────────────────────
// FILE UPLOAD ROUTE
// ─────────────────────────────────────────────

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsPath),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files allowed'));
    }
});

app.post('/api/upload', authMiddleware, isAdmin, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Upload multiple images at once (up to 4)
app.post('/api/upload/multiple', authMiddleware, isAdmin, upload.array('images', 4), (req, res) => {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });
    const urls = req.files.map(f => `${req.protocol}://${req.get('host')}/uploads/${f.filename}`);
    res.json({ urls });
});

// ─────────────────────────────────────────────
// SPA CATCH-ALL
// ─────────────────────────────────────────────

app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Global error handler — catches unhandled errors in routes
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
