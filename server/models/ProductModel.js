import mongoose from 'mongoose';

const productModelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true, enum: ['phone', 'laptop'] },
    brand: { type: String, required: true },
    specificationsTemplate: {
        display: { type: String, default: '' },
        processor: { type: String, default: '' },
        ram: { type: String, default: '' },
        storage: { type: String, default: '' },
        battery: { type: String, default: '' },
        camera: { type: String, default: '' },
        graphics: { type: String, default: '' }
    },
    featuresTemplate: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('ProductModel', productModelSchema);
