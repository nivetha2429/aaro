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
  branches: Branch[];
}

export const DEFAULT_CONTACT: ContactSettings = {
  phone: "+91 70942 23143",
  email: "aarosystems.s@gmail.com",
  address: "Karur, India",
  whatsappNumber: "917094223143",
  instagramUrl: "https://instagram.com/aarosystems",
  instagramHandle: "@aarosystems",
  whatsappGroupLink: "https://chat.whatsapp.com/YOUR_GROUP_INVITE_LINK",
  branches: [
    { name: "AARO Systems — Karur Main", address: "123, Jawahar Bazaar, Near Bus Stand, Karur, Tamil Nadu 639001", phone: "+91 86680 54205", whatsapp: "917094223143", hours: "Mon – Sat: 10:00 AM – 8:00 PM", closed: "Sunday: Closed", mapUrl: "https://maps.google.com/?q=Karur+Bus+Stand+Tamil+Nadu" },
    { name: "AARO Systems — Karur Branch 2", address: "45, Kovai Road, Thanthonimalai, Karur, Tamil Nadu 639002", phone: "+91 70104 52495", whatsapp: "917010452495", hours: "Mon – Sat: 10:00 AM – 8:00 PM", closed: "Sunday: Closed", mapUrl: "https://maps.google.com/?q=Thanthonimalai+Karur+Tamil+Nadu" },
    { name: "AARO Systems — Karur Branch 3", address: "78, Pallapatti Main Road, Karur, Tamil Nadu 639003", phone: "+91 86680 54205", whatsapp: "917094223143", hours: "Mon – Sat: 10:00 AM – 9:00 PM", closed: "Sunday: Closed", mapUrl: "https://maps.google.com/?q=Pallapatti+Karur+Tamil+Nadu" },
  ],
};

export const WHATSAPP_NUMBER = DEFAULT_CONTACT.whatsappNumber;
export const INSTAGRAM_URL = DEFAULT_CONTACT.instagramUrl;
export const INSTAGRAM_LINK = DEFAULT_CONTACT.instagramUrl;
export const WHATSAPP_GROUP_LINK = DEFAULT_CONTACT.whatsappGroupLink;
