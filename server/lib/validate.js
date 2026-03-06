import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(80),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const profileSchema = z.object({
    name: z.string().min(2).max(80).optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional(),
});

export const reviewSchema = z.object({
    productId: z.string().min(1, 'Product ID required'),
    comment: z.string().min(3, 'Comment too short').max(1000),
    rating: z.number().int().min(1).max(5),
});

export const orderSchema = z.object({
    items: z.array(z.object({
        name: z.string().min(1),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        price: z.number().positive('Price must be positive'),
    })).min(1, 'Order must have at least one item'),
    totalAmount: z.number().positive('Total must be positive'),
    shippingAddress: z.string().min(10, 'Address too short').max(500),
});

export const orderStatusSchema = z.object({
    status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], {
        errorMap: () => ({ message: 'Invalid order status' }),
    }),
});

// ── Admin CRUD Schemas ──

const variantSchema = z.object({
    _id: z.string().optional(),
    ram: z.string().min(1),
    storage: z.string().min(1),
    color: z.string().min(1),
    price: z.number().positive(),
    originalPrice: z.number().positive(),
    stock: z.number().int().min(0).default(0),
    sku: z.string().optional(),
    isAvailable: z.boolean().optional(),
});

export const productSchema = z.object({
    name: z.string().min(1, 'Product name is required').max(200),
    brand: z.string().min(1, 'Brand is required').max(100),
    category: z.enum(['phone', 'laptop'], { errorMap: () => ({ message: 'Category must be phone or laptop' }) }),
    description: z.string().min(1, 'Description is required').max(5000),
    images: z.array(z.string().url()).default([]),
    videoUrl: z.string().max(500).default(''),
    specifications: z.object({
        display: z.string().max(200).default(''),
        processor: z.string().max(200).default(''),
        ram: z.string().max(100).default(''),
        storage: z.string().max(100).default(''),
        battery: z.string().max(100).default(''),
        camera: z.string().max(200).default(''),
        graphics: z.string().max(200).default(''),
    }).default({}),
    features: z.array(z.string().max(500)).default([]),
    modelId: z.string().optional(),
    tag: z.string().max(50).default(''),
    featured: z.boolean().default(false),
    isTrending: z.boolean().default(false),
    variants: z.array(variantSchema).optional(),
});

export const brandSchema = z.object({
    name: z.string().min(1, 'Brand name is required').max(100),
    slug: z.string().min(1).max(150),
    category: z.string().min(1, 'Category is required').max(50),
    description: z.string().max(500).default(''),
    image: z.string().max(500).default(''),
    productCount: z.number().int().min(0).default(0),
});

export const categorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(100),
    slug: z.string().min(1).max(150),
    description: z.string().max(500).default(''),
    image: z.string().max(500).default(''),
    productCount: z.number().int().min(0).default(0),
});

export const offerSchema = z.object({
    title: z.string().max(200).default(''),
    description: z.string().max(1000).default(''),
    discount: z.number().min(0).max(100).default(0),
    code: z.string().max(50).default(''),
    image: z.string().max(500).default(''),
    active: z.boolean().default(false),
    tag: z.string().max(100).default(''),
});

export const variantStandaloneSchema = z.object({
    productId: z.string().min(1),
    ram: z.string().min(1),
    storage: z.string().min(1),
    color: z.string().min(1),
    price: z.number().positive(),
    originalPrice: z.number().positive(),
    stock: z.number().int().min(0).default(0),
    sku: z.string().optional(),
});

export const productModelSchema = z.object({
    name: z.string().min(1).max(200),
    category: z.enum(['phone', 'laptop']),
    brand: z.string().min(1).max(100),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters').max(128),
});

/** Format zod error into a single readable string */
export const zodError = (err) => err.errors.map(e => e.message).join(', ');

/** Safe Mongoose error — never exposes stack traces */
export const mongoError = (err) => {
    if (err.name === 'ValidationError') {
        return Object.values(err.errors).map(e => e.message).join(', ');
    }
    if (err.name === 'CastError') return 'Invalid ID format';
    if (err.code === 11000) return 'Duplicate entry — this record already exists';
    return 'Operation failed';
};
