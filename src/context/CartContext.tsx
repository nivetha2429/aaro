import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/data/products";

interface CartItem {
  product: Product;
  quantity: number;
  ram?: string;
  storage?: string;
  color?: string;
  price: number;
  originalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant: { ram: string, storage: string, color: string, price: number, originalPrice: number }) => void;
  removeFromCart: (productId: string, ram?: string, storage?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, ram?: string, storage?: string, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("aaro_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToCart = (product: Product, variant: { ram: string, storage: string, color: string, price: number, originalPrice: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.ram === variant.ram && i.storage === variant.storage && i.color === variant.color);
      if (existing) return prev.map((i) => (i.product.id === product.id && i.ram === variant.ram && i.storage === variant.storage && i.color === variant.color) ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1, ...variant }];
    });
  };

  const removeFromCart = (productId: string, ram?: string, storage?: string, color?: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.ram === ram && i.storage === storage && i.color === color)));
  };

  const updateQuantity = (productId: string, quantity: number, ram?: string, storage?: string, color?: string) => {
    if (quantity <= 0) return removeFromCart(productId, ram, storage, color);
    setItems((prev) => prev.map((i) => (i.product.id === productId && i.ram === ram && i.storage === storage && i.color === color) ? { ...i, quantity } : i));
  };

  useEffect(() => {
    localStorage.setItem("aaro_cart", JSON.stringify(items));
  }, [items]);

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
