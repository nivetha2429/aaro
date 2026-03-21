import { Router } from 'express';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import Review from '../models/Review.js';
import ProductModel from '../models/ProductModel.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { mongoError, productSchema, variantStandaloneSchema, productModelSchema, zodError } from '../lib/validate.js';
import { getCache, setCache, invalidateCache } from '../lib/cache.js';

const router = Router();

// GET /api/products — supports optional ?page=&limit= for pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const category = req.query.category;
        const brand = req.query.brand;

        // Validate category enum
        const validCategories = ['phone', 'laptop', 'accessory'];
        if (category && !validCategories.includes(category)) {
            return res.status(400).json({ message: 'Invalid category. Must be one of: phone, laptop, accessory' });
        }

        // Check in-memory cache (skip for paginated requests — admin use case)
        const cacheKey = `products:${category || 'all'}:${brand || 'all'}:${page}`;
        if (page === 0) {
            const cached = getCache(cacheKey);
            if (cached) {
                res.set('Cache-Control', 'public, max-age=60');
                return res.json(cached);
            }
        }

        const filter = {};
        if (category) filter.category = category;
        if (brand) filter.brand = brand;

        let productsQuery = Product.find(filter).sort({ createdAt: -1 }).lean();

        let total;
        if (page > 0) {
            total = await Product.countDocuments(filter);
            productsQuery = productsQuery.skip((page - 1) * limit).limit(limit);
        }

        const products = await productsQuery;
        const productIds = products.map(p => p._id);
        const variants = await Variant.find({ productId: { $in: productIds } }).lean();

        const variantMap = {};
        variants.forEach(v => {
            const key = v.productId.toString();
            if (!variantMap[key]) variantMap[key] = [];
            variantMap[key].push(v);
        });

        const result = products.map(p => ({ ...p, variants: variantMap[p._id.toString()] || [] }));

        res.set('Cache-Control', 'public, max-age=60');
        if (page > 0) {
            return res.json({ products: result, total, page, pages: Math.ceil(total / limit) });
        }

        // Store in cache for 60 seconds
        setCache(cacheKey, result, 60_000);
        res.json(result);
    } catch (err) {
        console.error('Failed to fetch products:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ── Variants — must be registered BEFORE /:id to avoid route conflict ──

// GET /api/products/variants/:productId
router.get('/variants/:productId', async (req, res) => {
    try {
        const variants = await Variant.find({ productId: req.params.productId }).lean().sort({ price: 1 });
        res.json(variants);
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/variants', authMiddleware, isAdmin, async (req, res) => {
    try {
        const parsed = variantStandaloneSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        if (parsed.data.price > parsed.data.originalPrice) {
            return res.status(400).json({ message: 'Price cannot be greater than original price' });
        }
        const variant = await new Variant(parsed.data).save();
        invalidateCache('products:');
        res.status(201).json(variant);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.put('/variants/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const parsed = variantStandaloneSchema.partial().safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        if (parsed.data.price !== undefined && parsed.data.originalPrice !== undefined && parsed.data.price > parsed.data.originalPrice) {
            return res.status(400).json({ message: 'Price cannot be greater than original price' });
        }
        const variant = await Variant.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
        if (!variant) return res.status(404).json({ message: 'Variant not found' });
        invalidateCache('products:');
        res.json(variant);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.delete('/variants/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const deleted = await Variant.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Variant not found' });
        invalidateCache('products:');
        res.json({ message: 'Variant deleted' });
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ── Product Models — must be registered BEFORE /:id to avoid route conflict ──

router.get('/models', async (req, res) => {
    try {
        const { category } = req.query;
        const models = await ProductModel.find(category ? { category } : {}).lean().sort({ name: 1 });
        res.json(models);
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/models', authMiddleware, isAdmin, async (req, res) => {
    try {
        const parsed = productModelSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        const model = await new ProductModel(parsed.data).save();
        res.status(201).json(model);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

// ── Single product by ID — must come AFTER all static-segment routes ──

// POST /api/products
router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const parsed = productSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        const { name, brand, category, description, images, specifications, features, videoUrl, modelId, variants, tag, featured, isTrending } = parsed.data;

        if (modelId) {
            const pModel = await ProductModel.findById(modelId);
            if (!pModel) return res.status(400).json({ message: 'Invalid Model ID' });
            if (pModel.category !== category) return res.status(400).json({ message: 'Model does not belong to the selected category' });
            if (pModel.brand !== brand) return res.status(400).json({ message: 'Brand mismatch for the selected model' });
        }

        const product = await new Product({ name, brand, category, description, images, specifications, features, videoUrl, modelId, tag, featured: !!featured, isTrending: !!isTrending }).save();

        if (variants?.length) {
            await Variant.insertMany(variants.map(v => ({ ...v, productId: product._id })));
        }

        invalidateCache('products:');
        res.status(201).json(product.toObject());
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const variants = await Variant.find({ productId: req.params.id }).lean().sort({ price: 1 });
        res.set('Cache-Control', 'public, max-age=60');
        res.json({ ...product, variants });
    } catch { res.status(500).json({ message: 'Internal server error' }); }
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const parsed = productSchema.partial().safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: zodError(parsed.error) });
        const { variants, ...productData } = parsed.data;
        const updated = await Product.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'Product not found' });
        invalidateCache('products:');

        if (variants?.length) {
            const existing = await Variant.find({ productId: req.params.id });
            const existingIds = existing.map(v => v._id.toString());
            const toUpdate = variants.filter(v => v._id);
            const toCreate = variants.filter(v => !v._id);
            const incomingIds = toUpdate.map(v => v._id.toString());
            const toDelete = existingIds.filter(id => !incomingIds.includes(id));

            await Promise.all([
                ...toUpdate.map(v => Variant.findByIdAndUpdate(v._id, v, { new: true })),
                toCreate.length ? Variant.insertMany(toCreate.map(v => ({ ...v, productId: req.params.id }))) : null,
                toDelete.length ? Variant.deleteMany({ _id: { $in: toDelete } }) : null,
            ].filter(Boolean));
        }

        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

// DELETE /api/products/:id
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Product not found' });
        invalidateCache('products:');
        try {
            await Promise.all([
                Review.deleteMany({ productId: req.params.id }),
                Variant.deleteMany({ productId: req.params.id }),
            ]);
        } catch (cleanupErr) {
            console.error('Error cleaning up reviews/variants:', cleanupErr);
        }
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error('Failed to delete product:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
