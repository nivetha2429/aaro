import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';

import authRouter from './routes/auth.js';
import productRouter from './routes/products.js';
import categoryRouter from './routes/categories.js';
import brandRouter from './routes/brands.js';
import reviewRouter from './routes/reviews.js';
import offerRouter from './routes/offers.js';
import orderRouter from './routes/orders.js';
import { createUploadRouter } from './routes/upload.js';

dotenv.config();

// ── Validate required env vars at startup ──
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set. Refusing to start.');
    process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Headers ──
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
}));

// ── CORS ──
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['https://aaro-8w5a.onrender.com'];

if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:8000', 'http://localhost:5173', 'http://localhost:3000');
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// ── Request Logging ──
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Body Parsing ──
app.use(express.json({ limit: '10mb' }));

// ── Static: Uploads (local fallback) ──
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

// ── Static: React Frontend ──
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// ── API Routes ──
app.use('/api/auth',       authRouter);
app.use('/api/products',   productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/brands',     brandRouter);
app.use('/api/reviews',    reviewRouter);
app.use('/api/offers',     offerRouter);
app.use('/api/orders',     orderRouter);
app.use('/api/upload',     createUploadRouter(uploadsPath));

// ── SPA Catch-all ──
app.get(/^(?!\/api|\/uploads).*$/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// ── Global Error Handler ──
app.use((err, _req, res, _next) => {
    console.error(`[${new Date().toISOString()}] Unhandled error: ${err.message}`);
    res.status(err.status || 500).json({ message: 'Internal server error' });
});

// ── Database Connection ──
const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;
    try {
        if (mongoUri) {
            await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
            console.log('✓ Connected to MongoDB');
        } else {
            throw new Error('MONGODB_URI not set');
        }
    } catch (err) {
        console.warn(`MongoDB failed (${err.message}). Using in-memory fallback...`);
        try {
            const memServer = await MongoMemoryServer.create({ binary: { version: '6.0.0' } });
            await mongoose.connect(memServer.getUri());
            console.log('✓ Connected to MongoDB Memory Server');
        } catch (memErr) {
            console.error('✗ All DB connections failed:', memErr.message);
        }
    }
};

connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✓ Server on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
});
