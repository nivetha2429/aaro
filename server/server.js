import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import fs from 'fs';
import pino from 'pino';
import pinoHttp from 'pino-http';

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
    process.stderr.write('FATAL: JWT_SECRET is not set. Refusing to start.\n');
    process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ── Structured Logger ──
const logger = pino({ level: IS_PROD ? 'info' : 'debug' });

// ── Compression (gzip) ──
app.use(compression());

// ── Security Headers ──
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind CSS requires inline styles
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            fontSrc: ["'self'", 'https:'],
            connectSrc: ["'self'", 'https:'],
            mediaSrc: ["'self'", 'https:', 'blob:'],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: IS_PROD ? [] : null,
        },
    },
}));

// ── CORS ──
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['https://aaro-8w5a.onrender.com'];

if (!IS_PROD) {
    allowedOrigins.push('http://localhost:8000', 'http://localhost:5173', 'http://localhost:3000');
}

app.use(cors({
    origin: (origin, callback) => {
        const isLocal = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'));
        if ((!IS_PROD && !origin) || allowedOrigins.includes(origin) || (!IS_PROD && isLocal)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// ── Request Logging (pino-http replaces morgan) ──
app.use(pinoHttp({ logger, genReqId: () => crypto.randomUUID() }));

// ── Body Parsing (500kb limit prevents JSON body DoS) ──
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));
app.use(mongoSanitize());

// ── Global API Rate Limiter (100 req / 15 min per IP) ──
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (_req) => !IS_PROD, // only enforce in production
});
app.use('/api', globalLimiter);

// ── Health Check (Render needs this) ──
app.get('/health', (_req, res) => {
    const dbState = mongoose.connection.readyState;
    // 1 = connected, 2 = connecting, 0/3 = disconnected/disconnecting
    if (dbState === 1) return res.status(200).json({ status: 'ok', db: 'connected' });
    if (dbState === 2) return res.status(503).json({ status: 'starting', db: 'connecting' });
    res.status(503).json({ status: 'degraded', db: 'disconnected' });
});

// ── Static: Uploads ──
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

// ── API Routes (must come before static/SPA catch-all) ──
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/brands', brandRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/offers', offerRouter);
app.use('/api/orders', orderRouter);
app.use('/api/upload', createUploadRouter(uploadsPath));

// ── Static: React Frontend & SPA Catch-all ──
const distPath = path.join(__dirname, '..', 'dist');
const indexHtml = path.join(distPath, 'index.html');
app.use(express.static(distPath));
app.use((_req, res, next) => {
    // API / uploads / health are handled above — skip them
    if (_req.path.startsWith('/api') || _req.path.startsWith('/uploads') || _req.path === '/health') {
        return next();
    }
    // Always send index.html so React Router handles the URL on the client
    res.sendFile(indexHtml, (err) => {
        if (err) next(err); // fall to global error handler (404 / ENOENT in dev without build)
    });
});

// ── Global Error Handler ──
app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    logger.error({ status, err }, err.message);
    res.status(status).json({ message: IS_PROD ? 'Internal server error' : err.message });
});

// ── Database Connection ──
const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        logger.error('MONGODB_URI is not set in .env — cannot start server');
        process.exit(1);
    }
    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 30000 });
        logger.info('Connected to MongoDB Atlas');
    } catch (err) {
        logger.error({ err }, `MongoDB connection failed: ${err.message}`);
        logger.error('Check that MONGODB_URI in server/.env is correct and your IP is whitelisted in Atlas.');
        process.exit(1);
    }
};

connectDB().then(() => {
    const server = app.listen(PORT, '0.0.0.0', () => {
        logger.info(`Server on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });

    // ── Graceful Shutdown ──
    const shutdown = (signal) => {
        logger.info(`${signal} received — shutting down gracefully…`);
        server.close(() => {
            mongoose.connection.close().then(() => {
                logger.info('MongoDB connection closed');
                process.exit(0);
            });
        });
        setTimeout(() => { logger.error('Forced exit after timeout'); process.exit(1); }, 10000);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
});

// ── Crash Safety ──
process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'unhandledRejection');
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    logger.error({ err }, 'uncaughtException');
    process.exit(1);
});
