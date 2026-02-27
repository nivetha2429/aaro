import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

import Product from './models/Product.js';
import User from './models/User.js';
import Order from './models/Order.js';
import Category from './models/Category.js';
import { authMiddleware, isAdmin } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
            const mongoServer = await MongoMemoryServer.create({
                binary: {
                    version: '6.0.0'
                }
            });
            const memoryUri = mongoServer.getUri();
            await mongoose.connect(memoryUri);
            console.log('Connected to MongoDB Memory Server');


        } catch (memErr) {
            console.error('All database connections failed:', memErr);
        }
    }
};

connectDB();

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields including phone are required" });
        }
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
        const user = await User.findById(req.user.id);

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

// --- Product Routes ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/products', authMiddleware, isAdmin, async (req, res) => {
    const product = new Product(req.body);
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/products/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/products/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Category Routes ---
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/categories', authMiddleware, isAdmin, async (req, res) => {
    const category = new Category(req.body);
    try {
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

// --- Order Routes ---
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

// Admin Route: Get all orders
app.get('/api/admin/orders', authMiddleware, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch all orders" });
    }
});

// Admin Route: Update order status
app.put('/api/admin/orders/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: "Failed to update order" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
