const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Product = require('./models/Product');

const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const connectDB = async () => {
    const defaultUri = 'mongodb://localhost:27017/cyberspot';
    let mongoUri = process.env.MONGODB_URI || defaultUri;

    try {
        console.log(`Attempting to connect to MongoDB at ${mongoUri}...`);
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB successfully!');
    } catch (err) {
        console.log('Primary MongoDB connection failed, trying Memory Server fallback...');
        try {
            const mongoServer = await MongoMemoryServer.create();
            const memoryUri = mongoServer.getUri();
            await mongoose.connect(memoryUri);
            console.log('Connected to MongoDB Memory Server');

            // Auto-seed for memory server
            const count = await Product.countDocuments();
            if (count === 0) {
                const initialProducts = [
                    { id: "p1", name: "iPhone 15 Pro", brand: "Apple", category: "phone", price: 999, originalPrice: 1099, rating: 4.8, reviewCount: 1240, description: "Titanium design, A17 Pro chip, and advanced camera system.", specifications: ["6.1\" OLED", "A17 Pro", "48MP Main", "256GB"], images: [], isFeatured: true },
                    { id: "l1", name: "HP Spectre x360", brand: "HP", category: "laptop", price: 1249, originalPrice: 1449, rating: 4.5, reviewCount: 340, description: "Premium 2-in-1 with stunning OLED display.", specifications: ["14\" 2.8K OLED", "Intele Core Ultra 7", "16GB RAM", "1TB SSD"], images: [], isFeatured: true }
                ];
                await Product.insertMany(initialProducts);
                console.log('Memory Server seeded with initial data');
            }
        } catch (memErr) {
            console.error('Final fallback to Memory Server failed:', memErr);
        }
    }
};

connectDB();

// API Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    const product = new Product(req.body);
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
