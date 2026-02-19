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
  discount: number;
  image?: string;
  active: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "iPhone 14 Pro",
    brand: "Apple",
    category: "phone",
    price: 999,
    originalPrice: 1999,
    rating: 4.8,
    reviewCount: 245,
    description: "The most advanced iPhone ever with A16 Bionic chip, Dynamic Island, and an innovative 48MP camera system.",
    specifications: ["6.1\" Super Retina XDR Display", "A16 Bionic Chip", "48MP Camera System", "128GB Storage", "Face ID", "5G Capable"],
    images: [],
    featured: true,
  },
  {
    id: "2",
    name: "Samsung Galaxy S23",
    brand: "Samsung",
    category: "phone",
    price: 799,
    originalPrice: 1199,
    rating: 4.6,
    reviewCount: 189,
    description: "Premium Android experience with Snapdragon 8 Gen 2, stunning AMOLED display, and versatile camera.",
    specifications: ["6.1\" Dynamic AMOLED 2X", "Snapdragon 8 Gen 2", "50MP Triple Camera", "128GB Storage", "5G Ready"],
    images: [],
    featured: true,
  },
  {
    id: "3",
    name: "MacBook Pro M3",
    brand: "Apple",
    category: "laptop",
    price: 1299,
    originalPrice: 1999,
    rating: 4.9,
    reviewCount: 312,
    description: "Supercharged by M3 chip. Up to 18 hours battery life. Stunning Liquid Retina XDR display.",
    specifications: ["14\" Liquid Retina XDR", "Apple M3 Chip", "8GB Unified Memory", "512GB SSD", "Up to 18hr Battery"],
    images: [],
    featured: true,
  },
  {
    id: "4",
    name: "Dell XPS 13",
    brand: "Dell",
    category: "laptop",
    price: 999,
    originalPrice: 1499,
    rating: 4.5,
    reviewCount: 156,
    description: "Ultra-portable laptop with InfinityEdge display and 12th Gen Intel processor.",
    specifications: ["13.4\" FHD+ Display", "12th Gen Intel Core i7", "16GB RAM", "512GB SSD", "Thunderbolt 4"],
    images: [],
    featured: true,
  },
  {
    id: "5",
    name: "Google Pixel 8",
    brand: "Google",
    category: "phone",
    price: 699,
    originalPrice: 999,
    rating: 4.4,
    reviewCount: 98,
    description: "The best of Google with Tensor G3 chip, amazing camera, and 7 years of updates.",
    specifications: ["6.2\" OLED Display", "Google Tensor G3", "50MP Camera", "128GB Storage", "7 Years Updates"],
    images: [],
    featured: false,
  },
  {
    id: "6",
    name: "HP Spectre x360",
    brand: "HP",
    category: "laptop",
    price: 1149,
    originalPrice: 1599,
    rating: 4.3,
    reviewCount: 87,
    description: "Convertible 2-in-1 laptop with OLED display and premium build quality.",
    specifications: ["13.5\" OLED Display", "Intel Core i7", "16GB RAM", "1TB SSD", "360° Hinge"],
    images: [],
    featured: false,
  },
  {
    id: "7",
    name: "OnePlus 12",
    brand: "OnePlus",
    category: "phone",
    price: 649,
    originalPrice: 899,
    rating: 4.5,
    reviewCount: 134,
    description: "Flagship killer with Snapdragon 8 Gen 3 and 100W fast charging.",
    specifications: ["6.82\" AMOLED Display", "Snapdragon 8 Gen 3", "50MP Hasselblad Camera", "256GB Storage", "100W Charging"],
    images: [],
    featured: false,
  },
  {
    id: "8",
    name: "ASUS ROG Zephyrus",
    brand: "ASUS",
    category: "laptop",
    price: 1599,
    originalPrice: 2199,
    rating: 4.7,
    reviewCount: 203,
    description: "Ultra-slim gaming laptop with RTX 4060 and 240Hz display.",
    specifications: ["14\" QHD 240Hz Display", "AMD Ryzen 9", "RTX 4060", "16GB RAM", "1TB SSD"],
    images: [],
    featured: false,
  },
];

export const reviews: Review[] = [
  { id: "1", productId: "1", name: "John Doe", rating: 5, comment: "Amazing phone! The camera quality is outstanding.", date: "2024-03-15" },
  { id: "2", productId: "1", name: "Sarah Smith", rating: 4, comment: "Great performance but a bit pricey.", date: "2024-03-10" },
  { id: "3", productId: "3", name: "Mike Johnson", rating: 5, comment: "Best laptop I've ever owned. Battery life is incredible.", date: "2024-03-12" },
  { id: "4", productId: "2", name: "Emily Chen", rating: 5, comment: "Beautiful display and smooth performance!", date: "2024-03-08" },
  { id: "5", productId: "4", name: "Alex Wilson", rating: 4, comment: "Lightweight and powerful. Perfect for work.", date: "2024-03-05" },
];

export const offers: Offer[] = [
  { id: "1", title: "Summer Sale - 50% OFF on All Products!", discount: 50, active: true },
  { id: "2", title: "Buy 2 Get 1 Free on Accessories", discount: 30, active: false },
];

export const WHATSAPP_NUMBER = "91XXXXXXXXXX";
export const INSTAGRAM_URL = "https://instagram.com/techzone";
