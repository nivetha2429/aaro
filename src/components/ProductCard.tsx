import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Check, Eye } from "lucide-react";
import { toast } from "sonner";
import { Product, Variant } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo } from "react";

const ProductCard = ({ product, onQuickView }: { product: Product; onQuickView?: () => void }) => {
  const { addToCart } = useCart();
  const { fetchVariants } = useData();
  const { isAdmin } = useAuth();
  const [isAdded, setIsAdded] = useState(false);
  // Use variants already embedded in the product response; fall back to a fetch only when missing
  const [variants, setVariants] = useState<Variant[]>((product as any).variants || []);

  useEffect(() => {
    if (variants.length === 0) {
      fetchVariants(product.id || (product as any)._id).then(setVariants);
    }
  }, [product.id]);

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
    <div className="glass-card rounded-fluid-lg p-fluid group animate-fade-in relative flex flex-col h-full bg-white/60 backdrop-blur-lg border border-primary/10 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 click-scale shine-effect overflow-hidden">
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden rounded-fluid mb-1 sm:mb-3 w-full">
        <div className="w-full h-full bg-secondary/30 flex items-center justify-center relative">
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                className={`w-full h-full object-cover transition-all duration-500 ${product.images.length > 1 ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-110"}`}
              />
              {product.images.length > 1 && (
                <img
                  src={product.images[1]}
                  alt={`${product.name} alt`}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-all duration-500"
                />
              )}
            </>
          ) : (
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-xl transform transition-all group-hover:rotate-6">
              {product.category === "phone" ? "📱" : product.category === "accessory" ? "🎧" : "💻"}
            </div>
          )}
        </div>

        {/* Condition badge — top-left overlay on image */}
        <div className="absolute top-1.5 sm:top-3 left-1.5 sm:left-3 z-10">
          {(product.condition || "new") === "new" ? (
            <div className="bg-green-500 text-white text-[10px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg tracking-wider uppercase">
              New
            </div>
          ) : (
            <div className="bg-amber-500 text-white text-[10px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg tracking-wider uppercase">
              Refurbished
            </div>
          )}
        </div>
        {product.tag && (
          <div className="absolute top-7 sm:top-10 left-1.5 sm:left-3 bg-primary text-white text-[10px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg tracking-wider uppercase z-10">
            {product.tag}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-1.5 sm:top-3 right-1.5 sm:right-3 gradient-offer text-white text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full shadow-lg backdrop-blur-md">
            -{discount}%
          </div>
        )}
        {onQuickView && (
          <button
            aria-label={`Quick view ${product.name}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(); }}
            className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-foreground px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white flex items-center gap-1"
          >
            <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Quick View
          </button>
        )}
      </Link>

      <div className="flex-1 flex flex-col px-0.5 sm:px-1">
        <div className="mb-1">
          <p className="text-fluid-xs font-black text-primary uppercase tracking-widest mb-0.5">{product.brand}</p>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-black text-foreground text-fluid-sm leading-tight hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
          </Link>
        </div>

        <div className="flex items-center gap-1 mb-1.5 sm:mb-2.5">
          <div className="flex items-center" aria-label={`Rating: ${product.rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} aria-hidden="true" className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} />
            ))}
          </div>
          <span className="text-fluid-xs font-bold text-muted-foreground">({product.reviewCount})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-1 sm:gap-2 mb-1.5 sm:mb-3">
            <span className="text-fluid-lg font-black text-primary tracking-tighter">
              {currentPrice > 0 ? `₹${currentPrice.toLocaleString()}` : "Price Pending"}
            </span>
            {originalPrice > currentPrice && currentPrice > 0 && (
              <span className="text-fluid-xs text-muted-foreground line-through opacity-50 font-bold">₹{originalPrice.toLocaleString()}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-fluid min-h-[44px] rounded-fluid font-black transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-fluid-xs border border-white/10 ${isAdded
              ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
              : isAdmin
                ? "bg-gray-400 text-white cursor-not-allowed opacity-80"
                : "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98]"
              }`}
            disabled={isAdded || (isAdmin && !isAdded)}
          >
            {isAdded ? (
              <><Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Added</>
            ) : isAdmin ? (
              "ADMIN PREVIEW"
            ) : (
              <><ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Add to Cart</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ProductCard);
