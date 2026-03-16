import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Smartphone, Laptop, Tag, Truck, Shield, Award, Headphones, ArrowRight, ChevronLeft, ChevronRight, MessageCircle, Instagram } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import BrandLogo from "@/components/BrandLogo";
import PageMeta from "@/components/PageMeta";
import { useData } from "@/context/DataContext";
import heroBanner from "@/assets/hero-banner.jpg";
import smartphoneBanner from "@/assets/banners/smartphone.jpg";
import laptopBanner from "@/assets/banners/laptop.jpg";
import accessoriesBanner from "@/assets/banners/accessories.jpg";

const categories = [
  { name: "Laptops", icon: Laptop, link: "/laptops" },
  { name: "Phones", icon: Smartphone, link: "/phones" },
  { name: "Accessory", icon: Headphones, link: "/accessories" },
];

const features = [
  { icon: Truck, label: "Free Shipping" },
  { icon: Shield, label: "Best Quality" },
  { icon: Award, label: "Top Brands" },
  { icon: Headphones, label: "24/7 Support" },
];

// Map /src/assets paths stored in DB to Vite-imported assets
const assetMap: Record<string, string> = {
  "/src/assets/hero-banner.jpg": heroBanner,
  "/src/assets/banners/smartphone.jpg": smartphoneBanner,
  "/src/assets/banners/laptop.jpg": laptopBanner,
  "/src/assets/banners/accessories.jpg": accessoriesBanner,
};

const resolveBannerImage = (img: string): string => {
  if (!img) return "";
  if (img.startsWith("http") || img.startsWith("/uploads")) return img;
  return assetMap[img] || "";
};

const defaultHeroBanners = [
  { image: smartphoneBanner, title: "Latest Smartphones", subtitle: "Premium phones at best prices", link: "/shop?category=phone" },
  { image: laptopBanner, title: "Powerful Laptops", subtitle: "Performance meets portability", link: "/shop?category=laptop" },
  { image: accessoriesBanner, title: "Top Deals", subtitle: "Exclusive offers on trending tech", link: "/shop" },
];

const Index = () => {
  const { products, brands, banners, contactSettings } = useData();
  const featured = products.filter((p) => p.featured);

  // Resolve DB banner images (map /src/assets paths to Vite imports, pass through valid URLs)
  const dbHeroBanners = banners
    .filter(b => b.position === 'hero' && b.active)
    .map(b => ({ ...b, image: resolveBannerImage(b.image) }))
    .filter(b => b.image);
  const centerBannerRaw = banners.find(b => b.position === 'center' && b.active);
  const centerBanner = centerBannerRaw ? { ...centerBannerRaw, image: resolveBannerImage(centerBannerRaw.image) || heroBanner } : null;

  // Use DB banners if available with resolved images, else fallback to defaults
  const heroBanners = dbHeroBanners.length > 0
    ? dbHeroBanners.map(b => ({ image: b.image, title: b.title, subtitle: b.subtitle, link: b.link }))
    : defaultHeroBanners;

  // ── Auto-sliding carousel state ──
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % heroBanners.length);
  }, [heroBanners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + heroBanners.length) % heroBanners.length);
  }, [heroBanners.length]);

  useEffect(() => {
    if (isPaused || heroBanners.length <= 1) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, heroBanners.length]);

  // Reset slide index if banners change
  useEffect(() => {
    setCurrentSlide(0);
  }, [heroBanners.length]);

  const slide = heroBanners[currentSlide] || heroBanners[0];

  return (
    <>
      <PageMeta title="Aaro Systems" description="Discover the latest in premium smartphones, laptops, and electronics at Aaro Systems. Best prices, free shipping, and 1-year warranty." />

      {/* Hero Banner Carousel */}
      <section
        className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 mt-2 sm:mt-4"
      >
      <div
        className="relative overflow-hidden rounded-sm sm:rounded-2xl shadow-soft group/hero"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides */}
        <div className="relative w-full h-[200px] sm:h-[260px] md:h-[320px] lg:h-[400px] xl:h-[460px] 2xl:h-[520px]">
          {heroBanners.map((banner, idx) => (
            <img
              key={idx}
              src={banner.image}
              alt={banner.title || `Banner ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${idx === currentSlide ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>

        {/* Shop Now button - bottom right corner, glassy */}
        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4">
          <Link to={slide.link || "/shop"} className="group inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-md sm:rounded-lg font-bold text-[10px] sm:text-sm hover:bg-white/40 transition-all duration-300 shadow-lg active:scale-95">
            <span>Shop Now</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Navigation arrows */}
        {heroBanners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity shadow-lg hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity shadow-lg hover:bg-white"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {heroBanners.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`rounded-full transition-all duration-300 ${idx === currentSlide ? "w-6 sm:w-8 h-2 sm:h-2.5 bg-white" : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/50 hover:bg-white/70"}`}
              />
            ))}
          </div>
        )}
      </div>
      </section>

      {/* Features */}
      <section className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 mt-6 sm:mt-8 md:mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-3 md:gap-4 lg:gap-6">
          {features.map((f) => (
            <div key={f.label} className="group flex items-center justify-between p-3 sm:p-4 rounded-sm sm:rounded-2xl bg-white border border-white/50 shadow-soft hover:shadow-xl hover:shadow-primary/5 transition-all cursor-default">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <f.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-bold text-[10px] sm:text-xs uppercase tracking-widest text-foreground">{f.label}</span>
              </div>
              <div className="h-6 sm:h-8 w-px bg-border/50 mx-1 sm:mx-2" />
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-secondary/50 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:bg-primary/10 transition-all">
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 mt-6 sm:mt-8 md:mt-12 lg:mt-16">
        <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 animate-slide-up stagger-1">
          <div>
            <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black animate-shimmer">Featured Products</h2>
            <div className="h-1 w-12 bg-primary mt-1 rounded-full" />
          </div>
          <Link to="/shop" className="text-sm text-primary font-bold hover:underline flex items-center gap-1 group">
            View all <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-1.5 sm:gap-3 md:gap-4 lg:gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 mt-8 sm:mt-12 md:mt-16 animate-slide-up stagger-2">
        <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black animate-shimmer mb-4 sm:mb-6 md:mb-8">Shop by Category</h2>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 lg:gap-6">
          {categories.map((c) => (
            <Link key={c.name} to={c.link} className="glass-card bg-white/60 backdrop-blur-lg border border-primary/10 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 rounded-sm sm:rounded-2xl p-4 sm:p-8 text-center group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150" />
              <c.icon className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto text-primary mb-2 sm:mb-4 group-hover:scale-110 transition-transform relative z-10" />
              <span className="font-bold text-foreground text-xs sm:text-lg relative z-10">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Center Banner (editable from admin) */}
      <section className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 mt-8 sm:mt-12 md:mt-16 lg:mt-24">
        <Link to={centerBanner?.link || "/shop"} className="group relative h-[200px] sm:h-[260px] md:h-[320px] lg:h-[400px] xl:h-[460px] 2xl:h-[520px] rounded-sm sm:rounded-[3rem] overflow-hidden shadow-2xl flex items-center justify-center text-center">
          <img src={centerBanner?.image || heroBanner} alt={centerBanner?.title || "Premium Gadgets Banner"} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/60" />
          <div className="relative z-10 px-6">
            <span className="inline-block text-[10px] md:text-xs font-black uppercase tracking-[0.4em] bg-primary text-white px-4 py-2 rounded-full mb-4 shadow-lg animate-pulse">Exclusive Deals</span>
            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl font-black text-white mb-4 drop-shadow-2xl tracking-tighter">{centerBanner?.title || "PREMIUM TECH COLLECTION"}</h2>
            <p className="text-white/80 text-xs md:text-base lg:text-lg max-w-2xl mx-auto font-medium hidden sm:block">{centerBanner?.subtitle || "Upgrade your lifestyle with our curated selection of high-performance devices and luxury tech accessories."}</p>
          </div>
        </Link>
      </section>

      {/* Brands Showcase */}
      <section className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 mt-8 sm:mt-12 md:mt-16 group">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 sm:mb-8 gap-2 sm:gap-4 border-b border-primary/10 pb-4 sm:pb-6">
          <div>
            <h2 className="text-base sm:text-xl md:text-2xl lg:text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 sm:mb-2">Global Brands</h2>
            <p className="text-muted-foreground text-[11px] sm:text-xs md:text-sm lg:text-base">Explore our wide range of premium electronics from industry leaders.</p>
          </div>
        </div>

        <div>
          <div className="animate-fade-in">
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-primary mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" /> All Featured Brands
            </h3>
            {(() => {
              const allBrands = Array.from(new Set(brands.map(b => b.name))).sort();
              const mobileBrands = allBrands.slice(0, 20);
              return (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-1.5 sm:gap-2">
                    {allBrands.map((brandName, idx) => {
                      const brandEntry = brands.find(b => b.name === brandName);
                      const isHiddenOnMobile = !mobileBrands.includes(brandName);
                      return (
                        <Link
                          key={brandName}
                          to={`/shop?brand=${brandName}`}
                          className={`${isHiddenOnMobile ? "hidden sm:flex" : "flex"} group/brand relative flex-col items-center justify-center p-1.5 sm:p-2 rounded-sm sm:rounded-[2rem] bg-[#F9F9FB] border border-primary/20 hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] click-scale animate-slide-up stagger-${(idx % 4) + 1}`}
                        >
                          <div className="absolute inset-0 rounded-sm sm:rounded-[2rem] bg-primary/5 opacity-0 group-hover/brand:opacity-100 transition-opacity duration-500" />
                          <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 mb-1 sm:mb-2 flex items-center justify-center bg-white shadow-sm rounded-sm sm:rounded-2xl group-hover/brand:scale-110 transition-transform duration-500 border border-primary/5">
                            <BrandLogo
                              src={brandEntry?.image}
                              name={brandName}
                              imgClassName="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 object-contain filter group-hover/brand:brightness-110"
                            />
                          </div>
                          <span className="relative z-10 text-[8px] sm:text-[10px] md:text-xs font-black tracking-tight text-center bg-gradient-to-r from-muted-foreground via-[#a1a1aa] to-muted-foreground bg-clip-text text-transparent group-hover/brand:from-primary group-hover/brand:via-purple-600 group-hover/brand:to-accent transition-all duration-300 truncate w-full">
                            {brandName}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  {allBrands.length > 20 && (
                    <div className="sm:hidden mt-3 text-center">
                      <Link to="/brands" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary hover:underline">
                        View All Brands <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Join Our Community */}
      <section className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 mt-8 sm:mt-12 md:mt-16 lg:mt-24 mb-10 sm:mb-16 md:mb-24 animate-scale-in">
        <div className="glass-morphism rounded-sm sm:rounded-[2.5rem] md:rounded-[4rem] p-4 sm:p-6 md:p-10 lg:p-16 xl:p-20 text-center relative overflow-hidden border border-white/40 shadow-2xl">
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full -ml-36 -mt-36 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/10 rounded-full -mr-36 -mb-36 blur-3xl" />

          <div className="relative z-10">
            {/* Badge */}
            <div className="text-left mb-4 sm:mb-5 md:mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Stay Connected</span>
              </div>
            </div>

            <Link to="/community" className="group/elite inline-block">
              <h3 className="text-lg sm:text-xl md:text-3xl lg:text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4 tracking-tighter group-hover/elite:scale-105 transition-transform">
                Join Our Community
              </h3>
            </Link>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground mb-8 sm:mb-10 md:mb-14 max-w-xl mx-auto font-medium">Get exclusive deals, flash sales & new arrival updates directly on WhatsApp & Instagram.</p>
            <div className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4 sm:gap-5">
              <a
                href={contactSettings.whatsappGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-1 inline-flex items-center justify-center gap-2.5 bg-white/50 backdrop-blur-sm text-foreground border border-white/50 px-6 py-4 md:py-5 min-h-[52px] rounded-full font-black text-sm md:text-base shadow-soft hover:bg-[#25D366]/10 hover:border-[#25D366]/30 hover:text-[#25D366] hover:shadow-card hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366] transition-colors duration-300" />
                WhatsApp Group
              </a>
              <a
                href={contactSettings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-1 inline-flex items-center justify-center gap-2.5 bg-white/50 backdrop-blur-sm text-foreground border border-white/50 px-6 py-4 md:py-5 min-h-[52px] rounded-full font-black text-sm md:text-base shadow-soft hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-600 hover:shadow-card hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]"
              >
                <Instagram className="w-5 h-5 text-pink-500 transition-colors duration-300" />
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
