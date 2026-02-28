import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const hash = await bcrypt.hash('admin@1402', 12);
        const admin = await User.findOneAndUpdate(
            { email: 'admin@aaro.com' },
            { name: 'Admin', email: 'admin@aaro.com', password: hash, role: 'admin', phone: '9999999999' },
            { upsert: true, new: true }
        );
        console.log('✅ Admin user ready:', admin.email);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

seedAdmin();
