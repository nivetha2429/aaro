import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    discount: { type: Number, required: true },
    code: { type: String, required: true },
    image: { type: String, default: '' },
    active: { type: Boolean, default: false },
}, { timestamps: true });

// Pre-save hook: when this offer is set active, deactivate all others
offerSchema.pre('save', async function (next) {
    if (this.active && this.isModified('active')) {
        await mongoose.model('Offer').updateMany(
            { _id: { $ne: this._id } },
            { active: false }
        );
    }
    next();
});

export default mongoose.model('Offer', offerSchema);
