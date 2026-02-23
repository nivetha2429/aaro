import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, MessageCircle, ArrowLeft, Check } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useData } from "@/context/DataContext";
import ReviewSection from "@/components/ReviewSection";
import { toast } from "sonner";

const ProductDetails = () => {
  const { id } = useParams();
  const { products } = useData();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/shop" className="text-primary hover:underline text-sm mt-2 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=I want to order ${product.name} - ₹${product.price}`;

  return (
    <div className="container mx-auto px-4 py-6">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="glass-card rounded-lg p-8 flex items-center justify-center animate-fade-in">
          <div className="text-9xl animate-scale-in">{product.category === "phone" ? "📱" : "💻"}</div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{product.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>

          <div className="flex items-center gap-1 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} />
            ))}
            <span className="text-sm text-muted-foreground ml-2">{product.rating} ({product.reviewCount} reviews)</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-bold text-primary">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>
            )}
            {product.originalPrice > product.price && (
              <span className="bg-accent/20 text-accent px-2 py-1 rounded text-sm font-medium">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{product.description}</p>

          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-2">Specifications</h3>
            <ul className="space-y-1.5">
              {product.specifications.map((spec, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {spec}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isAdded
                  ? "bg-green-500 text-white shadow-lg"
                  : "gradient-purple text-primary-foreground hover:opacity-90"
                }`}
              disabled={isAdded}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 animate-scale-in" /> Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </>
              )}
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[hsl(142,70%,45%)] text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Order via WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-foreground mb-4">Reviews & Ratings</h2>
        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetails;
