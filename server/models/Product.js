import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductModel' },
    category: { type: String, required: true, enum: ['phone', 'laptop'] },

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
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
