import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
    Product,
    Review,
    Offer,
    Category,
    ProductModel,
    Variant,
    Brand,
} from "@/data/products";

interface DataContextType {
    products: Product[];
    reviews: Review[];
    offers: Offer[];
    categories: Category[];
    brands: Brand[];
    models: ProductModel[];
    loading: boolean;
    addProduct: (product: Partial<Product>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addCategory: (category: Partial<Category>) => Promise<void>;
    updateCategory: (category: Category) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    addBrand: (brand: Partial<Brand>) => Promise<void>;
    updateBrand: (brand: Brand) => Promise<void>;
    deleteBrand: (id: string) => Promise<void>;
    addOffer: (offer: Partial<Offer>) => Promise<void>;
    updateOffer: (offer: Offer) => Promise<void>;
    deleteOffer: (id: string) => Promise<void>;
    addReview: (review: Partial<Review>) => Promise<void>;
    deleteReview: (id: string) => Promise<void>;
    fetchReviews: (productId: string) => Promise<Review[]>;
    activeOffer: Offer | null;
    fetchModelsByCategory: (category: string) => Promise<ProductModel[]>;
    fetchVariants: (productId: string) => Promise<Variant[]>;
    addVariant: (variant: Partial<Variant>) => Promise<void>;
    updateVariant: (variant: Variant) => Promise<void>;
    deleteVariant: (id: string) => Promise<void>;
    fetchMyOrders: () => Promise<any[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("aaro_token");

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [models, setModels] = useState<ProductModel[]>([]);
    const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
    const [loading, setLoading] = useState(true);

    const mapProduct = (p: any): Product => ({ ...p, id: p._id || p.id });
    const mapCategory = (c: any): Category => ({ ...c, id: c._id || c.id });
    const mapBrand = (b: any): Brand => ({ ...b, id: b._id || b.id });
    const mapOffer = (o: any): Offer => ({ ...o, id: o._id || o.id });
    const mapReview = (r: any): Review => ({ ...r, id: r._id || r.id });
    const mapModel = (m: any): ProductModel => ({ ...m, id: m._id || m.id });
    const mapVariant = (v: any): Variant => ({ ...v, id: v._id || v.id });

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/products`);
            if (res.ok) setProducts((await res.json()).map(mapProduct));
        } catch (e) {
            console.error("Products fetch failed:", e);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/categories`);
            if (res.ok) setCategories((await res.json()).map(mapCategory));
        } catch (e) {
            console.error("Categories fetch failed:", e);
        }
    };

    const fetchBrands = async () => {
        try {
            const res = await fetch(`${API_URL}/brands`);
            if (res.ok) setBrands((await res.json()).map(mapBrand));
        } catch (e) {
            console.error("Brands fetch failed:", e);
        }
    };

    const fetchOffers = async () => {
        try {
            const res = await fetch(`${API_URL}/offers`);
            if (res.ok) {
                const data = (await res.json()).map(mapOffer);
                setOffers(data);
                setActiveOffer(data.find((o: Offer) => o.active) || null);
            }
        } catch (e) {
            console.error("Offers fetch failed:", e);
        }
    };

    const fetchModels = async () => {
        try {
            const res = await fetch(`${API_URL}/models`);
            if (res.ok) setModels((await res.json()).map(mapModel));
        } catch (e) {
            console.error("Models fetch failed:", e);
        }
    };

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            try {
                const [productsRes, categoriesRes, offersRes, modelsRes, brandsRes] =
                    await Promise.all([
                        fetch(`${API_URL}/products`),
                        fetch(`${API_URL}/categories`),
                        fetch(`${API_URL}/offers`),
                        fetch(`${API_URL}/models`),
                        fetch(`${API_URL}/brands`),
                    ]);

                const [productsData, categoriesData, offersData, modelsData, brandsData] =
                    await Promise.all([
                        productsRes.json(),
                        categoriesRes.json(),
                        offersRes.json(),
                        modelsRes.json(),
                        brandsRes.json(),
                    ]);

                setProducts(productsData.map(mapProduct));
                setCategories(categoriesData.map(mapCategory));
                setBrands(brandsData.map(mapBrand));
                setOffers(offersData.map(mapOffer));
                setActiveOffer(offersData.map(mapOffer).find((o: Offer) => o.active) || null);
                setModels(modelsData.map(mapModel));
            } catch (e) {
                console.error("Initial data fetch failed:", e);
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, []);

    // ── Products ──
    const addProduct = async (product: Partial<Product>) => {
        const res = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(product),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchProducts();
    };

    const updateProduct = async (product: Product) => {
        const res = await fetch(`${API_URL}/products/${product.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(product),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchProducts();
    };

    const deleteProduct = async (id: string) => {
        await fetch(`${API_URL}/products/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        await fetchProducts();
    };

    // ── Categories ──
    const addCategory = async (category: Partial<Category>) => {
        const res = await fetch(`${API_URL}/categories`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(category),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchCategories();
    };

    const updateCategory = async (category: Category) => {
        const res = await fetch(`${API_URL}/categories/${category.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(category),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchCategories();
    };

    const deleteCategory = async (id: string) => {
        await fetch(`${API_URL}/categories/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        await fetchCategories();
    };

    // ── Brands ──
    const addBrand = async (brand: Partial<Brand>) => {
        const res = await fetch(`${API_URL}/brands`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(brand),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchBrands();
    };

    const updateBrand = async (brand: Brand) => {
        const res = await fetch(`${API_URL}/brands/${brand.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(brand),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchBrands();
    };

    const deleteBrand = async (id: string) => {
        await fetch(`${API_URL}/brands/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        await fetchBrands();
    };

    // ── Offers ──
    const addOffer = async (offer: Partial<Offer>) => {
        const res = await fetch(`${API_URL}/offers`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(offer),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchOffers();
    };

    const updateOffer = async (offer: Offer) => {
        const res = await fetch(`${API_URL}/offers/${offer.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(offer),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchOffers();
    };

    const deleteOffer = async (id: string) => {
        try {
            const token = localStorage.getItem("aaro_token");
            await fetch(`${API_URL}/offers/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setOffers((prev) => prev.filter((o) => o.id !== id)); // Assuming 'id' is the correct property
            // toast.success("Offer deleted"); // Assuming toast is available
        } catch (err: any) {
            console.error(err.message || "Failed to delete offer"); // Log error instead of toast
            // toast.error(err.message || "Failed to delete offer");
        }
    };

    // ── Reviews ──
    const fetchReviews = async (productId: string): Promise<Review[]> => {
        try {
            const res = await fetch(`${API_URL}/reviews/${productId}`);
            if (res.ok) return (await res.json()).map(mapReview);
        } catch (e) {
            console.error("Reviews fetch failed:", e);
        }
        return [];
    };

    const addReview = async (review: Partial<Review>) => {
        const res = await fetch(`${API_URL}/reviews`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(review),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchProducts(); // refresh rating/count
    };

    const deleteReview = async (id: string) => {
        await fetch(`${API_URL}/reviews/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        await fetchProducts();
    };

    // ── Models ──
    const fetchModelsByCategory = async (category: string) => {
        try {
            const res = await fetch(`${API_URL}/models?category=${category}`);
            if (!res.ok) throw new Error("Failed to fetch models");
            return (await res.json()).map(mapModel);
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    // ── Variants ──
    const fetchVariants = async (productId: string): Promise<Variant[]> => {
        try {
            const res = await fetch(`${API_URL}/variants/${productId}`);
            if (res.ok) return (await res.json()).map(mapVariant);
        } catch (e) {
            console.error("Variants fetch failed:", e);
        }
        return [];
    };

    const addVariant = async (variant: Partial<Variant>) => {
        const res = await fetch(`${API_URL}/variants`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(variant),
        });
        if (!res.ok) throw new Error((await res.json()).message);
    };

    const updateVariant = async (variant: Variant) => {
        const res = await fetch(`${API_URL}/variants/${variant.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(variant),
        });
        if (!res.ok) throw new Error((await res.json()).message);
    };

    const deleteVariant = async (id: string) => {
        const res = await fetch(`${API_URL}/variants/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error((await res.json()).message);
    };

    const fetchMyOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`, {
                headers: authHeaders(),
            });
            return await res.json();
        } catch (err) {
            console.error("Failed to fetch my orders", err);
            return [];
        }
    };

    return (
        <DataContext.Provider
            value={{
                products,
                reviews,
                offers,
                categories,
                brands,
                models,
                loading,
                activeOffer,
                addProduct,
                updateProduct,
                deleteProduct,
                addCategory,
                updateCategory,
                deleteCategory,
                addBrand,
                updateBrand,
                deleteBrand,
                addOffer,
                updateOffer,
                deleteOffer,
                addReview,
                deleteReview,
                fetchReviews,
                fetchModelsByCategory,
                fetchVariants,
                addVariant,
                updateVariant,
                deleteVariant,
                fetchMyOrders,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within a DataProvider");
    return context;
};
