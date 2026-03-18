import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isJwtExpired } from "@/lib/auth";
import { toast } from "sonner";
import {
    Product,
    Review,
    Offer,
    Category,
    ProductModel,
    Variant,
    Brand,
    Banner,
    ContactSettings,
    DEFAULT_CONTACT,
} from "@/data/products";

interface DataContextType {
    products: Product[];
    reviews: Review[];
    offers: Offer[];
    categories: Category[];
    brands: Brand[];
    models: ProductModel[];
    banners: Banner[];
    loading: boolean;
    error: string | null;
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
    addBanner: (banner: Partial<Banner>) => Promise<void>;
    updateBanner: (banner: Banner) => Promise<void>;
    deleteBanner: (id: string) => Promise<void>;
    addReview: (review: Partial<Review>) => Promise<void>;
    updateReview: (id: string, data: { rating: number; comment: string }) => Promise<void>;
    deleteReview: (id: string) => Promise<void>;
    fetchReviews: (productId: string) => Promise<Review[]>;
    activeOffer: Offer | null;
    fetchModelsByCategory: (category: string) => Promise<ProductModel[]>;
    fetchVariants: (productId: string) => Promise<Variant[]>;
    addVariant: (variant: Partial<Variant>) => Promise<void>;
    updateVariant: (variant: Variant) => Promise<void>;
    deleteVariant: (id: string) => Promise<void>;
    fetchMyOrders: () => Promise<any[]>;
    contactSettings: ContactSettings;
    updateContactSettings: (settings: ContactSettings) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "/api";

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

// Module-level variable to track token refresh in progress
let refreshPromise: Promise<any> | null = null;

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { logout, login, token: authToken } = useAuth();
    const navigate = useNavigate();

    // Get token from AuthContext (memory) only - no localStorage fallback
    const getToken = () => authToken;

    const authHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    });
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [models, setModels] = useState<ProductModel[]>([]);
    const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
    const [contactSettings, setContactSettings] = useState<ContactSettings>(DEFAULT_CONTACT);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        let res: Response;
        try {
            res = await fetch(input, { ...init, credentials: "include" });
        } catch {
            toast.error("Network error — check your internet connection");
            throw new Error("__NETWORK_ERROR__");
        }
        // On 401, try to refresh the access token once before giving up
        if (res.status === 401) {
            try {
                // If refresh is already in progress, await it instead of starting a new one
                if (refreshPromise) {
                    const data = await refreshPromise;
                    // Retry original request with refreshed token
                    const retryInit = { ...init, credentials: "include" as RequestCredentials };
                    if (!retryInit.headers) retryInit.headers = {};
                    if (typeof retryInit.headers === "object") {
                        (retryInit.headers as Record<string, string>).Authorization = `Bearer ${data.token}`;
                    }
                    const retryRes = await fetch(input, retryInit);
                    if (!retryRes.ok && retryRes.status === 401) {
                        handleUnauthorized();
                        throw new Error("__SESSION_EXPIRED__");
                    }
                    return retryRes;
                }

                // Start new refresh if not already in progress
                refreshPromise = (async () => {
                    try {
                        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
                            method: "POST",
                            credentials: "include",
                        });
                        if (refreshRes.ok) {
                            const data = await refreshRes.json();
                            // Update AuthContext with new token
                            login(data.token, data.user);
                            return data;
                        }
                        throw new Error("Refresh failed");
                    } finally {
                        refreshPromise = null;
                    }
                })();

                const data = await refreshPromise;
                // Retry original request with new token
                const retryInit = { ...init, credentials: "include" as RequestCredentials };
                if (!retryInit.headers) retryInit.headers = {};
                if (typeof retryInit.headers === "object") {
                    (retryInit.headers as Record<string, string>).Authorization = `Bearer ${data.token}`;
                }
                const retryRes = await fetch(input, retryInit);
                if (!retryRes.ok && retryRes.status === 401) {
                    handleUnauthorized();
                    throw new Error("__SESSION_EXPIRED__");
                }
                return retryRes;
            } catch { /* refresh failed */ }
            handleUnauthorized();
            throw new Error("__SESSION_EXPIRED__");
        }
        if (res.status === 403) {
            toast.error("Access denied");
            navigate("/", { replace: true });
            throw new Error("__FORBIDDEN__");
        }
        if (res.status === 429) {
            toast.error("Too many requests — please wait and try again");
            throw new Error("__RATE_LIMITED__");
        }
        if (res.status >= 500) {
            toast.error("Server error — please try again later");
        }
        return res;
    }, [handleUnauthorized, login, navigate]);

    const mapProduct = (p: any): Product => ({
        ...p,
        id: p._id || p.id,
        images: Array.isArray(p.images) ? p.images.map(normalizeImageUrl) : p.images,
    });
    const mapCategory = (c: any): Category => ({ ...c, id: c._id || c.id, image: normalizeImageUrl(c.image) });
    const mapBrand = (b: any): Brand => ({ ...b, id: b._id || b.id, image: normalizeImageUrl(b.image) });
    const mapOffer = (o: any): Offer => ({ ...o, id: o._id || o.id, image: normalizeImageUrl(o.image) });
    const mapBanner = (b: any): Banner => ({ ...b, id: b._id || b.id, image: normalizeImageUrl(b.image) });
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

    const fetchBanners = async () => {
        try {
            const res = await fetch(`${API_URL}/banners`);
            if (res.ok) setBanners((await res.json()).map(mapBanner));
        } catch (e) {
            console.error("Banners fetch failed:", e);
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

    // Fetch with a single retry on network failure
    const fetchWithRetry = async (url: string): Promise<any> => {
        try {
            const res = await fetch(url);
            if (res.ok) return await res.json();
            throw new Error(`${res.status}`);
        } catch (err) {
            // One retry after 1s
            await new Promise(r => setTimeout(r, 1000));
            const res = await fetch(url);
            if (res.ok) return await res.json();
            throw new Error(`retry failed`);
        }
    };

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            const results = await Promise.allSettled([
                fetchWithRetry(`${API_URL}/products`),
                fetchWithRetry(`${API_URL}/categories`),
                fetchWithRetry(`${API_URL}/offers`),
                fetchWithRetry(`${API_URL}/products/models`),
                fetchWithRetry(`${API_URL}/brands`),
                fetchWithRetry(`${API_URL}/banners`),
                fetchWithRetry(`${API_URL}/contact-settings`),
            ]);

            const [productsResult, categoriesResult, offersResult, modelsResult, brandsResult, bannersResult, contactResult] = results;

            if (productsResult.status === 'fulfilled' && Array.isArray(productsResult.value))
                setProducts(productsResult.value.map(mapProduct));
            else {
                const reason = productsResult.status === 'rejected' ? productsResult.reason : 'not array';
                console.error("Products fetch failed:", reason);
                setError("Failed to load products. Please try again later.");
            }

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

            if (bannersResult.status === 'fulfilled' && Array.isArray(bannersResult.value))
                setBanners(bannersResult.value.map(mapBanner));
            else console.error("Banners fetch failed:", bannersResult.status === 'rejected' ? bannersResult.reason : 'not array');

            if (contactResult.status === 'fulfilled' && contactResult.value && contactResult.value.phone !== undefined)
                setContactSettings({ ...DEFAULT_CONTACT, ...contactResult.value });
            else console.error("Contact settings fetch failed:", contactResult.status === 'rejected' ? contactResult.reason : 'empty');

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
        const res = await guardedFetch(`${API_URL}/products/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error((await res.json()).message);
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

    // ── Banners ──
    const addBanner = async (banner: Partial<Banner>) => {
        const res = await guardedFetch(`${API_URL}/banners`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(banner),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchBanners();
    };

    const updateBanner = async (banner: Banner) => {
        const res = await guardedFetch(`${API_URL}/banners/${banner.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(banner),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchBanners();
    };

    const deleteBanner = async (id: string) => {
        const res = await guardedFetch(`${API_URL}/banners/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchBanners();
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

    const updateReview = async (id: string, data: { rating: number; comment: string }) => {
        const res = await guardedFetch(`${API_URL}/reviews/${id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(data),
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
        await fetchProducts();
    };

    const updateVariant = async (variant: Variant) => {
        const res = await guardedFetch(`${API_URL}/products/variants/${variant.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(variant),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchProducts();
    };

    const deleteVariant = async (id: string) => {
        const res = await guardedFetch(`${API_URL}/products/variants/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        await fetchProducts();
    };

    // ── Contact Settings ──
    const updateContactSettings = async (settings: ContactSettings) => {
        const res = await guardedFetch(`${API_URL}/contact-settings`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(settings),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update contact settings");
        setContactSettings({ ...DEFAULT_CONTACT, ...data });
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

    const contextValue = useMemo(() => ({
        products,
        reviews,
        offers,
        categories,
        brands,
        models,
        banners,
        loading,
        error,
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
        addBanner,
        updateBanner,
        deleteBanner,
        addReview,
        updateReview,
        deleteReview,
        fetchReviews,
        fetchModelsByCategory,
        fetchVariants,
        addVariant,
        updateVariant,
        deleteVariant,
        fetchMyOrders,
        contactSettings,
        updateContactSettings,
    }), [products, reviews, offers, categories, brands, models, banners, loading, error, activeOffer, contactSettings]);

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within a DataProvider");
    return context;
};
