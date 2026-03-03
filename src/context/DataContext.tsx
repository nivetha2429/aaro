import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
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
    addBrand: (brand: Partial<Brand>) => Promise<Brand>;
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

const API_URL = import.meta.env.VITE_API_URL || "/api";

const getToken = () => localStorage.getItem("aaro_token");

const isJwtExpired = (token: string): boolean => {
    try {
        // JWT uses base64url — convert to standard base64 before atob
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

// Normalize image URLs: convert any stored absolute localhost URL to a relative path
// so they work regardless of which port the server was on when they were uploaded.
const normalizeImageUrl = (url: string): string => {
    if (!url) return url;
    try {
        const parsed = new URL(url);
        if (parsed.hostname === "localhost") return parsed.pathname;
    } catch { /* not an absolute URL, leave as-is */ }
    return url;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [models, setModels] = useState<ProductModel[]>([]);
    const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
    const [loading, setLoading] = useState(true);

    // ── Global 401 handler: auto-logout on expired/invalid token ──────────────
    const handleUnauthorized = useCallback(() => {
        // Clear auth first, then navigate so ProtectedRoute doesn't race
        logout();
        toast.error("Session expired. Please log in again.", { duration: 4000 });
        // Small delay so the toast renders before the page unmounts
        setTimeout(() => navigate("/login", { replace: true }), 300);
    }, [logout, navigate]);

    const guardedFetch = useCallback(async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
        // Check token expiry client-side before hitting the network
        const token = getToken();
        if (!token || isJwtExpired(token)) {
            handleUnauthorized();
            throw new Error("__SESSION_EXPIRED__");
        }
        const res = await fetch(input, init);
        if (res.status === 401) {
            handleUnauthorized();
            // Throw a special sentinel so callers don't show a second error toast
            throw new Error("__SESSION_EXPIRED__");
        }
        return res;
    }, [handleUnauthorized]);

    const mapProduct = (p: any): Product => ({
        ...p,
        id: p._id || p.id,
        images: Array.isArray(p.images) ? p.images.map(normalizeImageUrl) : p.images,
    });
    const mapCategory = (c: any): Category => ({ ...c, id: c._id || c.id, image: normalizeImageUrl(c.image) });
    const mapBrand = (b: any): Brand => ({ ...b, id: b._id || b.id, image: normalizeImageUrl(b.image) });
    const mapOffer = (o: any): Offer => ({ ...o, id: o._id || o.id, image: normalizeImageUrl(o.image) });
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
            const res = await fetch(`${API_URL}/products/models`);
            if (res.ok) setModels((await res.json()).map(mapModel));
        } catch (e) {
            console.error("Models fetch failed:", e);
        }
    };

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            const results = await Promise.allSettled([
                fetch(`${API_URL}/products`).then(r => r.ok ? r.json() : Promise.reject(`products ${r.status}`)),
                fetch(`${API_URL}/categories`).then(r => r.ok ? r.json() : Promise.reject(`categories ${r.status}`)),
                fetch(`${API_URL}/offers`).then(r => r.ok ? r.json() : Promise.reject(`offers ${r.status}`)),
                fetch(`${API_URL}/products/models`).then(r => r.ok ? r.json() : Promise.reject(`models ${r.status}`)),
                fetch(`${API_URL}/brands`).then(r => r.ok ? r.json() : Promise.reject(`brands ${r.status}`)),
            ]);

            const [productsResult, categoriesResult, offersResult, modelsResult, brandsResult] = results;

            if (productsResult.status === 'fulfilled' && Array.isArray(productsResult.value))
                setProducts(productsResult.value.map(mapProduct));
            else console.error("Products fetch failed:", productsResult.status === 'rejected' ? productsResult.reason : 'not array');

            if (categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value))
                setCategories(categoriesResult.value.map(mapCategory));
            else console.error("Categories fetch failed:", categoriesResult.status === 'rejected' ? categoriesResult.reason : 'not array');

            if (offersResult.status === 'fulfilled' && Array.isArray(offersResult.value)) {
                const offersData = offersResult.value.map(mapOffer);
                setOffers(offersData);
                setActiveOffer(offersData.find((o: Offer) => o.active) || null);
            } else console.error("Offers fetch failed:", offersResult.status === 'rejected' ? offersResult.reason : 'not array');

            if (modelsResult.status === 'fulfilled' && Array.isArray(modelsResult.value))
                setModels(modelsResult.value.map(mapModel));
            else console.error("Models fetch failed:", modelsResult.status === 'rejected' ? modelsResult.reason : 'not array');

            if (brandsResult.status === 'fulfilled' && Array.isArray(brandsResult.value))
                setBrands(brandsResult.value.map(mapBrand));
            else console.error("Brands fetch failed:", brandsResult.status === 'rejected' ? brandsResult.reason : 'not array');

            setLoading(false);
        };
        loadAllData();
    }, []);

    // ── Products ──
    const addProduct = async (product: Partial<Product>) => {
        const res = await guardedFetch(`${API_URL}/products`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(product),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchProducts();
    };

    const updateProduct = async (product: Product) => {
        const res = await guardedFetch(`${API_URL}/products/${product.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(product),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchProducts();
    };

    const deleteProduct = async (id: string) => {
        await guardedFetch(`${API_URL}/products/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        await fetchProducts();
    };

    // ── Categories ──
    const addCategory = async (category: Partial<Category>) => {
        const res = await guardedFetch(`${API_URL}/categories`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(category),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchCategories();
    };

    const updateCategory = async (category: Category) => {
        const res = await guardedFetch(`${API_URL}/categories/${category.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(category),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchCategories();
    };

    const deleteCategory = async (id: string) => {
        await guardedFetch(`${API_URL}/categories/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        await fetchCategories();
    };

    // ── Brands ──
    const addBrand = async (brand: Partial<Brand>): Promise<Brand> => {
        const res = await guardedFetch(`${API_URL}/brands`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(brand),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        const created = await res.json();
        await fetchBrands();
        return mapBrand(created);
    };

    const updateBrand = async (brand: Brand) => {
        const res = await guardedFetch(`${API_URL}/brands/${brand.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(brand),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchBrands();
    };

    const deleteBrand = async (id: string) => {
        const res = await guardedFetch(`${API_URL}/brands/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error((await res.json()).message || "Delete failed");
        await fetchBrands();
    };

    // ── Offers ──
    const addOffer = async (offer: Partial<Offer>) => {
        const res = await guardedFetch(`${API_URL}/offers`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(offer),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchOffers();
    };

    const updateOffer = async (offer: Offer) => {
        const res = await guardedFetch(`${API_URL}/offers/${offer.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(offer),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchOffers();
    };

    const deleteOffer = async (id: string) => {
        const res = await guardedFetch(`${API_URL}/offers/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchOffers();
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
        const res = await guardedFetch(`${API_URL}/reviews`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(review),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchProducts();
    };

    const deleteReview = async (id: string) => {
        await guardedFetch(`${API_URL}/reviews/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        await fetchProducts();
    };

    // ── Models ──
    const fetchModelsByCategory = async (category: string) => {
        try {
            const res = await fetch(`${API_URL}/products/models?category=${category}`);
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
            const res = await fetch(`${API_URL}/products/variants/${productId}`);
            if (res.ok) return (await res.json()).map(mapVariant);
        } catch (e) {
            console.error("Variants fetch failed:", e);
        }
        return [];
    };

    const addVariant = async (variant: Partial<Variant>) => {
        const res = await guardedFetch(`${API_URL}/products/variants`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(variant),
        });
        if (!res.ok) throw new Error((await res.json()).message);
    };

    const updateVariant = async (variant: Variant) => {
        const res = await guardedFetch(`${API_URL}/products/variants/${variant.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(variant),
        });
        if (!res.ok) throw new Error((await res.json()).message);
    };

    const deleteVariant = async (id: string) => {
        const res = await guardedFetch(`${API_URL}/products/variants/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error((await res.json()).message);
    };

    const fetchMyOrders = async () => {
        try {
            const res = await guardedFetch(`${API_URL}/orders`, {
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
