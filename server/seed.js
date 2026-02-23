const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const initialProducts = [
    { name: "iPhone 15 Pro", brand: "Apple", category: "phone", price: 999, originalPrice: 1099, rating: 4.8, reviewCount: 1240, description: "Titanium design, A17 Pro chip, and advanced camera system.", specifications: ["6.1\" OLED", "A17 Pro", "48MP Main", "256GB"], images: [], isFeatured: true },
    { name: "Galaxy S24 Ultra", brand: "Samsung", category: "phone", price: 1299, originalPrice: 1399, rating: 4.7, reviewCount: 850, description: "AI-powered flagship with S Pen and 200MP camera.", specifications: ["6.8\" AMOLED", "SD 8 Gen 3", "200MP Main", "512GB"], images: [], isFeatured: true },
    { name: "Xiaomi 14 Ultra", brand: "Xiaomi", category: "phone", price: 1099, originalPrice: 1199, rating: 4.6, reviewCount: 420, description: "Leica optics and professional-grade camera capabilities.", specifications: ["6.73\" LTPO AMOLED", "SD 8 Gen 3", "Leica Quad Camera", "512GB"], images: [], isFeatured: true },
    { name: "OnePlus 12", brand: "OnePlus", category: "phone", price: 799, originalPrice: 899, rating: 4.5, reviewCount: 310, description: "Smooth Beyond Belief with Hasselblad Camera.", specifications: ["6.82\" 120Hz AMOLED", "SD 8 Gen 3", "50MP Main", "256GB"], images: [], isFeatured: true },
    { name: "HP Spectre x360", brand: "HP", category: "laptop", price: 1249, originalPrice: 1449, rating: 4.5, reviewCount: 340, description: "Premium 2-in-1 with stunning OLED display.", specifications: ["14\" 2.8K OLED", "Intele Core Ultra 7", "16GB RAM", "1TB SSD"], images: [], isFeatured: true },
    { name: "MacBook Air M3", brand: "Apple", category: "laptop", price: 1099, originalPrice: 1199, rating: 4.9, reviewCount: 920, description: "Lean, mean, M3 machine with incredible battery.", specifications: ["13.6\" Liquid Retina", "Apple M3 Chip", "8GB Unified", "256GB SSD"], images: [], isFeatured: true }
];

const seedDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberspot';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        await Product.deleteMany({});
        console.log('Cleared existing products');

        await Product.insertMany(initialProducts);
        console.log('Seeded initial products');

        process.exit();
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
