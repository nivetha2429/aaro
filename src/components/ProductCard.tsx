import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { Product, Variant } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo } from "react";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const { fetchVariants } = useData();
  const { isAdmin } = useAuth();
  const [isAdded, setIsAdded] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    fetchVariants(product.id || (product as any)._id).then(setVariants);
  }, [product.id, fetchVariants]);

  const baseVariant = useMemo(() => {
    if (variants.length === 0) return null;
    return variants.find(v => v.stock > 0) || variants[0];
  }, [variants]);

  const currentPrice = baseVariant?.price || 0;
  const originalPrice = baseVariant?.originalPrice || 0;
  const discount = originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    if (isAdmin) return toast.info("Admins cannot add products to cart");
    if (!baseVariant) return toast.error("No variant available");
    addToCart(product, {
      ram: baseVariant.ram,
      storage: baseVariant.storage,
      color: baseVariant.color,
      price: baseVariant.price,
      originalPrice: baseVariant.originalPrice
    });
    toast.success(`${product.name} added to cart!`);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="glass-card rounded-3xl p-4 group animate-fade-in relative flex flex-col h-full bg-white/60 backdrop-blur-lg border border-primary/10 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2">
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-2xl mb-4 w-full">
        <div className="w-full h-full bg-secondary/30 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-contain p-4 drop-shadow-2xl"
            />
          ) : (
            <div className="text-6xl md:text-8xl drop-shadow-xl transform transition-all group-hover:rotate-6">
              {product.category === "phone" ? "📱" : "💻"}
            </div>
          )}
        </div>

        {discount > 0 && (
          <div className="absolute top-3 right-3 gradient-offer text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md">
            -{discount}%
          </div>
        )}
      </Link>

      <div className="flex-1 flex flex-col px-1">
        <div className="mb-1.5">
          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-0.5">{product.brand}</p>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-black text-foreground text-sm leading-tight hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} />
            ))}
          </div>
          <span className="text-[10px] font-bold text-muted-foreground">({product.reviewCount})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg md:text-xl font-black text-primary tracking-tighter">
              {currentPrice > 0 ? `₹${currentPrice.toLocaleString()}` : "Price Pending"}
            </span>
            {originalPrice > currentPrice && currentPrice > 0 && (
              <span className="text-[10px] text-muted-foreground line-through opacity-50 font-bold">₹{originalPrice.toLocaleString()}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-2.5 rounded-full text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 border border-white/10 ${isAdded
              ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
              : isAdmin
                ? "bg-gray-400 text-white cursor-not-allowed opacity-80"
                : "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98]"
              }`}
            disabled={isAdded || (isAdmin && !isAdded)}
          >
            {isAdded ? (
              <><Check className="w-3.5 h-3.5" /> Added</>
            ) : isAdmin ? (
              "ADMIN PREVIEW"
            ) : (
              <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
