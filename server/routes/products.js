import { Router } from 'express';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import Review from '../models/Review.js';
import ProductModel from '../models/ProductModel.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { mongoError } from '../lib/validate.js';

const router = Router();

// GET /api/products — supports optional ?page=&limit= for pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit) || 50;
        const category = req.query.category;
        const brand = req.query.brand;

        const filter = {};
        if (category) filter.category = category;
        if (brand) filter.brand = brand;

        let productsQuery = Product.find(filter).sort({ createdAt: -1 });

        let total;
        if (page > 0) {
            total = await Product.countDocuments(filter);
            productsQuery = productsQuery.skip((page - 1) * limit).limit(limit);
        }

        const [products, variants] = await Promise.all([
            productsQuery,
            Variant.find(page > 0 ? {} : {}), // fetch all variants for client-side join
        ]);

        const variantMap = {};
        variants.forEach(v => {
            const key = v.productId.toString();
            if (!variantMap[key]) variantMap[key] = [];
            variantMap[key].push(v);
        });

        const result = products.map(p => ({ ...p.toObject(), variants: variantMap[p._id.toString()] || [] }));

        if (page > 0) {
            return res.json({ products: result, total, page, pages: Math.ceil(total / limit) });
        }
        res.json(result);
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/products
router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { name, brand, category, description, images, specifications, features, videoUrl, modelId, variants, tag } = req.body;

        if (modelId) {
            const pModel = await ProductModel.findById(modelId);
            if (!pModel) return res.status(400).json({ message: 'Invalid Model ID' });
            if (pModel.category !== category) return res.status(400).json({ message: 'Model does not belong to the selected category' });
            if (pModel.brand !== brand) return res.status(400).json({ message: 'Brand mismatch for the selected model' });
        }

        const product = await new Product({ name, brand, category, description, images, specifications, features, videoUrl, modelId, tag }).save();

        if (variants?.length) {
            await Variant.insertMany(variants.map(v => ({ ...v, productId: product._id })));
        }

        // Auto-create 3 default reviews
        await Review.insertMany([
            { productId: product._id, name: 'Rahul Sharma', comment: 'Amazing build quality and performance. Worth every penny!', rating: 5 },
            { productId: product._id, name: 'Priya Patel', comment: 'Simply the best in its class. Highly recommended.', rating: 5 },
            { productId: product._id, name: 'Ankit Verma', comment: "Been using it for a week, and I'm impressed with the battery life.", rating: 5 },
        ]);

        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { variants, ...productData } = req.body;
        const updated = await Product.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'Product not found' });

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
        await Promise.all([
            Product.findByIdAndDelete(req.params.id),
            Review.deleteMany({ productId: req.params.id }),
            Variant.deleteMany({ productId: req.params.id }),
        ]);
        res.json({ message: 'Product deleted' });
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ── Variants ──

// GET /api/products/variants/:productId
router.get('/variants/:productId', async (req, res) => {
    try {
        const variants = await Variant.find({ productId: req.params.productId }).sort({ price: 1 });
        res.json(variants);
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/variants', authMiddleware, isAdmin, async (req, res) => {
    try {
        const variant = await new Variant(req.body).save();
        res.status(201).json(variant);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.put('/variants/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const variant = await Variant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json(variant);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

router.delete('/variants/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await Variant.findByIdAndDelete(req.params.id);
        res.json({ message: 'Variant deleted' });
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ── Product Models ──

router.get('/models', async (req, res) => {
    try {
        const { category } = req.query;
        const models = await ProductModel.find(category ? { category } : {}).sort({ name: 1 });
        res.json(models);
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/models', authMiddleware, isAdmin, async (req, res) => {
    try {
        const model = await new ProductModel(req.body).save();
        res.status(201).json(model);
    } catch (err) {
        res.status(400).json({ message: mongoError(err) });
    }
});

export default router;
