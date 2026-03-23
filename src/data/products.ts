export interface Product {
  id: string;
  _id?: string;
  name: string;
  brand: string;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  specifications: {
    display?: string;
    processor?: string;
    ram?: string;
    storage?: string;
    battery?: string;
    camera?: string;
    graphics?: string;
  };
  features: string[];
  images: string[];
  videoUrl?: string;
  featured: boolean;
  isTrending?: boolean;
  modelId?: string;
  variants?: Variant[];
  tag?: string;
  condition?: 'new' | 'refurbished';
}

export interface ProductModel {
  _id: string;
  name: string;
  category: 'phone' | 'laptop';
  brand: string;
  specificationsTemplate?: Product['specifications'];
  featuresTemplate?: string[];
}

export interface Variant {
  _id?: string;
  id?: string;
  productId: string;
  ram: string;
  storage: string;
  color: string;
  price: number;
  originalPrice: number;
  stock: number;
  sku: string;
  isAvailable: boolean;
  condition?: 'new' | 'refurbished';
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  productCount: number;
}

export interface Brand {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  image?: string;
  productCount: number;
}

export interface Review {
  id: string;
  _id?: string;
  productId: string;
  name: string;
  comment: string;
  rating: number;
  createdAt?: string;
}

export interface Offer {
  id: string;
  _id?: string;
  title: string;
  description: string;
  discount: number;
  code: string;
  image?: string;
  active: boolean;
  tag?: string;
}

export interface Banner {
  id: string;
  _id?: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
  position: 'hero' | 'center';
  order: number;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  joinedDate: string;
  totalOrders: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
}

export const products: Product[] = [];
export const categories: Category[] = [];
export const customers: Customer[] = [];
export const orders: Order[] = [];
export const reviews: Review[] = [];
export const offers: Offer[] = [];

export interface Branch {
  _id?: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  hours: string;
  closed: string;
  mapUrl: string;
}

export interface ContactSettings {
  phone: string;
  email: string;
  address: string;
  whatsappNumber: string;
  instagramUrl: string;
  instagramHandle: string;
  whatsappGroupLink: string;
  logoUrl: string;
  branches: Branch[];
}

// Empty defaults — all real data comes from admin panel → backend DB
export const DEFAULT_CONTACT: ContactSettings = {
  phone: "",
  email: "",
  address: "",
  whatsappNumber: "",
  instagramUrl: "https://www.instagram.com/aaro_groups?igsh=MTZvOTcweHVma3UyeA%3D%3D&utm_source=qr",
  instagramHandle: "@aaro_groups",
  whatsappGroupLink: "",
  logoUrl: "",
  branches: [],
};

export const WHATSAPP_NUMBER = "";
export const INSTAGRAM_URL = "https://www.instagram.com/aaro_groups?igsh=MTZvOTcweHVma3UyeA%3D%3D&utm_source=qr";
export const INSTAGRAM_LINK = "https://www.instagram.com/aaro_groups?igsh=MTZvOTcweHVma3UyeA%3D%3D&utm_source=qr";
export const WHATSAPP_GROUP_LINK = "";
