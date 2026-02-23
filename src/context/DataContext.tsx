import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, Review, Offer, products as initialProducts, reviews as initialReviews, offers as initialOffers } from "@/data/products";

interface DataContextType {
    products: Product[];
    reviews: Review[];
    offers: Offer[];
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    addReview: (review: Review) => void;
    deleteReview: (id: string) => void;
    updateOffer: (offer: Offer) => void;
    deleteOffer: (id: string) => void;
    addOffer: (offer: Offer) => void;
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

    // Fetch products from API on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/products`);
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to fetch products from API:", error);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        localStorage.setItem("products", JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem("reviews", JSON.stringify(reviews));
    }, [reviews]);

    useEffect(() => {
        localStorage.setItem("offers", JSON.stringify(offers));
    }, [offers]);

    const addProduct = async (product: Product) => {
        try {
            const response = await fetch(`${API_URL}/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product),
            });
            if (response.ok) {
                const newProduct = await response.json();
                setProducts((prev) => [...prev, newProduct]);
            } else {
                setProducts((prev) => [...prev, product]);
            }
        } catch (error) {
            setProducts((prev) => [...prev, product]);
        }
    };

    const updateProduct = async (updatedProduct: Product) => {
        try {
            // MongoDB uses _id, but we use id in frontend. 
            // We'll need to handle this mapping in the backend or frontend.
            // For now, let's assume the backend handles the mapping or we use the existing id.
            const response = await fetch(`${API_URL}/products/${updatedProduct.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProduct),
            });
            if (response.ok) {
                const data = await response.json();
                setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
            } else {
                setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
            }
        } catch (error) {
            setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setProducts((prev) => prev.filter((p) => p.id !== id));
            } else {
                setProducts((prev) => prev.filter((p) => p.id !== id));
            }
        } catch (error) {
            setProducts((prev) => prev.filter((p) => p.id !== id));
        }
    };

    const addReview = (review: Review) => {
        setReviews((prev) => [...prev, review]);
    };

    const deleteReview = (id: string) => {
        setReviews((prev) => prev.filter((r) => r.id !== id));
    };

    const updateOffer = (updatedOffer: Offer) => {
        setOffers((prev) => prev.map((o) => (o.id === updatedOffer.id ? updatedOffer : o)));
    };

    const deleteOffer = (id: string) => {
        setOffers((prev) => prev.filter((o) => o.id !== id));
    };

    const addOffer = (offer: Offer) => {
        setOffers((prev) => [...prev, offer]);
    };

    return (
        <DataContext.Provider
            value={{
                products,
                reviews,
                offers,
                addProduct,
                updateProduct,
                deleteProduct,
                addReview,
                deleteReview,
                updateOffer,
                deleteOffer,
                addOffer,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};
