import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, MessageCircle, ArrowLeft, Check, Tag, Zap, Play } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Review, Variant } from "@/data/products";
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
  const { products, fetchReviews, addReview, fetchVariants } = useData();
  const { user, isAdmin } = useAuth();
  const product = products.find((p) => p.id === id || p._id === id);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ comment: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);

  // Variant State
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedRAM, setSelectedRAM] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

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
      <div className="container mx-auto px-4 py-12 text-center">
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

  const productUrl = `${window.location.origin}/product/${product.id || (product as any)._id}`;

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
      `🏷️ Brand: ${product.brand}  |  Category: ${product.category === "phone" ? "Smartphone" : "Laptop"}`,
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
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || "");
  const hasImages = product.images && product.images.length > 0;
  const videoEmbed = getYouTubeEmbedUrl(product.videoUrl || "");

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
    <div className="container mx-auto px-4 py-6 max-w-7xl pb-40 md:pb-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* ── Image Gallery ── */}
        <div className="space-y-4 animate-fade-in lg:sticky lg:top-24">
          <div className="glass-card rounded-[2.5rem] p-8 md:p-12 aspect-square flex items-center justify-center relative overflow-hidden group border border-white/50 shadow-2xl bg-white/40">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            {hasImages ? (
              <img src={selectedImage || product.images[0]} alt={product.name}
                className="w-full h-full object-contain drop-shadow-3xl transition-all duration-700 group-hover:scale-105" />
            ) : (
              <div className="text-[10rem] transition-transform duration-700 group-hover:scale-110">
                {product.category === "phone" ? "📱" : "💻"}
              </div>
            )}
            {discount > 0 && (
              <div className="absolute top-6 right-6 gradient-offer text-white px-4 py-2 rounded-2xl font-black text-sm shadow-xl">
                -{discount}%
              </div>
            )}
          </div>

          {hasImages && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(img)}
                  className={`aspect-square rounded-2xl overflow-hidden transition-all duration-300 border-2 ${selectedImage === img ? "border-primary shadow-lg scale-95" : "border-white/50 grayscale hover:grayscale-0 hover:border-primary/50"}`}>
                  <img src={img} alt={`view ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
            <Tag className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">{product.brand} · {product.category === "phone" ? "Smartphone" : "Laptop"}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4 leading-tight tracking-tight drop-shadow-sm">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} />
              ))}
            </div>
            <span className="text-sm font-bold text-muted-foreground">
              {product.rating} <span className="font-normal opacity-60">({product.reviewCount} reviews)</span>
            </span>
          </div>

          <div className="flex items-baseline gap-4 mb-2 animate-fade-in" key={currentPrice}>
            <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter">₹{currentPrice.toLocaleString()}</span>
            {currentMRP > currentPrice && (
              <span className="text-xl text-muted-foreground line-through opacity-50">₹{currentMRP.toLocaleString()}</span>
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
          <div className="space-y-6 mb-8 bg-zinc-50/50 p-6 rounded-[2rem] border border-border">
            {/* RAM Options */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Select RAM</label>
              <div className="flex flex-wrap gap-2">
                {uniqueRAMs.map(ram => (
                  <button
                    key={ram}
                    onClick={() => setSelectedRAM(ram)}
                    className={`px-6 py-2.5 rounded-full text-xs font-black transition-all duration-300 border-2 ${selectedRAM === ram
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
              <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1">Select Storage</label>
              <div className="flex flex-wrap gap-2">
                {availableStorages.map(storage => {
                  const isLowStock = variants.filter(v => v.ram === selectedRAM && v.storage === storage).every(v => v.stock === 0);
                  return (
                    <button
                      key={storage}
                      disabled={isLowStock}
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-6 py-2.5 rounded-full text-xs font-black transition-all duration-300 border-2 ${selectedStorage === storage
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
              <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1">Select Color</label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map(color => {
                  const isLowStock = variants.find(v => v.ram === selectedRAM && v.storage === selectedStorage && v.color === color)?.stock === 0;
                  return (
                    <button
                      key={color}
                      disabled={isLowStock}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-2.5 rounded-full text-xs font-black transition-all duration-300 border-2 ${selectedColor === color
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
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    <Check className="w-3 h-3" /> {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Structured Specifications */}
          {specEntries.length > 0 && (
            <div className="mb-8 rounded-3xl border border-border/50 overflow-hidden">
              <div className="bg-secondary/30 px-6 py-3 border-b border-border/50">
                <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Specifications</h3>
              </div>
              <div className="divide-y divide-border/30">
                {specEntries.map(([key, val]) => (
                  <div key={key} className="flex items-center px-6 py-3 hover:bg-secondary/20 transition-colors">
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground w-28 shrink-0">
                      {SPEC_LABELS[key] || key}
                    </span>
                    <span className="text-sm font-bold text-foreground">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons — fixed above MobileNav on mobile (bottom-16), normal flow on md+ */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 fixed md:relative bottom-16 md:bottom-auto left-0 right-0 p-4 md:p-0 bg-white/90 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-t border-primary/10 md:border-none z-40 shadow-[0_-10px_40px_-15px_rgba(76,29,149,0.15)] md:shadow-none">
            <button onClick={handleAddToCart}
              className={`flex-1 py-4 md:py-5 rounded-full font-black transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 text-sm md:text-lg shadow-xl shadow-primary/10 ${isAdded ? "bg-green-500 text-white shadow-green-500/20" : isAdmin ? "bg-gray-400 text-white cursor-not-allowed" : "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:scale-[0.98]"}`}
              disabled={isAdded || isAdmin}>
              {isAdded ? <><Check className="w-4 h-4 md:w-5 md:h-5" /> Added to Cart</> : isAdmin ? "ADMIN MODE" : <><ShoppingCart className="w-4 h-4 md:w-5 md:h-5" /> Add to Cart</>}
            </button>
            <button onClick={handleWhatsAppOrder}
              className="flex-1 bg-[#25D366] text-white py-4 md:py-5 rounded-full font-black transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 text-sm md:text-lg shadow-xl shadow-green-500/10 hover:opacity-90 hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-1 active:scale-[0.98]">
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" /> Order on WhatsApp
            </button>
          </div>

          <div className="flex items-center gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
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
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-border/30 aspect-video">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Form */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-6 border border-white/40">
              <h3 className="font-black text-sm uppercase tracking-widest mb-4">Write a Review</h3>
              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Rating</label>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: star }))}>
                          <Star className={`w-6 h-6 transition-colors ${star <= reviewForm.rating ? "fill-accent text-accent" : "text-border hover:text-accent"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Comment</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      rows={4}
                      className="w-full mt-2 px-4 py-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Share your experience..."
                    />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full gradient-purple text-primary-foreground py-3 rounded-2xl font-black text-sm hover:opacity-90 transition-all disabled:opacity-50">
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">Login to write a review</p>
                  <Link to="/login" className="gradient-purple text-primary-foreground px-6 py-3 rounded-2xl font-black text-sm">Login</Link>
                </div>
              )}
            </div>
          </div>

          {/* Review List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No reviews yet. Be the first!</div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="glass-card rounded-3xl p-6 border border-white/40">
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
      </div>
    </div>
  );
};

export default ProductDetails;
