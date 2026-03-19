import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // Seed Super Admin
        const superHash = await bcrypt.hash('SuperAaro@2025', 12);
        const superAdmin = await User.findOneAndUpdate(
            { email: 'superadmin@aaro.com' },
            { name: 'Super Admin', email: 'superadmin@aaro.com', password: superHash, role: 'superadmin', phone: '9000000000' },
            { upsert: true, new: true }
        );
        console.log('✅ Super Admin ready:', superAdmin.email);

        // Seed Default Admin
        const adminHash = await bcrypt.hash('Admin@1402', 12);
        const admin = await User.findOneAndUpdate(
            { email: 'admin@aaro.com' },
            { name: 'Admin', email: 'admin@aaro.com', password: adminHash, role: 'admin', phone: '7094223143' },
            { upsert: true, new: true }
        );
        console.log('✅ Admin ready:', admin.email);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

seedAdmin();
