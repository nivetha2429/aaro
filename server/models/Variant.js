import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    ram: { type: String, required: true },
    storage: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    sku: { type: String },
    isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

// Prevent duplicate RAM + Storage + Color combinations for the same product
variantSchema.index({ productId: 1, ram: 1, storage: 1, color: 1 }, { unique: true });

export default mongoose.model('Variant', variantSchema);
