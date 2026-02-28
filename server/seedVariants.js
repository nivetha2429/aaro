import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Variant from './models/Variant.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/aaro";

async function seedVariants() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const products = await Product.find();
        console.log(`Found ${products.length} products`);

        const allVariants = [];

        for (const product of products) {
            // Check if it already has variants
            const existing = await Variant.find({ productId: product._id });
            if (existing.length > 0) continue;

            const basePrice = 50000; // Placeholder base price
            const variants = [
                {
                    productId: product._id,
                    ram: "8GB",
                    storage: "128GB",
                    price: basePrice,
                    originalPrice: basePrice + 10000,
                    stock: 15,
                    sku: `SKU-${product.name.substring(0, 3).toUpperCase()}-8-128`,
                    isAvailable: true
                },
                {
                    productId: product._id,
                    ram: "8GB",
                    storage: "256GB",
                    price: basePrice + 5000,
                    originalPrice: basePrice + 15000,
                    stock: 10,
                    sku: `SKU-${product.name.substring(0, 3).toUpperCase()}-8-256`,
                    isAvailable: true
                },
                {
                    productId: product._id,
                    ram: "12GB",
                    storage: "256GB",
                    price: basePrice + 12000,
                    originalPrice: basePrice + 22000,
                    stock: 5,
                    sku: `SKU-${product.name.substring(0, 3).toUpperCase()}-12-256`,
                    isAvailable: true
                }
            ];
            allVariants.push(...variants);
        }

        if (allVariants.length > 0) {
            await Variant.insertMany(allVariants);
            console.log(`Inserted ${allVariants.length} variants`);
        } else {
            console.log("No new variants needed");
        }

        console.log("Seeding complete");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seedVariants();
