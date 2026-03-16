import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { uploadBuffer, isConfigured as cloudinaryConfigured } from '../lib/cloudinary.js';

const router = Router();

const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { message: 'Too many uploads, slow down' },
});

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg'];

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype.startsWith('image/') && ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpg, png, webp, gif, avif, svg) are allowed'));
    }
};

// Use memory storage when Cloudinary is configured, disk otherwise
const getStorage = (uploadsPath) => cloudinaryConfigured
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadsPath),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
        },
    });

export const createUploadRouter = (uploadsPath) => {
    const storage = getStorage(uploadsPath);
    const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

    const handleUpload = async (req, res, file) => {
        try {
            if (cloudinaryConfigured) {
                const url = await uploadBuffer(file.buffer, {
                    public_id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                });
                return res.json({ url });
            }
            res.json({ url: `/uploads/${file.filename}` });
        } catch {
            res.status(500).json({ message: 'Upload failed' });
        }
    };

    router.post('/', uploadLimiter, authMiddleware, isAdmin, upload.single('image'), async (req, res) => {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        await handleUpload(req, res, req.file);
    });

    router.post('/multiple', uploadLimiter, authMiddleware, isAdmin, upload.array('images', 4), async (req, res) => {
        if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' });
        try {
            const urls = await Promise.all(req.files.map(async (file) => {
                if (cloudinaryConfigured) return uploadBuffer(file.buffer);
                return `/uploads/${file.filename}`;
            }));
            res.json({ urls });
        } catch {
            res.status(500).json({ message: 'Upload failed' });
        }
    });

    return router;
};

export default router;
