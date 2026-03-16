import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductModel' },
    category: { type: String, required: true, enum: ['phone', 'laptop', 'accessory'] },

    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    description: { type: String, required: true },
    images: [{ type: String }],
    videoUrl: { type: String, default: '' },
    specifications: {
        display: { type: String, default: '' },
        processor: { type: String, default: '' },
        ram: { type: String, default: '' },
        storage: { type: String, default: '' },
        battery: { type: String, default: '' },
        camera: { type: String, default: '' },   // phones
        graphics: { type: String, default: '' },  // laptops
    },
    features: [{ type: String }],
    featured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    tag: { type: String, default: '' },
    condition: { type: String, enum: ['new', 'refurbished'], default: 'new' },
}, { timestamps: true });

// Indexes for fast product lookups
productSchema.index({ category: 1 });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ isTrending: 1 });
productSchema.index({ condition: 1 });

export default mongoose.model('Product', productSchema);
