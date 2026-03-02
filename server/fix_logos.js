import mongoose from 'mongoose';
import Brand from './models/Brand.js';

const mongoUri = 'mongodb://localhost:27017/aaro'; // Common default

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected!');

        const brands = await Brand.find({ name: { $in: [/apple/i, /samsung/i] } });
        console.log('Found brands:', brands.map(b => b.name));

        const logoMap = {
            'apple': 'https://logo.clearbit.com/apple.com',
            'samsung': 'https://logo.clearbit.com/samsung.com'
        };

        for (const brand of brands) {
            const key = brand.name.toLowerCase();
            if (logoMap[key]) {
                brand.image = logoMap[key];
                await brand.save();
                console.log(`Updated ${brand.name} logo to ${logoMap[key]}`);
            }
        }
        console.log('Finished.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.connection.close();
    }
}
run();
