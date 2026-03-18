import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, MessageCircle, ArrowLeft, Check, Tag, Zap, Play, Clock } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { useCart } from "@/context/CartContext";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Review, Variant } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

// Helper to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url; // return as-is for direct video URLs
};

const SPEC_LABELS: Record<string, string> = {
  display: "Display",
  processor: "Processor",
  ram: "RAM",
  storage: "Storage",
  battery: "Battery",
  camera: "Camera",
  graphics: "Graphics",
};

const ProductDetails = () => {
  const { id } = useParams();
  const { products, fetchReviews, addReview, fetchVariants, contactSettings } = useData();
  const { user, isAdmin } = useAuth();
  const product = products.find((p) => p.id === id || p._id === id);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ comment: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Track recently viewed products in localStorage
  useEffect(() => {
    if (!product) return;
    const pid = product.id || (product as any)._id;
    const KEY = "aaro_recently_viewed";
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      const updated = [pid, ...stored.filter(id => id !== pid)].slice(0, 10);
      localStorage.setItem(KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [product?.id]);

  const recentlyViewed = useMemo(() => {
    if (!product) return [];
    const KEY = "aaro_recently_viewed";
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      const currentId = product.id || (product as any)._id;
      return stored
        .filter(id => id !== currentId)
        .map(id => products.find(p => p.id === id || p._id === id))
        .filter(Boolean)
        .slice(0, 4) as typeof products;
    } catch { return []; }
  }, [product?.id, products]);

  // Variant State
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedRAM, setSelectedRAM] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (product?.images?.length) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      const pid = product.id || (product as any)._id;
      fetchReviews(pid).then(setReviews);
      fetchVariants(pid).then(vars => {
        setVariants(vars);
        if (vars.length > 0) {
          // Default selection: first available variant
          const defaultVar = vars.find(v => v.stock > 0) || vars[0];
          setSelectedRAM(defaultVar.ram);
          setSelectedStorage(defaultVar.storage);
          setSelectedColor(defaultVar.color || "");
        }
      });
    }
  }, [product?.id]);

  useEffect(() => {
    if (variants.length > 0 && selectedRAM && selectedStorage && selectedColor) {
      const v = variants.find(v => v.ram === selectedRAM && v.storage === selectedStorage && v.color === selectedColor);
      setSelectedVariant(v || null);
    }
  }, [selectedRAM, selectedStorage, selectedColor, variants]);

  const uniqueRAMs = useMemo(() => Array.from(new Set(variants.map(v => v.ram))), [variants]);

  const availableStorages = useMemo(() => {
    return Array.from(new Set(variants.filter(v => v.ram === selectedRAM).map(v => v.storage)));
  }, [variants, selectedRAM]);

  const availableColors = useMemo(() => {
    return Array.from(new Set(variants.filter(v => v.ram === selectedRAM && v.storage === selectedStorage).map(v => v.color)));
  }, [variants, selectedRAM, selectedStorage]);

  // Handle RAM change: Auto-select first available storage for that RAM
  useEffect(() => {
    if (selectedRAM && variants.length > 0) {
      const storagesForRAM = variants.filter(v => v.ram === selectedRAM);
      const isCurrentStorageValid = storagesForRAM.some(v => v.storage === selectedStorage);

      if (!isCurrentStorageValid && storagesForRAM.length > 0) {
        const firstInStock = storagesForRAM.find(v => v.stock > 0) || storagesForRAM[0];
        setSelectedStorage(firstInStock.storage);
      }
    }
  }, [selectedRAM, variants]);

  useEffect(() => {
    if (selectedRAM && selectedStorage && variants.length > 0) {
      const colorsForOption = variants.filter(v => v.ram === selectedRAM && v.storage === selectedStorage);
      const isCurrentColorValid = colorsForOption.some(v => v.color === selectedColor);

      if (!isCurrentColorValid && colorsForOption.length > 0) {
        const firstInStock = colorsForOption.find(v => v.stock > 0) || colorsForOption[0];
        setSelectedColor(firstInStock.color);
      }
    }
  }, [selectedRAM, selectedStorage, variants]);

  if (!product) {
    return (
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-8 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/shop" className="text-primary hover:underline text-sm mt-2 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (isAdmin) return toast.info("Admins can't add items to cart!");
    if (!selectedVariant) return toast.error("Please select a valid variant");
    if (selectedVariant.stock <= 0) return toast.error("This variant is out of stock");

    // Pass variant info to cart
    addToCart(product, {
      ram: selectedRAM,
      storage: selectedStorage,
      color: selectedColor,
      price: selectedVariant.price,
      originalPrice: selectedVariant.originalPrice
    });
    toast.success(`${product.name} variant added!`);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const currentPrice = selectedVariant?.price || 0;
  const currentMRP = selectedVariant?.originalPrice || 0;
  const discount = currentMRP > 0 ? Math.round(((currentMRP - currentPrice) / currentMRP) * 100) : 0;
  const savings = currentMRP > currentPrice ? currentMRP - currentPrice : 0;

  const productUrl = `${window.location.origin}/product/${product?.id || (product as any)?._id}`;

  const buildWhatsAppMessage = () => {
    const specLines = Object.entries(product.specifications || {})
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `  • ${SPEC_LABELS[k] || k}: ${v}`)
      .join("\n");

    const imageUrl = product.images?.[0] || null;

    return [
      `🛒 *Order Enquiry — AARO*`,
      ``,
      `📦 *${product.name}*`,
      `🏷️ Brand: ${product.brand}  |  Category: ${product.category === "phone" ? "Smartphone" : product.category === "accessory" ? "Accessory" : "Laptop"}`,
      ``,
      `⚙️ *Selected Configuration:*`,
      `  • RAM: ${selectedRAM}`,
      `  • Storage: ${selectedStorage}`,
      `  • Color: ${selectedColor}`,
      ``,
      `💰 *Price: ₹${currentPrice.toLocaleString()}*`,
      currentMRP > currentPrice
        ? `💸 MRP: ₹${currentMRP.toLocaleString()} | You Save ₹${savings.toLocaleString()} (${discount}% OFF)`
        : null,
      selectedVariant?.sku ? `🔖 SKU: ${selectedVariant.sku}` : null,
      ``,
      specLines ? `📋 *Specifications:*\n${specLines}` : null,
      ``,
      `🖼️ Product Image: ${imageUrl || "—"}`,
      `🔗 Product Page: ${productUrl}`,
      ``,
      `Please confirm availability and delivery details. Thank you!`,
    ]
      .filter((line) => line !== null)
      .join("\n");
  };

  const handleWhatsAppOrder = () => {
    if (!selectedVariant) {
      toast.error("Please select RAM, Storage & Color before ordering");
      return;
    }
    if (selectedVariant.stock <= 0) {
      toast.error("This variant is out of stock. Please choose another option.");
      return;
    }
    const url = `https://wa.me/${contactSettings.whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const hasImages = product?.images && product.images.length > 0;
  const videoEmbed = getYouTubeEmbedUrl(product?.videoUrl || "");

  const specs = product.specifications || {};
  const specEntries = Object.entries(specs).filter(([, v]) => v && v.trim() !== "");

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to write a review");
    if (!reviewForm.comment.trim()) return toast.error("Please write a comment");
    setSubmitting(true);
    try {
      await addReview({ productId: product.id, comment: reviewForm.comment, rating: reviewForm.rating });
      const updated = await fetchReviews(product.id);
      setReviews(updated);
      setReviewForm({ comment: "", rating: 5 });
      toast.success("Review submitted!");
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 pb-24 lg:pb-6">
      <PageMeta
        title={product.name}
        description={`${product.brand} ${product.name} — ${product.description?.slice(0, 150)}`}
        ogImage={product.images?.[0]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          brand: { "@type": "Brand", name: product.brand },
          description: product.description,
          image: product.images?.[0],
          aggregateRating: product.reviewCount > 0 ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } : undefined,
          offers: variants.length > 0 ? {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: Math.min(...variants.map(v => v.price)),
            highPrice: Math.max(...variants.map(v => v.price)),
            offerCount: variants.length,
          } : undefined,
        }}
      />
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 items-start">
        {/* ── Image Gallery ── */}
        <div className="space-y-4 animate-fade-in md:sticky md:top-24">
          <div className="glass-card rounded-sm sm:rounded-[2.5rem] p-2 sm:p-4 md:p-8 lg:p-12 aspect-square flex items-center justify-center relative overflow-hidden group border border-white/50 shadow-2xl bg-white/40">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            {hasImages ? (
              <img src={selectedImage || product.images[0]} alt={product.name} loading="lazy"
                className="w-full h-full object-contain drop-shadow-3xl transition-all duration-700 group-hover:scale-105" />
            ) : (
              <div className="text-6xl sm:text-8xl md:text-[10rem] transition-transform duration-700 group-hover:scale-110">
                {product.category === "phone" ? "📱" : product.category === "accessory" ? "🎧" : "💻"}
              </div>
            )}
            {/* Condition badge — top-left */}
            <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-10">
              {(product.condition || "new") === "new" ? (
                <div className="bg-green-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-sm sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl">
                  New
                </div>
              ) : (
                <div className="bg-amber-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-sm sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl">
                  Refurbished
                </div>
              )}
            </div>
            {discount > 0 && (
              <div className="absolute top-3 right-3 sm:top-6 sm:right-6 gradient-offer text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-sm sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl">
                -{discount}%
              </div>
            )}
          </div>

          {hasImages && product.images.length > 1 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-3">
              {product.images.map((img, i) => (
                <button key={i} aria-label={`View image ${i + 1}`} onClick={() => setSelectedImage(img)}
                  className={`aspect-square rounded-sm sm:rounded-2xl overflow-hidden transition-all duration-300 border-2 ${selectedImage === img ? "border-primary shadow-lg scale-95" : "border-white/50 grayscale hover:grayscale-0 hover:border-primary/50"}`}>
                  <img src={img} alt={`view ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="animate-slide-up">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Tag className="w-3.5 h-3.5" />
              <span className="text-[11px] font-black uppercase tracking-wider">{product.brand} · {product.category === "phone" ? "Smartphone" : product.category === "accessory" ? "Accessory" : "Laptop"}</span>
            </div>
            {product.condition === "refurbished" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <span className="text-[11px] font-black uppercase tracking-wider">Refurbished</span>
              </div>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4 leading-tight tracking-tight drop-shadow-sm">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-0.5" aria-label={`Rating: ${product.rating} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} aria-hidden="true" className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} />
              ))}
            </div>
            <span className="text-sm font-bold text-muted-foreground">
              {product.rating} <span className="font-normal opacity-60">({product.reviewCount} reviews)</span>
            </span>
          </div>

          <div className="flex items-baseline gap-4 mb-2 animate-fade-in" key={currentPrice}>
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-primary tracking-tighter">₹{currentPrice.toLocaleString()}</span>
            {currentMRP > currentPrice && (
              <span className="text-base sm:text-xl text-muted-foreground line-through opacity-50">₹{currentMRP.toLocaleString()}</span>
            )}
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7a869a]">
              {selectedVariant && selectedVariant.stock > 0 ? (
                <span className="text-green-500">● In Stock ({selectedVariant.stock} available)</span>
              ) : (
                <span className="text-destructive">● Out of Stock</span>
              )}
              {selectedVariant?.sku && <span className="ml-3 text-[#a3acb9]">SKU: {selectedVariant.sku}</span>}
            </p>
          </div>

          {/* Amazon-style Variant Selection */}
          <div className="space-y-6 mb-8 bg-zinc-50/50 p-2 sm:p-4 md:p-6 rounded-sm sm:rounded-[2rem] border border-border">
            {/* RAM Options */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest ml-1">Select RAM</label>
              <div className="flex flex-wrap gap-2">
                {uniqueRAMs.map(ram => (
                  <button
                    key={ram}
                    onClick={() => setSelectedRAM(ram)}
                    className={`px-4 md:px-6 py-2.5 rounded-full text-xs font-black transition-all duration-300 border-2 ${selectedRAM === ram
                      ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/10 scale-105"
                      : "bg-white border-transparent text-foreground hover:border-primary/30"
                      }`}
                  >
                    {ram}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Options */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-[#7a869a] tracking-widest ml-1">Select Storage</label>
              <div className="flex flex-wrap gap-2">
                {availableStorages.map(storage => {
                  const isLowStock = variants.filter(v => v.ram === selectedRAM && v.storage === storage).every(v => v.stock === 0);
                  return (
                    <button
                      key={storage}
                      disabled={isLowStock}
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-4 md:px-6 py-2.5 rounded-full text-xs font-black transition-all duration-300 border-2 ${selectedStorage === storage
                        ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/10 scale-105"
                        : isLowStock
                          ? "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed line-through"
                          : "bg-white border-transparent text-foreground hover:border-primary/30"
                        }`}
                    >
                      {storage}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Options */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-[#7a869a] tracking-widest ml-1">Select Color</label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map(color => {
                  const isLowStock = variants.find(v => v.ram === selectedRAM && v.storage === selectedStorage && v.color === color)?.stock === 0;
                  return (
                    <button
                      key={color}
                      disabled={isLowStock}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 md:px-6 py-2.5 rounded-full text-xs font-black transition-all duration-300 border-2 ${selectedColor === color
                        ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/10 scale-105"
                        : isLowStock
                          ? "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed line-through"
                          : "bg-white border-transparent text-foreground hover:border-primary/30"
                        }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Condition label */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[11px] font-black uppercase text-muted-foreground tracking-widest">Condition:</span>
              <span className={`text-xs font-black uppercase tracking-wider ${(product.condition || "new") === "new" ? "text-green-600" : "text-amber-600"}`}>
                {(product.condition || "new") === "new" ? "Brand New" : "Refurbished"}
              </span>
            </div>
          </div>

          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8 max-w-xl">{product.description}</p>

          {/* Features Badges */}
          {product.features && product.features.length > 0 && (
            <div className="mb-8">
              <h3 className="font-black text-xs uppercase tracking-widest text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Key Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.features.map((feat, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm sm:rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    <Check className="w-3 h-3" /> {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Structured Specifications */}
          {specEntries.length > 0 && (
            <div className="mb-8 rounded-sm sm:rounded-3xl border border-border/50 overflow-hidden">
              <div className="bg-secondary/30 px-4 sm:px-6 py-3 border-b border-border/50">
                <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Specifications</h3>
              </div>
              <div className="divide-y divide-border/30">
                {specEntries.map(([key, val]) => (
                  <div key={key} className="grid grid-cols-[90px_1fr] sm:grid-cols-[110px_1fr] md:grid-cols-[140px_1fr] px-4 sm:px-6 py-3 hover:bg-secondary/20 transition-colors">
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-muted-foreground">
                      {SPEC_LABELS[key] || key}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-foreground break-words">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:gap-3 mb-8">
            <button onClick={handleAddToCart}
              className={`w-full py-4 min-h-[52px] rounded-full font-black transition-all duration-300 flex items-center justify-center gap-2.5 text-sm sm:text-base backdrop-blur-sm border ${isAdded ? "bg-green-500/10 border-green-500/30 text-green-600 shadow-soft" : isAdmin ? "bg-white/30 border-white/40 text-muted-foreground cursor-not-allowed" : "bg-white/50 border-white/50 text-foreground shadow-soft hover:shadow-card hover:-translate-y-1 active:scale-[0.98]"}`}
              disabled={isAdded || isAdmin}>
              {isAdded ? <><Check className="w-5 h-5" /> Added to Cart</> : isAdmin ? <><ShoppingCart className="w-5 h-5" /> Admin Mode</> : <><ShoppingCart className="w-5 h-5 text-primary" /> Add to Cart</>}
            </button>
            <button onClick={handleWhatsAppOrder}
              className="w-full py-4 min-h-[52px] rounded-full font-black transition-all duration-300 flex items-center justify-center gap-2.5 text-sm sm:text-base backdrop-blur-sm bg-white/50 border border-white/50 text-foreground shadow-soft hover:shadow-card hover:-translate-y-1 active:scale-[0.98]">
              <MessageCircle className="w-5 h-5 text-[#25D366]" /> Order on WhatsApp
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Free Shipping</div>
            <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> 1 Year Warranty</div>
            <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Secure Payment</div>
          </div>
        </div>
      </div>

      {/* ── Product Video ── */}
      {videoEmbed && (
        <div className="mt-16">
          <h2 className="text-xl md:text-2xl font-black text-foreground mb-6 flex items-center gap-3">
            <Play className="w-6 h-6 text-primary" /> Product Video
          </h2>
          <div className="rounded-sm sm:rounded-3xl overflow-hidden shadow-2xl border border-border/30 aspect-video">
            <iframe
              src={videoEmbed}
              title={`${product.name} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* ── Reviews Section ── */}
      <div className="mt-16">
        <h2 className="text-xl md:text-2xl font-black text-foreground mb-8 flex items-center gap-3">
          <Star className="w-6 h-6 text-accent fill-accent" /> Reviews & Ratings
          <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>
        </h2>

        <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No reviews yet.</div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="glass-card rounded-sm sm:rounded-3xl p-4 sm:p-6 border border-white/40">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-sm text-foreground">{review.name}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-accent text-accent" : "text-border"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.createdAt && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
        </div>
      </div>

      {/* Related Products */}
      {(() => {
        const related = products
          .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
          .slice(0, 4);
        if (related.length === 0) return null;
        return (
          <div className="mt-16">
            <h2 className="text-xl md:text-2xl font-black text-foreground mb-8 flex items-center gap-3">
              <Tag className="w-6 h-6 text-primary" /> You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3 md:gap-4 lg:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        );
      })()}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl md:text-2xl font-black text-foreground mb-8 flex items-center gap-3">
            <Clock className="w-6 h-6 text-primary" /> Recently Viewed
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3 md:gap-4 lg:gap-6">
            {recentlyViewed.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
