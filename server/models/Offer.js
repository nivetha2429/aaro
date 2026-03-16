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

offerSchema.index({ active: 1 });

export default mongoose.model('Offer', offerSchema);
