import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProductModel from './models/ProductModel.js';

dotenv.config();

const models = [
    // Phones
    { name: 'iPhone 15', category: 'phone', brand: 'Apple' },
    { name: 'iPhone 15 Pro', category: 'phone', brand: 'Apple' },
    { name: 'Galaxy S24', category: 'phone', brand: 'Samsung' },
    { name: 'OnePlus 12', category: 'phone', brand: 'OnePlus' },
    { name: 'Pixel 8', category: 'phone', brand: 'Google' },
    { name: 'Redmi Note 13', category: 'phone', brand: 'Xiaomi' },
    { name: 'Vivo X100', category: 'phone', brand: 'Vivo' },
    { name: 'Oppo Reno 11', category: 'phone', brand: 'Oppo' },

    // Laptops
    { name: 'MacBook Air M3', category: 'laptop', brand: 'Apple' },
    { name: 'MacBook Pro M3', category: 'laptop', brand: 'Apple' },
    { name: 'Dell XPS 13', category: 'laptop', brand: 'Dell' },
    { name: 'HP Spectre x360', category: 'laptop', brand: 'HP' },
    { name: 'Lenovo Legion 5', category: 'laptop', brand: 'Lenovo' },
    { name: 'Asus ROG Zephyrus', category: 'laptop', brand: 'Asus' },
    { name: 'Acer Predator Helios', category: 'laptop', brand: 'Acer' },
    { name: 'MSI Katana', category: 'laptop', brand: 'MSI' }
];

const seedModels = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        await ProductModel.deleteMany({});
        await ProductModel.insertMany(models);

        console.log('✅ Product models seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding models:', err.message);
        process.exit(1);
    }
};

seedModels();
