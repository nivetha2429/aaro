import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
    Product, Review, Offer, Category, Customer, Order,
    products as initialProducts,
    reviews as initialReviews,
    offers as initialOffers,
    categories as initialCategories,
    customers as initialCustomers,
    orders as initialOrders
} from "@/data/products";

interface DataContextType {
    products: Product[];
    reviews: Review[];
    offers: Offer[];
    categories: Category[];
    customers: Customer[];
    orders: Order[];
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    addReview: (review: Review) => void;
    deleteReview: (id: string) => void;
    updateOffer: (offer: Offer) => void;
    deleteOffer: (id: string) => void;
    addOffer: (offer: Offer) => void;
    addCategory: (category: Category) => void;
    deleteCategory: (id: string) => void;
    updateOrderStatus: (id: string, status: Order["status"]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<Product[]>(() => {
        const saved = localStorage.getItem("products");
        return saved ? JSON.parse(saved) : initialProducts;
    });

    const [reviews, setReviews] = useState<Review[]>(() => {
        const saved = localStorage.getItem("reviews");
        return saved ? JSON.parse(saved) : initialReviews;
    });

    const [offers, setOffers] = useState<Offer[]>(() => {
        const saved = localStorage.getItem("offers");
        return saved ? JSON.parse(saved) : initialOffers;
    });

    const [categories, setCategories] = useState<Category[]>(() => {
        const saved = localStorage.getItem("categories");
        return saved ? JSON.parse(saved) : initialCategories;
    });

    const [customers, setCustomers] = useState<Customer[]>(() => {
        const saved = localStorage.getItem("customers");
        return saved ? JSON.parse(saved) : initialCustomers;
    });

    const [orders, setOrders] = useState<Order[]>(() => {
        const saved = localStorage.getItem("orders");
        return saved ? JSON.parse(saved) : initialOrders;
    });

    // Sync with localStorage
    useEffect(() => { localStorage.setItem("products", JSON.stringify(products)); }, [products]);
    useEffect(() => { localStorage.setItem("reviews", JSON.stringify(reviews)); }, [reviews]);
    useEffect(() => { localStorage.setItem("offers", JSON.stringify(offers)); }, [offers]);
    useEffect(() => { localStorage.setItem("categories", JSON.stringify(categories)); }, [categories]);
    useEffect(() => { localStorage.setItem("customers", JSON.stringify(customers)); }, [customers]);
    useEffect(() => { localStorage.setItem("orders", JSON.stringify(orders)); }, [orders]);

    const addProduct = (product: Product) => setProducts((prev) => [...prev, product]);
    const updateProduct = (updatedProduct: Product) => setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    const deleteProduct = (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id));
    const addReview = (review: Review) => setReviews((prev) => [...prev, review]);
    const deleteReview = (id: string) => setReviews((prev) => prev.filter((r) => r.id !== id));
    const updateOffer = (updatedOffer: Offer) => setOffers((prev) => prev.map((o) => (o.id === updatedOffer.id ? updatedOffer : o)));
    const deleteOffer = (id: string) => setOffers((prev) => prev.filter((o) => o.id !== id));
    const addOffer = (offer: Offer) => setOffers((prev) => [...prev, offer]);
    const addCategory = (category: Category) => setCategories((prev) => [...prev, category]);
    const deleteCategory = (id: string) => setCategories((prev) => prev.filter((c) => c.id !== id));
    const updateOrderStatus = (id: string, status: Order["status"]) => setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    return (
        <DataContext.Provider
            value={{
                products, reviews, offers, categories, customers, orders,
                addProduct, updateProduct, deleteProduct,
                addReview, deleteReview,
                updateOffer, deleteOffer, addOffer,
                addCategory, deleteCategory, updateOrderStatus
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error("useData must be used within a DataProvider");
    return context;
};
