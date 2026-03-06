import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { toast } from "sonner";

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string, productName?: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  totalWishlistItems: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "aaro_wishlist";

const loadWishlist = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<string[]>(loadWishlist);

  const persist = (items: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const toggleWishlist = useCallback((productId: string, productName?: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      persist(next);
      if (exists) {
        toast.info(productName ? `${productName} removed from wishlist` : "Removed from wishlist");
      } else {
        toast.success(productName ? `${productName} added to wishlist` : "Added to wishlist");
      }
      return next;
    });
  }, []);

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    persist([]);
    toast.info("Wishlist cleared");
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, clearWishlist, totalWishlistItems: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
