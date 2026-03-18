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
        product: z.any(),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        price: z.number().positive('Price must be positive'),
        ram: z.string().optional(),
        storage: z.string().optional(),
        color: z.string().optional(),
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
    condition: z.enum(['new', 'refurbished']).default('new'),
}).refine(data => data.price <= data.originalPrice, {
    message: 'Price cannot be greater than original price',
    path: ['price'],
});

export const productSchema = z.object({
    name: z.string().min(1, 'Product name is required').max(200),
    brand: z.string().min(1, 'Brand is required').max(100),
    category: z.enum(['phone', 'laptop', 'accessory'], { errorMap: () => ({ message: 'Category must be phone, laptop or accessory' }) }),
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
    condition: z.enum(['new', 'refurbished']).default('new'),
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
    condition: z.enum(['new', 'refurbished']).default('new'),
}).refine(data => data.price <= data.originalPrice, {
    message: 'Price cannot be greater than original price',
    path: ['price'],
});

export const productModelSchema = z.object({
    name: z.string().min(1).max(200),
    category: z.enum(['phone', 'laptop', 'accessory']),
    brand: z.string().min(1).max(100),
});

export const bannerSchema = z.object({
    image: z.string().min(1, 'Image URL is required'),
    title: z.string().max(200).optional().default(''),
    subtitle: z.string().max(500).optional().default(''),
    link: z.string().max(500).optional().default('/shop').refine(
        link => link.startsWith('/') || link.startsWith('https://'),
        'Link must start with / or https://'
    ),
    position: z.enum(['hero', 'center']).optional().default('hero'),
    order: z.number().int().min(0).optional().default(0),
    active: z.boolean().optional().default(true),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters').max(128),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters').max(128),
});

// ── Contact Settings Schema ──

const branchSettingsSchema = z.object({
    _id: z.string().optional(),
    name: z.string().min(1, 'Branch name is required').max(200),
    address: z.string().min(1, 'Address is required').max(500),
    phone: z.string().min(1, 'Phone is required').max(30),
    whatsapp: z.string().min(1, 'WhatsApp number is required').max(20),
    hours: z.string().max(200).default(''),
    closed: z.string().max(200).default(''),
    mapUrl: z.string().max(500).default(''),
});

export const contactSettingsSchema = z.object({
    phone: z.string().max(30).default(''),
    email: z.string().max(200).default(''),
    address: z.string().max(500).default(''),
    whatsappNumber: z.string().max(20).default(''),
    instagramUrl: z.string().max(500).default(''),
    instagramHandle: z.string().max(100).default(''),
    whatsappGroupLink: z.string().max(500).default(''),
    logoUrl: z.string().max(500).optional().default(''),
    branches: z.array(branchSettingsSchema).default([]),
});

// ── Admin Credentials Schemas ──

export const adminUpdateEmailSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newEmail: z.string().email('Invalid email address'),
    confirmEmail: z.string().email('Invalid email address'),
}).refine(d => d.newEmail === d.confirmEmail, { message: 'Emails do not match', path: ['confirmEmail'] });

export const adminUpdatePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

// ── Admin User Toggle Schema ──

export const userToggleSchema = z.object({
    isActive: z.boolean({ required_error: 'isActive is required' }),
});

// ── Review Update Schema ──

export const reviewUpdateSchema = z.object({
    comment: z.string().min(3, 'Comment too short').max(1000),
    rating: z.number().int().min(1).max(5),
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
