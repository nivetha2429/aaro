import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Check, X, ExternalLink } from "lucide-react";
import { Product, Variant } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

const QuickViewModal = ({ product, onClose }: QuickViewModalProps) => {
  const { addToCart } = useCart();
  const { fetchVariants } = useData();
  const { isAdmin } = useAuth();
  const [isAdded, setIsAdded] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedRAM, setSelectedRAM] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedImage, setSelectedImage] = useState("");

  // Load variants when product changes
  useEffect(() => {
    if (!product) return;
    setIsAdded(false);
    setSelectedImage(product.images?.[0] || "");

    const embedded = (product as any).variants || [];
    if (embedded.length > 0) {
      initVariants(embedded);
    } else {
      fetchVariants(product.id || (product as any)._id).then(initVariants);
    }
  }, [product?.id]);

  const initVariants = (vars: Variant[]) => {
    setVariants(vars);
    if (vars.length > 0) {
      const def = vars.find(v => v.stock > 0) || vars[0];
      setSelectedRAM(def.ram);
      setSelectedStorage(def.storage);
      setSelectedColor(def.color || "");
    }
  };

  // Resolve selected variant
  useEffect(() => {
    if (variants.length > 0 && selectedRAM && selectedStorage) {
      const v = variants.find(v => v.ram === selectedRAM && v.storage === selectedStorage && v.color === selectedColor);
      setSelectedVariant(v || null);
    }
  }, [selectedRAM, selectedStorage, selectedColor, variants]);

  const uniqueRAMs = useMemo(() => Array.from(new Set(variants.map(v => v.ram))), [variants]);
  const availableStorages = useMemo(() =>
    Array.from(new Set(variants.filter(v => v.ram === selectedRAM).map(v => v.storage))),
    [variants, selectedRAM]);
  const availableColors = useMemo(() =>
    Array.from(new Set(variants.filter(v => v.ram === selectedRAM && v.storage === selectedStorage).map(v => v.color))),
    [variants, selectedRAM, selectedStorage]);

  // Auto-cascade storage/color when RAM changes
  useEffect(() => {
    if (selectedRAM && variants.length > 0) {
      const forRAM = variants.filter(v => v.ram === selectedRAM);
      if (!forRAM.some(v => v.storage === selectedStorage)) {
        const first = forRAM.find(v => v.stock > 0) || forRAM[0];
        if (first) setSelectedStorage(first.storage);
      }
    }
  }, [selectedRAM, variants]);

  useEffect(() => {
    if (selectedRAM && selectedStorage && variants.length > 0) {
      const forOption = variants.filter(v => v.ram === selectedRAM && v.storage === selectedStorage);
      if (!forOption.some(v => v.color === selectedColor)) {
        const first = forOption.find(v => v.stock > 0) || forOption[0];
        if (first) setSelectedColor(first.color);
      }
    }
  }, [selectedRAM, selectedStorage, variants]);

  if (!product) return null;

  const currentPrice = selectedVariant?.price || 0;
  const currentMRP = selectedVariant?.originalPrice || 0;
  const discount = currentMRP > 0 ? Math.round(((currentMRP - currentPrice) / currentMRP) * 100) : 0;

  const handleAddToCart = () => {
    if (isAdmin) return toast.info("Admins cannot add products to cart");
    if (!selectedVariant) return toast.error("Please select a valid variant");
    if (selectedVariant.stock <= 0) return toast.error("This variant is out of stock");
    addToCart(product, {
      ram: selectedRAM,
      storage: selectedStorage,
      color: selectedColor,
      price: selectedVariant.price,
      originalPrice: selectedVariant.originalPrice,
    });
    toast.success(`${product.name} added to cart!`);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="quickview-title" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      {/* Backdrop */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        className="relative bg-background rounded-t-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          aria-label="Close quick view"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary transition-colors border border-border"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="p-6 md:p-8">
            <div className="aspect-square rounded-2xl bg-secondary/30 flex items-center justify-center overflow-hidden mb-3">
              {product.images?.[0] ? (
                <img
                  src={selectedImage || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 drop-shadow-xl"
                />
              ) : (
                <span className="text-7xl">{product.category === "phone" ? "📱" : product.category === "accessory" ? "🎧" : "💻"}</span>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? "border-primary" : "border-border/50 opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img} alt={`view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-6 md:p-8 md:pl-2 flex flex-col">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{product.brand}</p>
            <h2 id="quickview-title" className="text-lg md:text-xl font-black text-foreground leading-tight mb-2">{product.name}</h2>

            <div className="flex items-center gap-1.5 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-bold">({product.reviewCount})</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-2xl md:text-3xl font-black text-primary tracking-tighter">
                {currentPrice > 0 ? `₹${currentPrice.toLocaleString()}` : "Price Pending"}
              </span>
              {currentMRP > currentPrice && currentPrice > 0 && (
                <span className="text-sm text-muted-foreground line-through opacity-50">₹{currentMRP.toLocaleString()}</span>
              )}
              {discount > 0 && (
                <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">-{discount}%</span>
              )}
            </div>

            {/* Stock */}
            <p className="text-[10px] font-black uppercase tracking-widest mb-4">
              {selectedVariant && selectedVariant.stock > 0 ? (
                <span className="text-green-500">● In Stock</span>
              ) : (
                <span className="text-destructive">● Out of Stock</span>
              )}
            </p>

            {/* Variant Selectors */}
            {variants.length > 0 && (
              <div className="space-y-4 mb-6 bg-secondary/20 p-4 rounded-2xl border border-border/50">
                {/* RAM */}
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">RAM</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {uniqueRAMs.map(ram => (
                      <button
                        key={ram}
                        onClick={() => setSelectedRAM(ram)}
                        className={`px-3 py-1.5 rounded-full text-xs font-black transition-all border ${selectedRAM === ram
                          ? "border-primary text-primary bg-primary/5"
                          : "border-transparent bg-background text-foreground hover:border-primary/30"
                        }`}
                      >
                        {ram}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Storage</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {availableStorages.map(storage => {
                      const outOfStock = variants.filter(v => v.ram === selectedRAM && v.storage === storage).every(v => v.stock === 0);
                      return (
                        <button
                          key={storage}
                          disabled={outOfStock}
                          onClick={() => setSelectedStorage(storage)}
                          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all border ${selectedStorage === storage
                            ? "border-primary text-primary bg-primary/5"
                            : outOfStock
                              ? "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed line-through"
                              : "border-transparent bg-background text-foreground hover:border-primary/30"
                          }`}
                        >
                          {storage}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color */}
                {availableColors.length > 0 && availableColors[0] !== "" && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Color</label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {availableColors.map(color => {
                        const outOfStock = variants.find(v => v.ram === selectedRAM && v.storage === selectedStorage && v.color === color)?.stock === 0;
                        return (
                          <button
                            key={color}
                            disabled={outOfStock}
                            onClick={() => setSelectedColor(color)}
                            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all border ${selectedColor === color
                              ? "border-primary text-primary bg-primary/5"
                              : outOfStock
                                ? "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed line-through"
                                : "border-transparent bg-background text-foreground hover:border-primary/30"
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={isAdded || isAdmin}
                className={`w-full py-3 min-h-[44px] rounded-full font-black text-sm transition-all flex items-center justify-center gap-2 ${isAdded
                  ? "bg-green-500 text-white"
                  : isAdmin
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-[0.98]"
                }`}
              >
                {isAdded ? <><Check className="w-4 h-4" /> Added to Cart</> : isAdmin ? "ADMIN MODE" : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
              </button>

              <Link
                to={`/product/${product.id}`}
                onClick={onClose}
                className="w-full py-2.5 min-h-[44px] rounded-full font-bold text-sm border border-border text-foreground hover:bg-secondary/50 transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
