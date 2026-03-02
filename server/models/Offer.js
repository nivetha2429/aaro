import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    discount: { type: Number, default: 0 },
    code: { type: String, default: '' },
    image: { type: String, default: '' },
    active: { type: Boolean, default: false },
    tag: { type: String, default: '' },
}, { timestamps: true });

// No pre-save hook — active/inactive management is handled atomically in route handlers

export default mongoose.model('Offer', offerSchema);
