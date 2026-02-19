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

    useEffect(() => {
        localStorage.setItem("products", JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem("reviews", JSON.stringify(reviews));
    }, [reviews]);

    useEffect(() => {
        localStorage.setItem("offers", JSON.stringify(offers));
    }, [offers]);

    const addProduct = (product: Product) => {
        setProducts((prev) => [...prev, product]);
    };

    const updateProduct = (updatedProduct: Product) => {
        setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    };

    const deleteProduct = (id: string) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
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
