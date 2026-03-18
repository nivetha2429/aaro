import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    address:  { type: String, required: true },
    phone:    { type: String, required: true },
    whatsapp: { type: String, required: true },
    hours:    { type: String, default: '' },
    closed:   { type: String, default: '' },
    mapUrl:   { type: String, default: '' },
});

const contactSettingsSchema = new mongoose.Schema({
    phone:             { type: String, default: '' },
    email:             { type: String, default: '' },
    address:           { type: String, default: '' },
    whatsappNumber:    { type: String, default: '' },
    instagramUrl:      { type: String, default: '' },
    instagramHandle:   { type: String, default: '' },
    whatsappGroupLink: { type: String, default: '' },
    logoUrl:           { type: String, default: '' },
    branches:          [branchSchema],
}, { timestamps: true });

export default mongoose.model('ContactSettings', contactSettingsSchema);
