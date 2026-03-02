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
