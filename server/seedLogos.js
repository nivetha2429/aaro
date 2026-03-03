import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Brand from './models/Brand.js';

dotenv.config();

// Direct Clearbit CDN URLs — no download needed, loads in browser directly
const BRAND_LOGOS = {
    // Phones
    'Apple':        'https://logo.clearbit.com/apple.com',
    'Samsung':      'https://logo.clearbit.com/samsung.com',
    'OnePlus':      'https://logo.clearbit.com/oneplus.com',
    'Google':       'https://logo.clearbit.com/google.com',
    'Google Pixel': 'https://logo.clearbit.com/google.com',
    'Xiaomi':       'https://logo.clearbit.com/mi.com',
    'Redmi':        'https://logo.clearbit.com/mi.com',
    'Realme':       'https://logo.clearbit.com/realme.com',
    'OPPO':         'https://logo.clearbit.com/oppo.com',
    'Vivo':         'https://logo.clearbit.com/vivo.com',
    'Nothing':      'https://logo.clearbit.com/nothing.technology',
    'Motorola':     'https://logo.clearbit.com/motorola.com',
    'Nokia':        'https://logo.clearbit.com/nokia.com',
    'Poco':         'https://logo.clearbit.com/po.co',
    'IQOO':         'https://logo.clearbit.com/iqoo.com',
    'Infinix':      'https://logo.clearbit.com/infinixmobility.com',
    'Tecno':        'https://logo.clearbit.com/tecno-mobile.com',
    // Laptops
    'Dell':         'https://logo.clearbit.com/dell.com',
    'HP':           'https://logo.clearbit.com/hp.com',
    'Lenovo':       'https://logo.clearbit.com/lenovo.com',
    'Lenova':       'https://logo.clearbit.com/lenovo.com',
    'ASUS':         'https://logo.clearbit.com/asus.com',
    'Microsoft':    'https://logo.clearbit.com/microsoft.com',
    'Acer':         'https://logo.clearbit.com/acer.com',
    'MSI':          'https://logo.clearbit.com/msi.com',
    'Razer':        'https://logo.clearbit.com/razer.com',
    'LG':           'https://logo.clearbit.com/lg.com',
    'Sony':         'https://logo.clearbit.com/sony.com',
    'Huawei':       'https://logo.clearbit.com/huawei.com',
};

const seedLogos = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
        console.log('✅ Connected to MongoDB\n');

        const brands = await Brand.find({});
        console.log(`Found ${brands.length} brands. Assigning logo URLs...\n`);

        let success = 0, skipped = 0;

        for (const brand of brands) {
            const logoUrl = BRAND_LOGOS[brand.name];
            if (logoUrl) {
                brand.image = logoUrl;
                await brand.save();
                console.log(`  ✅  ${brand.name}`);
                success++;
            } else {
                // Auto-generate from brand name as fallback
                const domain = brand.name.toLowerCase().replace(/\s+/g, '') + '.com';
                brand.image = `https://logo.clearbit.com/${domain}`;
                await brand.save();
                console.log(`  🔄  ${brand.name} (auto: ${domain})`);
                success++;
            }
        }

        console.log(`\n🎉 Done! ${success} brand logos saved to MongoDB.`);
        console.log('   Logos will load from Clearbit CDN in the browser.\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed:', err.message);
        process.exit(1);
    }
};

seedLogos();
