import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Product from './models/Product.js';
import Variant from './models/Variant.js';
import Category from './models/Category.js';
import Brand from './models/Brand.js';
import Review from './models/Review.js';

dotenv.config();

// ─── Unsplash image pools ───────────────────────────────
const PHONE_IMGS = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
  "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80",
  "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&q=80",
  "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&q=80",
  "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=600&q=80",
  "https://images.unsplash.com/photo-1540350394557-8d14678e7f91?w=600&q=80",
];

const LAPTOP_IMGS = [
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
  "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
  "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
  "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80",
  "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80",
  "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80",
  "https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=600&q=80",
];

// Pick 4 images cycling through pool
const phoneImgs = (offset = 0) => [
  PHONE_IMGS[(offset) % PHONE_IMGS.length],
  PHONE_IMGS[(offset + 1) % PHONE_IMGS.length],
  PHONE_IMGS[(offset + 2) % PHONE_IMGS.length],
  PHONE_IMGS[(offset + 3) % PHONE_IMGS.length],
];
const laptopImgs = (offset = 0) => [
  LAPTOP_IMGS[(offset) % LAPTOP_IMGS.length],
  LAPTOP_IMGS[(offset + 1) % LAPTOP_IMGS.length],
  LAPTOP_IMGS[(offset + 2) % LAPTOP_IMGS.length],
  LAPTOP_IMGS[(offset + 3) % LAPTOP_IMGS.length],
];

// ─── PHONES ─────────────────────────────────────────────
const PHONES = [
  {
    name: "Apple iPhone 15 Pro Max",
    brand: "Apple",
    category: "phone",
    description: "The most powerful iPhone ever with a titanium design, A17 Pro chip, and a 48MP camera system that shoots in ProRAW. The Action Button delivers instant access to your favourite feature.",
    images: phoneImgs(0),
    videoUrl: "https://www.youtube.com/watch?v=ZiP1l7jlIIA",
    specifications: { display: "6.7\" Super Retina XDR OLED, 2796×1290, 460ppi", processor: "Apple A17 Pro (3nm)", ram: "8GB", storage: "256GB / 512GB / 1TB", battery: "4422 mAh, MagSafe 15W", camera: "48MP Main + 12MP UW + 12MP 5x Periscope" },
    features: ["Titanium Frame", "USB-C with USB 3", "Action Button", "Dynamic Island", "Always-On Display", "ProRes Video"],
    featured: true, isTrending: true,
    variants: [
      { ram: "8GB", storage: "256GB", color: "Natural Titanium", price: 134900, originalPrice: 159900, stock: 15, sku: "IP15PM-256-NT" },
      { ram: "8GB", storage: "512GB", color: "Natural Titanium", price: 154900, originalPrice: 179900, stock: 10, sku: "IP15PM-512-NT" },
      { ram: "8GB", storage: "256GB", color: "Black Titanium",   price: 134900, originalPrice: 159900, stock: 12, sku: "IP15PM-256-BT" },
      { ram: "8GB", storage: "512GB", color: "White Titanium",   price: 154900, originalPrice: 179900, stock: 8,  sku: "IP15PM-512-WT" },
    ],
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "phone",
    description: "Unleash creativity with the Galaxy S24 Ultra — the first Galaxy phone with titanium, a built-in S Pen, and a 200MP camera. Powered by Snapdragon 8 Gen 3 for class-leading performance.",
    images: phoneImgs(1),
    videoUrl: "https://www.youtube.com/watch?v=VIpyQe5NfAw",
    specifications: { display: "6.8\" Dynamic AMOLED 2X, 3088×1440, 120Hz", processor: "Snapdragon 8 Gen 3 (4nm)", ram: "12GB", storage: "256GB / 512GB / 1TB", battery: "5000 mAh, 45W wired", camera: "200MP Main + 12MP UW + 50MP 5x + 10MP 3x" },
    features: ["Built-in S Pen", "Titanium Frame", "AI Circle to Search", "100x Space Zoom", "IP68 Rating", "7 Years Android Updates"],
    featured: true, isTrending: true,
    variants: [
      { ram: "12GB", storage: "256GB", color: "Titanium Black",  price: 124999, originalPrice: 144999, stock: 14, sku: "S24U-256-TBK" },
      { ram: "12GB", storage: "512GB", color: "Titanium Black",  price: 144999, originalPrice: 164999, stock: 9,  sku: "S24U-512-TBK" },
      { ram: "12GB", storage: "256GB", color: "Titanium Gray",   price: 124999, originalPrice: 144999, stock: 11, sku: "S24U-256-TGY" },
      { ram: "12GB", storage: "1TB",   color: "Titanium Violet", price: 174999, originalPrice: 194999, stock: 5,  sku: "S24U-1TB-TV" },
    ],
  },
  {
    name: "OnePlus 12",
    brand: "OnePlus",
    category: "phone",
    description: "The flagship killer returns. OnePlus 12 packs a Snapdragon 8 Gen 3, Hasselblad-tuned cameras, and the fastest charging on any flagship. Smooth 2K display at 120Hz.",
    images: phoneImgs(2),
    videoUrl: "https://www.youtube.com/watch?v=9Yt5P9ja9lU",
    specifications: { display: "6.82\" LTPO AMOLED, 3168×1440, 120Hz", processor: "Snapdragon 8 Gen 3 (4nm)", ram: "12GB / 16GB", storage: "256GB / 512GB", battery: "5400 mAh, 100W SUPERVOOC", camera: "50MP Hasselblad Main + 48MP UW + 64MP 3x Periscope" },
    features: ["100W SuperVOOC", "Hasselblad Camera", "Alert Slider", "LTPO Display", "IP65 Rating", "16GB RAM Option"],
    featured: true, isTrending: false,
    variants: [
      { ram: "12GB", storage: "256GB", color: "Silky Black", price: 64999, originalPrice: 74999, stock: 20, sku: "OP12-12-256-BK" },
      { ram: "16GB", storage: "512GB", color: "Silky Black", price: 74999, originalPrice: 84999, stock: 12, sku: "OP12-16-512-BK" },
      { ram: "12GB", storage: "256GB", color: "Flowy Emerald", price: 64999, originalPrice: 74999, stock: 18, sku: "OP12-12-256-GR" },
      { ram: "16GB", storage: "512GB", color: "Flowy Emerald", price: 74999, originalPrice: 84999, stock: 10, sku: "OP12-16-512-GR" },
    ],
  },
  {
    name: "Google Pixel 8 Pro",
    brand: "Google",
    category: "phone",
    description: "Google's smartest phone yet. The Pixel 8 Pro features the all-new Tensor G3 chip, a polished design, and groundbreaking AI features like Magic Eraser, Best Take, and Audio Magic Eraser.",
    images: phoneImgs(3),
    videoUrl: "https://www.youtube.com/watch?v=by4SWMHjp0M",
    specifications: { display: "6.7\" LTPO OLED, 2992×1344, 120Hz, 2000 nits", processor: "Google Tensor G3 (4nm)", ram: "12GB", storage: "128GB / 256GB / 1TB", battery: "5050 mAh, 30W wired / 23W wireless", camera: "50MP Main + 48MP UW + 48MP 5x Periscope" },
    features: ["Google AI Features", "7 Years Updates", "Temperature Sensor", "Titan M2 Security", "Call Screen AI", "Best Take AI"],
    featured: false, isTrending: true,
    variants: [
      { ram: "12GB", storage: "128GB", color: "Obsidian", price: 89999, originalPrice: 106999, stock: 16, sku: "PX8P-128-OB" },
      { ram: "12GB", storage: "256GB", color: "Obsidian", price: 99999, originalPrice: 116999, stock: 10, sku: "PX8P-256-OB" },
      { ram: "12GB", storage: "256GB", color: "Bay",       price: 99999, originalPrice: 116999, stock: 8,  sku: "PX8P-256-BY" },
      { ram: "12GB", storage: "1TB",   color: "Porcelain", price: 129999, originalPrice: 149999, stock: 4, sku: "PX8P-1TB-PC" },
    ],
  },
  {
    name: "Xiaomi 14 Pro",
    brand: "Xiaomi",
    category: "phone",
    description: "Co-engineered with Leica, the Xiaomi 14 Pro delivers professional photography in a flagship form. Featuring a variable aperture lens, f/1.42 ultra-wide, and HyperOS for a seamless experience.",
    images: phoneImgs(4),
    videoUrl: "https://www.youtube.com/watch?v=HpJGhALBvKc",
    specifications: { display: "6.73\" LTPO AMOLED, 3200×1440, 120Hz, 3000 nits", processor: "Snapdragon 8 Gen 3 (4nm)", ram: "12GB / 16GB", storage: "256GB / 512GB / 1TB", battery: "4880 mAh, 120W HyperCharge", camera: "50MP Leica Main (f/1.42-4.0) + 50MP UW + 50MP 3.2x Tele" },
    features: ["Leica Cameras", "Variable Aperture", "120W Hypercharge", "HyperOS", "IP68 Rated", "Ceramic Back"],
    featured: false, isTrending: true,
    variants: [
      { ram: "12GB", storage: "256GB", color: "Black",  price: 79999, originalPrice: 94999, stock: 14, sku: "MI14P-12-256-BK" },
      { ram: "16GB", storage: "512GB", color: "Black",  price: 94999, originalPrice: 109999, stock: 8, sku: "MI14P-16-512-BK" },
      { ram: "12GB", storage: "256GB", color: "White",  price: 79999, originalPrice: 94999, stock: 12, sku: "MI14P-12-256-WH" },
      { ram: "16GB", storage: "1TB",   color: "Jade",   price: 109999, originalPrice: 129999, stock: 5, sku: "MI14P-16-1TB-JD" },
    ],
  },
  {
    name: "Nothing Phone 2",
    brand: "Nothing",
    category: "phone",
    description: "Nothing Phone 2 features an iconic transparent back with Glyph Interface — customisable LED strips that light up with notifications. Snapdragon 8+ Gen 1 with Nothing OS 2.0 for clean, fast Android.",
    images: phoneImgs(5),
    videoUrl: "https://www.youtube.com/watch?v=OumFLZ8soBs",
    specifications: { display: "6.7\" LTPO OLED, 2412×1080, 120Hz", processor: "Snapdragon 8+ Gen 1 (4nm)", ram: "8GB / 12GB", storage: "128GB / 256GB / 512GB", battery: "4700 mAh, 45W wired / 15W wireless", camera: "50MP Sony Main + 50MP UW" },
    features: ["Glyph Interface", "Transparent Design", "Nothing OS 2.0", "45W Fast Charge", "3 Years Android Updates", "IP54 Rating"],
    featured: false, isTrending: false,
    variants: [
      { ram: "8GB",  storage: "128GB", color: "White", price: 44999, originalPrice: 54999, stock: 20, sku: "NP2-8-128-WH" },
      { ram: "12GB", storage: "256GB", color: "White", price: 54999, originalPrice: 64999, stock: 15, sku: "NP2-12-256-WH" },
      { ram: "8GB",  storage: "128GB", color: "Dark",  price: 44999, originalPrice: 54999, stock: 18, sku: "NP2-8-128-DK" },
      { ram: "12GB", storage: "512GB", color: "Dark",  price: 64999, originalPrice: 74999, stock: 8,  sku: "NP2-12-512-DK" },
    ],
  },
  {
    name: "Vivo X100 Pro",
    brand: "Vivo",
    category: "phone",
    description: "Vivo X100 Pro brings professional-grade imaging with a custom V3 imaging chip co-engineered with ZEISS. The 1-inch sensor and 4.3x floating telephoto lens deliver cinematic photos and videos.",
    images: phoneImgs(6),
    videoUrl: "https://www.youtube.com/watch?v=oV6BIJSwUZI",
    specifications: { display: "6.78\" LTPO AMOLED, 2800×1260, 120Hz", processor: "Dimensity 9300 (4nm)", ram: "16GB", storage: "256GB / 512GB / 1TB", battery: "5400 mAh, 100W FlashCharge", camera: "50MP 1\" Sony LYT-900 + 50MP UW + 50MP 4.3x ZEISS Tele" },
    features: ["ZEISS Co-Engineered", "1-inch Sensor", "100W FlashCharge", "Custom V3 Chip", "IP68 Rating", "Vivo Portrait Mode"],
    featured: false, isTrending: false,
    variants: [
      { ram: "16GB", storage: "256GB", color: "Asteroid Black", price: 84999, originalPrice: 99999, stock: 10, sku: "VX100P-16-256-BK" },
      { ram: "16GB", storage: "512GB", color: "Asteroid Black", price: 94999, originalPrice: 109999, stock: 7, sku: "VX100P-16-512-BK" },
      { ram: "16GB", storage: "256GB", color: "Alpha Grey",     price: 84999, originalPrice: 99999, stock: 9, sku: "VX100P-16-256-GY" },
      { ram: "16GB", storage: "1TB",   color: "Alpha Grey",     price: 114999, originalPrice: 134999, stock: 4, sku: "VX100P-16-1TB-GY" },
    ],
  },
  {
    name: "OPPO Find X7 Ultra",
    brand: "OPPO",
    category: "phone",
    description: "OPPO Find X7 Ultra redefines mobile photography with dual-periscope telephoto lenses co-engineered with Hasselblad. The quad-camera system offers 6x and 3x optical zoom for every situation.",
    images: phoneImgs(7),
    videoUrl: "https://www.youtube.com/watch?v=n5eqHFVFAGc",
    specifications: { display: "6.82\" LTPO AMOLED, 3168×1440, 120Hz", processor: "Snapdragon 8 Gen 3 (4nm)", ram: "16GB", storage: "256GB / 512GB / 1TB", battery: "5000 mAh, 100W SuperVOOC", camera: "50MP 1\" Sony + 50MP UW + 50MP 3x Periscope + 50MP 6x Periscope" },
    features: ["Dual Periscope Tele", "Hasselblad Cameras", "100W SuperVOOC", "IP68 Rating", "LTPO 120Hz", "Ceramic Body"],
    featured: false, isTrending: false,
    variants: [
      { ram: "16GB", storage: "256GB", color: "Black",    price: 94999, originalPrice: 109999, stock: 8, sku: "FX7U-16-256-BK" },
      { ram: "16GB", storage: "512GB", color: "Black",    price: 109999, originalPrice: 124999, stock: 6, sku: "FX7U-16-512-BK" },
      { ram: "16GB", storage: "256GB", color: "Sandstone", price: 94999, originalPrice: 109999, stock: 7, sku: "FX7U-16-256-SN" },
      { ram: "16GB", storage: "1TB",   color: "Sandstone", price: 124999, originalPrice: 144999, stock: 3, sku: "FX7U-16-1TB-SN" },
    ],
  },
  {
    name: "Realme GT 5 Pro",
    brand: "Realme",
    category: "phone",
    description: "Realme GT 5 Pro delivers flagship specs at a mid-range price. Snapdragon 8 Gen 3, a 6000 mAh battery with 100W charging, and a 50MP periscope camera make this incredible value.",
    images: phoneImgs(0),
    videoUrl: "https://www.youtube.com/watch?v=dGdLSwY8pFU",
    specifications: { display: "6.78\" LTPO AMOLED, 2780×1264, 144Hz", processor: "Snapdragon 8 Gen 3 (4nm)", ram: "12GB / 16GB", storage: "256GB / 512GB / 1TB", battery: "6000 mAh, 100W wired", camera: "50MP Periscope Main + 8MP UW + 50MP 3x Tele" },
    features: ["6000 mAh Battery", "100W SuperCharge", "144Hz LTPO", "Periscope Camera", "IP64 Rating", "Snapdragon 8 Gen 3"],
    featured: false, isTrending: false,
    variants: [
      { ram: "12GB", storage: "256GB", color: "Navigator Beige", price: 49999, originalPrice: 59999, stock: 22, sku: "RGT5P-12-256-BG" },
      { ram: "16GB", storage: "512GB", color: "Navigator Beige", price: 59999, originalPrice: 69999, stock: 15, sku: "RGT5P-16-512-BG" },
      { ram: "12GB", storage: "256GB", color: "Neon Blue",       price: 49999, originalPrice: 59999, stock: 20, sku: "RGT5P-12-256-NB" },
      { ram: "16GB", storage: "1TB",   color: "Neon Blue",       price: 74999, originalPrice: 89999, stock: 7,  sku: "RGT5P-16-1TB-NB" },
    ],
  },
  {
    name: "Motorola Edge 50 Ultra",
    brand: "Motorola",
    category: "phone",
    description: "Motorola Edge 50 Ultra stands out with its vegan leather back, 125W TurboPower charging, and a 50MP periscope camera with 3x optical zoom. Pure Android 14 experience guaranteed for 3 years.",
    images: phoneImgs(1),
    videoUrl: "https://www.youtube.com/watch?v=sAq4WDCyFAY",
    specifications: { display: "6.67\" pOLED, 2712×1220, 165Hz", processor: "Snapdragon 8s Gen 3 (4nm)", ram: "12GB", storage: "256GB / 512GB", battery: "4500 mAh, 125W TurboPower", camera: "50MP OIS Main + 50MP UW + 50MP 3x Periscope" },
    features: ["125W TurboPower", "Vegan Leather Back", "165Hz pOLED", "IP68 Rating", "Pure Android", "3 Years Updates"],
    featured: false, isTrending: false,
    variants: [
      { ram: "12GB", storage: "256GB", color: "Nordic Wood",   price: 59999, originalPrice: 69999, stock: 16, sku: "ME50U-12-256-NW" },
      { ram: "12GB", storage: "512GB", color: "Nordic Wood",   price: 69999, originalPrice: 79999, stock: 10, sku: "ME50U-12-512-NW" },
      { ram: "12GB", storage: "256GB", color: "Peach Fuzz",    price: 59999, originalPrice: 69999, stock: 14, sku: "ME50U-12-256-PF" },
      { ram: "12GB", storage: "512GB", color: "Midnight Blue", price: 69999, originalPrice: 79999, stock: 9,  sku: "ME50U-12-512-MB" },
    ],
  },
];

// ─── LAPTOPS ────────────────────────────────────────────
const LAPTOPS = [
  {
    name: "Apple MacBook Pro 14\" M3 Pro",
    brand: "Apple",
    category: "laptop",
    description: "The MacBook Pro 14\" with M3 Pro chip is the world's best laptop for professionals. With up to 22 hours battery life, ProRes acceleration, and the stunning Liquid Retina XDR display, nothing comes close.",
    images: laptopImgs(0),
    videoUrl: "https://www.youtube.com/watch?v=uf4BkD78nfU",
    specifications: { display: "14.2\" Liquid Retina XDR, 3024×1964, 120Hz ProMotion", processor: "Apple M3 Pro (11-core CPU, 14-core GPU)", ram: "18GB / 36GB Unified Memory", storage: "512GB / 1TB / 2TB SSD", battery: "70Wh, up to 18 hours", graphics: "Apple M3 Pro 14-core GPU" },
    features: ["M3 Pro Chip", "ProRes Acceleration", "MagSafe Charging", "HDMI + SD Card", "Thunderbolt 4 x3", "22hr Battery"],
    featured: true, isTrending: true,
    variants: [
      { ram: "18GB", storage: "512GB", color: "Space Black",    price: 189900, originalPrice: 219900, stock: 8, sku: "MBP14-18-512-SB" },
      { ram: "18GB", storage: "1TB",   color: "Space Black",    price: 209900, originalPrice: 239900, stock: 6, sku: "MBP14-18-1TB-SB" },
      { ram: "36GB", storage: "512GB", color: "Silver",         price: 229900, originalPrice: 259900, stock: 5, sku: "MBP14-36-512-SL" },
      { ram: "36GB", storage: "1TB",   color: "Silver",         price: 249900, originalPrice: 279900, stock: 4, sku: "MBP14-36-1TB-SL" },
    ],
  },
  {
    name: "Dell XPS 15 9530",
    brand: "Dell",
    category: "laptop",
    description: "The Dell XPS 15 is the ultimate Windows laptop for creatives. An InfinityEdge OLED display, 13th Gen Intel Core i9, NVIDIA GeForce RTX 4070, and premium aluminium chassis make it perfect for demanding work.",
    images: laptopImgs(1),
    videoUrl: "https://www.youtube.com/watch?v=VFnAcQlZ0o0",
    specifications: { display: "15.6\" OLED InfinityEdge Touch, 3456×2160, 60Hz", processor: "Intel Core i9-13900H (24-core)", ram: "32GB / 64GB DDR5", storage: "1TB / 2TB NVMe SSD", battery: "86Wh, up to 13 hours", graphics: "NVIDIA GeForce RTX 4070 8GB GDDR6" },
    features: ["OLED Touch Display", "RTX 4070 GPU", "Thunderbolt 4", "SD Card Reader", "Backlit Keyboard", "Windows Hello"],
    featured: true, isTrending: true,
    variants: [
      { ram: "32GB", storage: "1TB",  color: "Platinum Silver", price: 199999, originalPrice: 229999, stock: 7, sku: "XPS15-32-1TB-PS" },
      { ram: "32GB", storage: "2TB",  color: "Platinum Silver", price: 229999, originalPrice: 259999, stock: 5, sku: "XPS15-32-2TB-PS" },
      { ram: "64GB", storage: "1TB",  color: "Graphite",        price: 239999, originalPrice: 269999, stock: 4, sku: "XPS15-64-1TB-GR" },
      { ram: "64GB", storage: "2TB",  color: "Graphite",        price: 269999, originalPrice: 299999, stock: 3, sku: "XPS15-64-2TB-GR" },
    ],
  },
  {
    name: "HP Spectre x360 14",
    brand: "HP",
    category: "laptop",
    description: "HP Spectre x360 14 is the most versatile premium 2-in-1 laptop. Flip it, fold it, or tent it. The OLED touch display, Intel Core Ultra 7, and included stylus make it perfect for creators and executives.",
    images: laptopImgs(2),
    videoUrl: "https://www.youtube.com/watch?v=rH0DJbHUF0w",
    specifications: { display: "14\" 2.8K OLED Touch, 2880×1800, 90Hz, 400 nits", processor: "Intel Core Ultra 7 165H (16-core)", ram: "16GB / 32GB LPDDR5x", storage: "512GB / 1TB / 2TB SSD", battery: "72Wh, up to 17 hours", graphics: "Intel Arc Graphics (integrated)" },
    features: ["2-in-1 Design", "OLED Touch", "HP Tilt Pen Included", "Thunderbolt 4", "Gem-Cut Design", "Bang & Olufsen Audio"],
    featured: false, isTrending: true,
    variants: [
      { ram: "16GB", storage: "512GB", color: "Nightfall Black",  price: 139999, originalPrice: 159999, stock: 10, sku: "SPX360-16-512-NB" },
      { ram: "16GB", storage: "1TB",   color: "Nightfall Black",  price: 159999, originalPrice: 179999, stock: 7,  sku: "SPX360-16-1TB-NB" },
      { ram: "32GB", storage: "1TB",   color: "Natural Silver",   price: 179999, originalPrice: 199999, stock: 5,  sku: "SPX360-32-1TB-NS" },
      { ram: "32GB", storage: "2TB",   color: "Natural Silver",   price: 199999, originalPrice: 219999, stock: 3,  sku: "SPX360-32-2TB-NS" },
    ],
  },
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 12",
    brand: "Lenovo",
    category: "laptop",
    description: "The ThinkPad X1 Carbon Gen 12 is the gold standard of business laptops. Under 1.12 kg with a MIL-SPEC tested chassis, Intel Core Ultra processor, and legendary ThinkPad keyboard — built for the road warrior.",
    images: laptopImgs(3),
    videoUrl: "https://www.youtube.com/watch?v=2tBGy9BgDDk",
    specifications: { display: "14\" IPS Anti-Glare, 1920×1200, 60Hz, 400 nits", processor: "Intel Core Ultra 7 165U (12-core)", ram: "16GB / 32GB LPDDR5", storage: "512GB / 1TB NVMe SSD", battery: "57Wh, up to 15 hours", graphics: "Intel Graphics (integrated)" },
    features: ["Under 1.12 kg", "MIL-SPEC Tested", "5G LTE Option", "ThinkShield Security", "Thunderbolt 4", "4G Optional"],
    featured: false, isTrending: false,
    variants: [
      { ram: "16GB", storage: "512GB", color: "Deep Black", price: 149999, originalPrice: 169999, stock: 10, sku: "X1C12-16-512-DB" },
      { ram: "32GB", storage: "512GB", color: "Deep Black", price: 169999, originalPrice: 189999, stock: 7,  sku: "X1C12-32-512-DB" },
      { ram: "16GB", storage: "1TB",   color: "Deep Black", price: 164999, originalPrice: 184999, stock: 8,  sku: "X1C12-16-1TB-DB" },
      { ram: "32GB", storage: "1TB",   color: "Deep Black", price: 189999, originalPrice: 209999, stock: 5,  sku: "X1C12-32-1TB-DB" },
    ],
  },
  {
    name: "ASUS ROG Zephyrus G14 2024",
    brand: "ASUS",
    category: "laptop",
    description: "The ASUS ROG Zephyrus G14 2024 packs a Ryzen 9 8945HS + RTX 4070 into a compact 14\" chassis. With the new AniMe Matrix LED lid and a 165Hz OLED panel, it's the ultimate compact gaming laptop.",
    images: laptopImgs(4),
    videoUrl: "https://www.youtube.com/watch?v=jBvR0V2gFjU",
    specifications: { display: "14\" OLED, 2560×1600, 165Hz, 600 nits", processor: "AMD Ryzen 9 8945HS (8-core, up to 5.2 GHz)", ram: "16GB / 32GB DDR5", storage: "1TB / 2TB NVMe SSD", battery: "73Wh, up to 10 hours", graphics: "NVIDIA GeForce RTX 4070 8GB GDDR6" },
    features: ["AniMe Matrix LED", "RTX 4070", "OLED 165Hz", "MUX Switch", "Tri-Fan Cooling", "ROG Armory Crate"],
    featured: true, isTrending: true,
    variants: [
      { ram: "16GB", storage: "1TB",  color: "Eclipse Gray",  price: 179999, originalPrice: 199999, stock: 8, sku: "G14-16-1TB-EG" },
      { ram: "32GB", storage: "1TB",  color: "Eclipse Gray",  price: 199999, originalPrice: 219999, stock: 6, sku: "G14-32-1TB-EG" },
      { ram: "16GB", storage: "1TB",  color: "Platinum White", price: 179999, originalPrice: 199999, stock: 7, sku: "G14-16-1TB-PW" },
      { ram: "32GB", storage: "2TB",  color: "Platinum White", price: 229999, originalPrice: 249999, stock: 4, sku: "G14-32-2TB-PW" },
    ],
  },
  {
    name: "Microsoft Surface Laptop 5",
    brand: "Microsoft",
    category: "laptop",
    description: "The Surface Laptop 5 blends stunning design with premium performance. A brilliant 13.5\" PixelSense Touch display, Intel Evo-certified Core i7, and an ultra-slim chassis make it the ideal everyday laptop.",
    images: laptopImgs(5),
    videoUrl: "https://www.youtube.com/watch?v=Ro5gXE5i3PY",
    specifications: { display: "13.5\" PixelSense Touch, 2256×1504, 60Hz", processor: "Intel Core i7-1265U (10-core)", ram: "16GB / 32GB LPDDR5x", storage: "512GB / 1TB SSD", battery: "47.4Wh, up to 18 hours", graphics: "Intel Iris Xe (integrated)" },
    features: ["Intel Evo Certified", "PixelSense Touch", "Slim 14.5mm Design", "Windows Hello Face", "USB-C + USB-A", "1.25 kg"],
    featured: false, isTrending: false,
    variants: [
      { ram: "16GB", storage: "512GB", color: "Sage",    price: 129999, originalPrice: 149999, stock: 12, sku: "SL5-16-512-SG" },
      { ram: "16GB", storage: "1TB",   color: "Sage",    price: 149999, originalPrice: 169999, stock: 8,  sku: "SL5-16-1TB-SG" },
      { ram: "32GB", storage: "512GB", color: "Sandstone", price: 149999, originalPrice: 169999, stock: 7, sku: "SL5-32-512-SS" },
      { ram: "32GB", storage: "1TB",   color: "Sandstone", price: 169999, originalPrice: 189999, stock: 5, sku: "SL5-32-1TB-SS" },
    ],
  },
  {
    name: "Acer Swift X 14",
    brand: "Acer",
    category: "laptop",
    description: "Acer Swift X 14 is a powerful yet affordable creator laptop. Intel Core Ultra 7, NVIDIA RTX 4070, and an OLED display in a 1.55 kg body — exceptional performance without the premium price tag.",
    images: laptopImgs(6),
    videoUrl: "https://www.youtube.com/watch?v=Ak2f6PqLk-M",
    specifications: { display: "14.5\" 2.8K OLED, 2880×1800, 90Hz, 400 nits", processor: "Intel Core Ultra 7 165H (16-core)", ram: "16GB / 32GB LPDDR5x", storage: "512GB / 1TB SSD", battery: "65Wh, up to 12 hours", graphics: "NVIDIA GeForce RTX 4070 8GB" },
    features: ["RTX 4070", "OLED Display", "1.55 kg Body", "Thunderbolt 4", "Fingerprint Reader", "Wi-Fi 6E"],
    featured: false, isTrending: false,
    variants: [
      { ram: "16GB", storage: "512GB", color: "Steel Gray", price: 109999, originalPrice: 129999, stock: 14, sku: "SFX14-16-512-SG" },
      { ram: "32GB", storage: "1TB",   color: "Steel Gray", price: 134999, originalPrice: 154999, stock: 8,  sku: "SFX14-32-1TB-SG" },
      { ram: "16GB", storage: "512GB", color: "Pure Silver", price: 109999, originalPrice: 129999, stock: 12, sku: "SFX14-16-512-PS" },
      { ram: "32GB", storage: "1TB",   color: "Pure Silver", price: 134999, originalPrice: 154999, stock: 6, sku: "SFX14-32-1TB-PS" },
    ],
  },
  {
    name: "MSI Stealth 16 AI",
    brand: "MSI",
    category: "laptop",
    description: "MSI Stealth 16 AI is a slim gaming powerhouse. Intel Core Ultra 9 + RTX 4080, a 240Hz QHD+ mini-LED display, and MSI's Cooler Boost Trinity cooling make it the fastest thin gaming laptop available.",
    images: laptopImgs(7),
    videoUrl: "https://www.youtube.com/watch?v=WuFgt7o4lYY",
    specifications: { display: "16\" QHD+ Mini LED, 2560×1600, 240Hz, 1000 nits", processor: "Intel Core Ultra 9 185H (16-core, up to 5.1GHz)", ram: "32GB / 64GB DDR5", storage: "1TB / 2TB NVMe SSD", battery: "99.9Wh, up to 12 hours", graphics: "NVIDIA GeForce RTX 4080 12GB GDDR6" },
    features: ["RTX 4080 GPU", "240Hz Mini-LED", "Cooler Boost Trinity", "MUX Switch", "Thunderbolt 5", "Per-Key RGB"],
    featured: false, isTrending: true,
    variants: [
      { ram: "32GB", storage: "1TB",  color: "Core Black",   price: 249999, originalPrice: 279999, stock: 5, sku: "ST16-32-1TB-CB" },
      { ram: "64GB", storage: "1TB",  color: "Core Black",   price: 279999, originalPrice: 309999, stock: 3, sku: "ST16-64-1TB-CB" },
      { ram: "32GB", storage: "2TB",  color: "Core Black",   price: 274999, originalPrice: 304999, stock: 4, sku: "ST16-32-2TB-CB" },
      { ram: "64GB", storage: "2TB",  color: "Urban Silver", price: 309999, originalPrice: 339999, stock: 2, sku: "ST16-64-2TB-US" },
    ],
  },
  {
    name: "Samsung Galaxy Book4 Pro 16",
    brand: "Samsung",
    category: "laptop",
    description: "Samsung Galaxy Book4 Pro 16 connects seamlessly with your Galaxy phone. Galaxy AI features, a gorgeous 3K AMOLED display, Intel Core Ultra 7, and LPDDR5x RAM make it the ultimate Samsung ecosystem laptop.",
    images: laptopImgs(0),
    videoUrl: "https://www.youtube.com/watch?v=_7Nv20HxvdA",
    specifications: { display: "16\" 3K Dynamic AMOLED, 2880×1800, 120Hz, 400 nits", processor: "Intel Core Ultra 7 155H (16-core)", ram: "16GB / 32GB LPDDR5x", storage: "512GB / 1TB SSD", battery: "76Wh, up to 22 hours", graphics: "Intel Arc Graphics (integrated)" },
    features: ["Galaxy AI", "3K AMOLED", "22hr Battery", "Galaxy Link", "Thunderbolt 4", "1.55 kg Slim"],
    featured: false, isTrending: false,
    variants: [
      { ram: "16GB", storage: "512GB", color: "Moonstone Gray", price: 149999, originalPrice: 169999, stock: 10, sku: "GB4P16-16-512-MG" },
      { ram: "16GB", storage: "1TB",   color: "Moonstone Gray", price: 169999, originalPrice: 189999, stock: 7,  sku: "GB4P16-16-1TB-MG" },
      { ram: "32GB", storage: "1TB",   color: "Sapphire Blue",  price: 189999, originalPrice: 209999, stock: 5,  sku: "GB4P16-32-1TB-SB" },
      { ram: "32GB", storage: "1TB",   color: "Platinum Silver", price: 189999, originalPrice: 209999, stock: 6, sku: "GB4P16-32-1TB-PS" },
    ],
  },
  {
    name: "Razer Blade 15",
    brand: "Razer",
    category: "laptop",
    description: "The Razer Blade 15 is the epitome of gaming luxury. A CNC-machined aluminium chassis with RTX 4080, 240Hz QHD display, and Razer Chroma RGB keyboard — engineered for those who demand the best.",
    images: laptopImgs(1),
    videoUrl: "https://www.youtube.com/watch?v=3LkeFMQR3oU",
    specifications: { display: "15.6\" QHD IPS, 2560×1440, 240Hz, 350 nits", processor: "Intel Core i9-13950HX (24-core, up to 5.5GHz)", ram: "16GB / 32GB DDR5", storage: "1TB / 2TB NVMe SSD", battery: "80Wh, up to 10 hours", graphics: "NVIDIA GeForce RTX 4080 12GB GDDR6" },
    features: ["CNC Aluminium Body", "RTX 4080 GPU", "240Hz QHD", "Razer Chroma RGB", "Thunderbolt 4", "SD Card Reader"],
    featured: true, isTrending: false,
    variants: [
      { ram: "16GB", storage: "1TB",  color: "Black",           price: 249999, originalPrice: 279999, stock: 6, sku: "RB15-16-1TB-BK" },
      { ram: "32GB", storage: "1TB",  color: "Black",           price: 279999, originalPrice: 309999, stock: 4, sku: "RB15-32-1TB-BK" },
      { ram: "16GB", storage: "1TB",  color: "Mercury White",   price: 254999, originalPrice: 284999, stock: 5, sku: "RB15-16-1TB-MW" },
      { ram: "32GB", storage: "2TB",  color: "Mercury White",   price: 309999, originalPrice: 339999, stock: 3, sku: "RB15-32-2TB-MW" },
    ],
  },
];

// ─── DEFAULT REVIEWS ──────────────────────────────────
const REVIEWS_POOL = [
  { name: "Arjun Sharma",     comment: "Absolutely brilliant device! The performance is blazing fast and the build quality is premium. Highly recommended!", rating: 5 },
  { name: "Priya Nair",       comment: "Really impressed with the camera quality and battery life. Great value for the price. Very happy with my purchase.", rating: 5 },
  { name: "Rahul Menon",      comment: "Excellent product. Delivered quickly and exactly as described. The display is stunning. Will definitely buy again.", rating: 4 },
  { name: "Sneha Patel",      comment: "Great device overall! Setup was easy and performance is smooth. Very satisfied with AARO's service.", rating: 5 },
  { name: "Vikram Rajan",     comment: "Outstanding value. The specs match perfectly with the price. Battery life is impressive for heavy usage.", rating: 4 },
];

// ─── SEED FUNCTION ────────────────────────────────────
const seedProducts = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.log('No MONGODB_URI found. Starting Memory Server...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const memServer = await MongoMemoryServer.create({ binary: { version: '6.0.0' } });
      mongoUri = memServer.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing product data
    await Product.deleteMany({});
    await Variant.deleteMany({});
    await Review.deleteMany({});
    // Sync indexes (drops stale indexes, creates correct ones)
    await Variant.syncIndexes();
    console.log('🧹 Cleared existing products, variants, reviews');

    // Upsert categories
    const catData = [
      { name: "Smartphones", slug: "phone",   description: "Latest smartphones from top brands" },
      { name: "Laptops",     slug: "laptop",  description: "Performance laptops for work and gaming" },
    ];
    for (const c of catData) {
      await Category.findOneAndUpdate({ slug: c.slug }, { ...c, productCount: 0 }, { upsert: true, new: true });
    }
    console.log('✅ Categories ready');

    // Upsert brands
    const allBrands = [...new Set([...PHONES.map(p => p.brand), ...LAPTOPS.map(p => p.brand)])];
    for (const bName of allBrands) {
      const haPhone   = PHONES.some(p => p.brand === bName);
      const hasLaptop = LAPTOPS.some(p => p.brand === bName);
      const slug = bName.toLowerCase().replace(/\s+/g, '-');
      await Brand.findOneAndUpdate(
        { slug },
        { name: bName, slug, category: haPhone && hasLaptop ? 'both' : haPhone ? 'phone' : 'laptop', description: `Official ${bName} products`, productCount: 0 },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Brands ready');

    // Seed all products + variants + reviews
    const allProducts = [...PHONES, ...LAPTOPS];
    let totalProducts = 0, totalVariants = 0;

    for (const pData of allProducts) {
      const { variants, ...productFields } = pData;

      const product = await Product.create(productFields);

      // Create variants
      for (const v of variants) {
        await Variant.create({ ...v, productId: product._id });
        totalVariants++;
      }

      // Create 3 random reviews
      const reviewCount = 3;
      let ratingSum = 0;
      for (let i = 0; i < reviewCount; i++) {
        const r = REVIEWS_POOL[(totalProducts + i) % REVIEWS_POOL.length];
        await Review.create({ productId: product._id, name: r.name, comment: r.comment, rating: r.rating });
        ratingSum += r.rating;
      }

      // Update product with avg rating
      await Product.findByIdAndUpdate(product._id, {
        reviewCount,
        rating: Math.round((ratingSum / reviewCount) * 10) / 10,
      });

      totalProducts++;
      console.log(`  ✅ ${pData.category === 'phone' ? '📱' : '💻'} ${pData.name}`);
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`   📱 ${PHONES.length} phones`);
    console.log(`   💻 ${LAPTOPS.length} laptops`);
    console.log(`   ⚙️  ${totalVariants} variants`);
    console.log(`   ⭐  ${totalProducts * 3} reviews`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedProducts();
