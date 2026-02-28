import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    productCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
