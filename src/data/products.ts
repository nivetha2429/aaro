export interface Product {
  id: string;
  name: string;
  brand: string;
  category: "phone" | "laptop";
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  description: string;
  specifications: string[];
  images: string[];
  featured: boolean;
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount: number;
  image?: string;
  active: boolean;
}

export const products: Product[] = [
  // PHONES (18 brands)
  { id: "p1", name: "iPhone 15 Pro", brand: "Apple", category: "phone", price: 999, originalPrice: 1099, rating: 4.8, reviewCount: 1240, description: "Titanium design, A17 Pro chip, and advanced camera system.", specifications: ["6.1\" OLED", "A17 Pro", "48MP Main", "256GB"], images: [], featured: true },
  { id: "p2", name: "Galaxy S24 Ultra", brand: "Samsung", category: "phone", price: 1299, originalPrice: 1399, rating: 4.7, reviewCount: 850, description: "AI-powered flagship with S Pen and 200MP camera.", specifications: ["6.8\" AMOLED", "SD 8 Gen 3", "200MP Main", "512GB"], images: [], featured: true },
  { id: "p3", name: "Xiaomi 14 Ultra", brand: "Xiaomi", category: "phone", price: 1099, originalPrice: 1199, rating: 4.6, reviewCount: 420, description: "Leica optics and professional-grade camera capabilities.", specifications: ["6.73\" LTPO AMOLED", "SD 8 Gen 3", "Leica Quad Camera", "512GB"], images: [], featured: true },
  { id: "p4", name: "OnePlus 12", brand: "OnePlus", category: "phone", price: 799, originalPrice: 899, rating: 4.5, reviewCount: 310, description: "Smooth Beyond Belief with Hasselblad Camera.", specifications: ["6.82\" 120Hz AMOLED", "SD 8 Gen 3", "50MP Main", "256GB"], images: [], featured: true },
  { id: "p5", name: "Pixel 8 Pro", brand: "Google", category: "phone", price: 999, originalPrice: 1099, rating: 4.4, reviewCount: 560, description: "The best of Google AI and photography.", specifications: ["6.7\" Super Actua", "Tensor G3", "50MP Camera", "128GB"], images: [], featured: false },
  { id: "p6", name: "Vivo X100 Pro", brand: "Vivo", category: "phone", price: 899, originalPrice: 999, rating: 4.6, reviewCount: 210, description: "Zeiss APO Telephoto Camera for stunning portraits.", specifications: ["6.78\" AMOLED", "Dimensity 9300", "50MP Zeiss", "512GB"], images: [], featured: false },
  { id: "p7", name: "Oppo Find X7 Ultra", brand: "Oppo", category: "phone", price: 949, originalPrice: 1049, rating: 4.5, reviewCount: 180, description: "World's first dual-periscope camera flagship.", specifications: ["6.82\" LTPO", "SD 8 Gen 3", "50MP Dual Periscope", "256GB"], images: [], featured: false },
  { id: "p8", name: "Realme GT 5 Pro", brand: "Realme", category: "phone", price: 549, originalPrice: 649, rating: 4.3, reviewCount: 150, description: "High performance and premium design at an affordable price.", specifications: ["6.78\" 144Hz AMOLED", "SD 8 Gen 3", "50MP Main", "256GB"], images: [], featured: false },
  { id: "p9", name: "Motorola Edge 50 Pro", brand: "Motorola", category: "phone", price: 449, originalPrice: 549, rating: 4.2, reviewCount: 95, description: "Sleek design with Pantone certified display.", specifications: ["6.7\" pOLED", "SD 7 Gen 3", "50MP Main", "256GB"], images: [], featured: false },
  { id: "p10", name: "Nothing Phone (2)", brand: "Nothing", category: "phone", price: 599, originalPrice: 699, rating: 4.5, reviewCount: 280, description: "Iconic Glyph interface and unique Nothing OS.", specifications: ["6.7\" LTPO OLED", "SD 8+ Gen 1", "50MP Dual Camera", "256GB"], images: [], featured: true },
  { id: "p11", name: "Infinix Zero 30 5G", brand: "Infinix", category: "phone", price: 299, originalPrice: 349, rating: 4.1, reviewCount: 75, description: "Curved display and 4K 60fps vlog camera.", specifications: ["6.78\" AMOLED", "Dimensity 8020", "108MP Main", "256GB"], images: [], featured: false },
  { id: "p12", name: "Tecno Camon 30 Premier", brand: "Tecno", category: "phone", price: 399, originalPrice: 449, rating: 4.0, reviewCount: 65, description: "PolarAce imaging system and stylish design.", specifications: ["6.77\" LTPO", "Dimensity 8200", "50MP Triple", "512GB"], images: [], featured: false },
  { id: "p13", name: "iQOO 12", brand: "iQOO", category: "phone", price: 649, originalPrice: 749, rating: 4.6, reviewCount: 190, description: "Xtreme Pro-performance with SD 8 Gen 3.", specifications: ["6.78\" 144Hz AMOLED", "SD 8 Gen 3", "50MP Triple", "256GB"], images: [], featured: false },
  { id: "p14", name: "Honor Magic6 Pro", brand: "Honor", category: "phone", price: 999, originalPrice: 1099, rating: 4.5, reviewCount: 140, description: "Falcon Camera and ultra-tough NanoCrystal Glass.", specifications: ["6.8\" LTPO", "SD 8 Gen 3", "180MP Telephoto", "512GB"], images: [], featured: false },
  { id: "p15", name: "Lava Agni 3", brand: "Lava", category: "phone", price: 249, originalPrice: 299, rating: 4.2, reviewCount: 80, description: "Dual AMOLED display with versatile Action button.", specifications: ["6.78\" 1.5K AMOLED", "Dimensity 7300 X", "50MP Main", "128GB"], images: [], featured: false },
  { id: "p16", name: "Poco F6 Pro", brand: "Poco", category: "phone", price: 499, originalPrice: 599, rating: 4.4, reviewCount: 220, description: "HyperPower evolved with premium features.", specifications: ["6.67\" WQHD+", "SD 8 Gen 2", "50MP Triple", "512GB"], images: [], featured: false },
  { id: "p17", name: "Nokia G42 5G", brand: "Nokia", category: "phone", price: 199, originalPrice: 249, rating: 3.9, reviewCount: 110, description: "Repairable design with great battery life.", specifications: ["6.56\" HD+", "SD 480+ 5G", "50MP Main", "128GB"], images: [], featured: false },
  { id: "p18", name: "Sony Xperia 1 V", brand: "Sony", category: "phone", price: 1199, originalPrice: 1399, rating: 4.3, reviewCount: 130, description: "Next-gen sensor for the creator in you.", specifications: ["6.5\" 4K HDR", "SD 8 Gen 2", "Exmor T Sensor", "256GB"], images: [], featured: false },

  // LAPTOPS (11 brands)
  { id: "l1", name: "HP Spectre x360", brand: "HP", category: "laptop", price: 1249, originalPrice: 1449, rating: 4.5, reviewCount: 340, description: "Premium 2-in-1 with stunning OLED display.", specifications: ["14\" 2.8K OLED", "Intele Core Ultra 7", "16GB RAM", "1TB SSD"], images: [], featured: true },
  { id: "l2", name: "Dell XPS 13 Plus", brand: "Dell", category: "laptop", price: 1399, originalPrice: 1599, rating: 4.4, reviewCount: 250, description: "Cutting-edge design with powerful performance.", specifications: ["13.4\" 4K Touch", "Intel Core i7", "16GB RAM", "512GB SSD"], images: [], featured: true },
  { id: "l3", name: "MacBook Air M3", brand: "Apple", category: "laptop", price: 1099, originalPrice: 1199, rating: 4.9, reviewCount: 920, description: "Lean, mean, M3 machine with incredible battery.", specifications: ["13.6\" Liquid Retina", "Apple M3 Chip", "8GB Unified", "256GB SSD"], images: [], featured: true },
  { id: "l4", name: "Lenovo Yoga Slim 7i", brand: "Lenova", category: "laptop", price: 949, originalPrice: 1099, rating: 4.3, reviewCount: 180, description: "Sleek and powerful for everyday productivity.", specifications: ["14\" 2.8K OLED", "Intel Core Ultra 5", "16GB RAM", "512GB SSD"], images: [], featured: false },
  { id: "l5", name: "Acer Swift Go 14", brand: "Acer", category: "laptop", price: 749, originalPrice: 849, rating: 4.2, reviewCount: 130, description: "TwinAir cooling and brilliant OLED visuals.", specifications: ["14\" OLED", "Intel Core Ultra 7", "16GB RAM", "512GB SSD"], images: [], featured: false },
  { id: "l6", name: "Asus ROG Zephyrus G14", brand: "Asus", category: "laptop", price: 1599, originalPrice: 1799, rating: 4.7, reviewCount: 280, description: "The most powerful 14-inch gaming laptop.", specifications: ["14\" QHD+ 120Hz", "Ryzen 9", "RTX 4060", "16GB RAM"], images: [], featured: true },
  { id: "l7", name: "Samsung Galaxy Book4 Ultra", brand: "Samsung", category: "laptop", price: 2399, originalPrice: 2599, rating: 4.6, reviewCount: 95, description: "Ultra performance with NVIDIA GeForce RTX.", specifications: ["16\" 3K AMOLED", "Core Ultra 9", "RTX 4070", "1TB SSD"], images: [], featured: false },
  { id: "l8", name: "Surface Laptop 5", brand: "Microsoft", category: "laptop", price: 999, originalPrice: 1199, rating: 4.4, reviewCount: 210, description: "Sleek, fast, and light with touch screen.", specifications: ["13.5\" PixelSense", "Intel Core i5", "8GB RAM", "256GB SSD"], images: [], featured: false },
  { id: "l9", name: "MSI Stealth 14 Studio", brand: "MSI", category: "laptop", price: 1499, originalPrice: 1699, rating: 4.5, reviewCount: 120, description: "Slim gaming laptop with studio-grade color.", specifications: ["14\" QHD+ 240Hz", "Intel Core i7", "RTX 4060", "16GB RAM"], images: [], featured: false },
  { id: "l10", name: "Motorola EdgeBook Pro", brand: "Motorola", category: "laptop", price: 899, originalPrice: 999, rating: 4.1, reviewCount: 45, description: "Seamless ecosystem integration and mobility.", specifications: ["15.6\" FHD", "Intel Core i5", "16GB RAM", "512GB SSD"], images: [], featured: false },
  { id: "l11", name: "Walker G-Series", brand: "Walker", category: "laptop", price: 699, originalPrice: 799, rating: 4.0, reviewCount: 30, description: "Efficient and durable for budget users.", specifications: ["15.6\" HD", "Ryzen 5", "8GB RAM", "512GB SSD"], images: [], featured: false },
];


export const reviews: Review[] = [
  { id: "1", productId: "1", name: "John Doe", rating: 5, comment: "Amazing phone! The camera quality is outstanding.", date: "2024-03-15" },
  { id: "2", productId: "1", name: "Sarah Smith", rating: 4, comment: "Great performance but a bit pricey.", date: "2024-03-10" },
  { id: "3", productId: "3", name: "Mike Johnson", rating: 5, comment: "Best laptop I've ever owned. Battery life is incredible.", date: "2024-03-12" },
  { id: "4", productId: "2", name: "Emily Chen", rating: 5, comment: "Beautiful display and smooth performance!", date: "2024-03-08" },
  { id: "5", productId: "4", name: "Alex Wilson", rating: 4, comment: "Lightweight and powerful. Perfect for work.", date: "2024-03-05" },
];

export const offers: Offer[] = [
  { id: "1", title: "Summer Sale", description: "Get huge discounts on all electronic items this summer!", discount: 50, active: true },
  { id: "2", title: "Accessories Deal", description: "Buy 2 accessories and get 1 absolutely free.", discount: 30, active: false },
];

export const WHATSAPP_NUMBER = "91XXXXXXXXXX";
export const INSTAGRAM_URL = "https://instagram.com/techzone";
