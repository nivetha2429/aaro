import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    link: { type: String, default: '/shop' },
    position: { type: String, enum: ['hero', 'center'], default: 'hero' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
}, { timestamps: true });

bannerSchema.index({ position: 1, active: 1, order: 1 });

export default mongoose.model('Banner', bannerSchema);
