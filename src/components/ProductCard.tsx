import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="bg-card rounded-lg p-4 shadow-card hover-lift group animate-fade-in">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-secondary/50 group-hover:scale-105 transition-transform duration-500">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60"; // Fallback image
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {product.category === "phone" ? "📱" : "💻"}
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-destructive/90 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg backdrop-blur-sm">
              -{discount}%
            </div>
          )}
        </div>
      </Link>

      <Link to={`/product/${product.id}`}>
        <h3 className="font-semibold text-foreground text-sm truncate hover:text-primary transition-colors">{product.name}</h3>
      </Link>

      <div className="flex items-center gap-1 mt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
      </div>

      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-xl font-bold text-primary">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through ml-2">₹{product.originalPrice}</span>
          )}
        </div>
        {discount > 0 && <span className="text-xs gradient-peach text-primary-foreground px-1.5 py-0.5 rounded-md font-medium">{discount}% OFF</span>}
      </div>

      <button
        onClick={() => { addToCart(product); toast.success(`${product.name} added to cart!`); }}
        className="w-full mt-3 py-2 rounded-lg gradient-peach text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        <ShoppingCart className="w-4 h-4" /> Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
