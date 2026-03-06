import { Link } from "react-router-dom";
import { Smartphone, Laptop, Tag, Truck, Shield, Award, Headphones, Star, ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import BrandLogo from "@/components/BrandLogo";
import PageMeta from "@/components/PageMeta";
import { OfferPopup } from "@/components/OfferPopup";
import { useData } from "@/context/DataContext";
import { toast } from "sonner";
import heroBanner from "@/assets/hero-banner.jpg";
import smartphoneBanner from "@/assets/banners/smartphone.jpg";
import laptopBanner from "@/assets/banners/laptop.jpg";
import accessoriesBanner from "@/assets/banners/accessories.jpg";

const categories = [
  { name: "Phones", icon: Smartphone, link: "/shop?category=phone" },
  { name: "Laptops", icon: Laptop, link: "/shop?category=laptop" },
  { name: "Offers", icon: Tag, link: "/offers" },
];

const features = [
  { icon: Truck, label: "Free Shipping" },
  { icon: Shield, label: "Best Quality" },
  { icon: Award, label: "Top Brands" },
  { icon: Headphones, label: "24/7 Support" },
];

const Index = () => {
  const { products, offers, brands } = useData();
  const featured = products.filter((p) => p.featured);
  const activeOffer = offers.find(o => o.active);

  return (
    <>
      <PageMeta title="Aaro Systems" description="Discover the latest in premium smartphones, laptops, and electronics at Aaro Systems. Best prices, free shipping, and 1-year warranty." />
      <OfferPopup />
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl mx-2 lg:mx-4 mt-4 shadow-soft">
        <img
          src={activeOffer?.image || heroBanner}
          alt={activeOffer?.title || "Summer Sale"}
          className="w-full h-[250px] sm:h-[300px] md:h-80 lg:h-[400px] object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center lg:justify-start p-4 sm:p-6 lg:p-12 bg-black/10 lg:bg-transparent">
          <div className="glass p-5 sm:p-6 lg:p-8 rounded-2xl w-full max-w-xs sm:max-w-sm lg:max-w-lg transform transition-all hover:scale-[1.02] duration-500">
            <h1 className="text-base sm:text-3xl md:text-5xl font-black text-foreground mb-2 text-glow leading-tight">
              {activeOffer?.title || "Summer Sale"}
            </h1>
            <p className="text-xs sm:text-lg md:text-3xl font-bold text-foreground/90 mb-6">
              {activeOffer ? <><span className="text-gradient-offer">{activeOffer.discount}% OFF</span> on All Products</> : "Best Deals on Gadgets"}
            </p>
            <Link to="/shop" className="group inline-flex items-center justify-between gap-4 bg-gradient-to-r from-primary to-accent text-white pl-6 pr-2 py-2 rounded-full font-black text-sm md:text-base hover:opacity-90 transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:scale-95 min-w-[160px]">
              <span>Shop Now</span>
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-sm border-l border-white/30 ml-2">
                <ArrowRight className="w-4 h-4 md:w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {features.map((f) => (
            <div key={f.label} className="group flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white border border-white/50 shadow-soft hover:shadow-xl hover:shadow-primary/5 transition-all cursor-default">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <f.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-bold text-[9px] sm:text-xs uppercase tracking-widest text-foreground">{f.label}</span>
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
      <section className="container mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-8 animate-slide-up stagger-1">
          <div>
            <h2 className="text-sm sm:text-xl md:text-3xl font-black animate-shimmer">Featured Products</h2>
            <div className="h-1 w-12 bg-primary mt-1 rounded-full" />
          </div>
          <Link to="/shop" className="text-sm text-primary font-bold hover:underline flex items-center gap-1 group">
            View all <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 mt-16 animate-slide-up stagger-2">
        <h2 className="text-sm sm:text-xl md:text-3xl font-black animate-shimmer mb-8">Shop by Category</h2>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {categories.map((c) => (
            <Link key={c.name} to={c.link} className="glass-card bg-white/60 backdrop-blur-lg border border-primary/10 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 rounded-2xl p-4 sm:p-8 text-center group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150" />
              <c.icon className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto text-primary mb-2 sm:mb-4 group-hover:scale-110 transition-transform relative z-10" />
              <span className="font-bold text-foreground text-xs sm:text-lg relative z-10">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* New Single Banner */}
      <section className="container mx-auto px-4 mt-16 lg:mt-24">
        <Link to="/offers" className="group relative h-48 md:h-[400px] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl flex items-center justify-center text-center">
          <img src={heroBanner} alt="Premium Gadgets Banner" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/60" />
          <div className="relative z-10 px-6">
            <span className="inline-block text-[10px] md:text-xs font-black uppercase tracking-[0.4em] bg-primary text-white px-4 py-2 rounded-full mb-4 shadow-lg animate-pulse">Exclusive Deals</span>
            <h2 className="text-2xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl tracking-tighter">PREMIUM TECH COLLECTION</h2>
            <p className="text-white/80 text-xs md:text-lg max-w-2xl mx-auto font-medium hidden sm:block">Upgrade your lifestyle with our curated selection of high-performance devices and luxury tech accessories.</p>
          </div>
        </Link>
      </section>

      {/* Brands Showcase */}
      <section className="container mx-auto px-4 mt-10 sm:mt-16 group">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-4 sm:mb-8 gap-2 sm:gap-4 border-b border-primary/10 pb-4 sm:pb-6">
          <div>
            <h2 className="text-sm sm:text-2xl md:text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 sm:mb-2">Global Brands</h2>
            <p className="text-muted-foreground text-[10px] sm:text-sm md:text-base">Explore our wide range of premium electronics from industry leaders.</p>
          </div>
        </div>

        <div>
          <div className="animate-fade-in">
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-primary mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" /> All Featured Brands
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {Array.from(new Set(brands.map(b => b.name))).sort().map((brandName, idx) => {
                const brandEntry = brands.find(b => b.name === brandName);
                return (
                  <Link
                    key={brandName}
                    to={`/shop?brand=${brandName}`}
                    className={`group/brand relative flex flex-col items-center justify-center p-6 rounded-[2rem] bg-[#F9F9FB] border border-primary/20 hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] click-scale animate-slide-up stagger-${(idx % 4) + 1}`}
                  >
                    {/* Soft Inner Glow on Hover */}
                    <div className="absolute inset-0 rounded-[2rem] bg-primary/5 opacity-0 group-hover/brand:opacity-100 transition-opacity duration-500" />

                    {/* Logo Container - White Square */}
                    <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 mb-4 flex items-center justify-center bg-white shadow-sm rounded-2xl group-hover/brand:scale-110 transition-transform duration-500 border border-primary/5">
                      <BrandLogo
                        src={brandEntry?.image}
                        name={brandName}
                        imgClassName="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain filter group-hover/brand:brightness-110"
                      />
                    </div>

                    {/* Brand Name - Muted Gradient Look */}
                    <span className="relative z-10 text-xs md:text-sm font-black tracking-tight text-center bg-gradient-to-r from-muted-foreground via-[#a1a1aa] to-muted-foreground bg-clip-text text-transparent group-hover/brand:from-primary group-hover/brand:via-purple-600 group-hover/brand:to-accent transition-all duration-300">
                      {brandName}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-4 mt-20 md:mt-32 mb-16 md:mb-24 animate-scale-in">
        <div className="glass-morphism rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-20 text-center relative overflow-hidden border border-primary/10 shadow-2xl">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mt-32 blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mb-32 blur-3xl opacity-50" />
          <div className="relative z-10">
            <Link to="/elite" className="group/elite inline-block">
              <h3 className="text-xl md:text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4 tracking-tighter group-hover/elite:scale-105 transition-transform">
                Join the AARO Elite
              </h3>
            </Link>
            <p className="text-sm md:text-xl text-muted-foreground mb-12 max-w-xl mx-auto font-medium">Get early access to sales and exclusive tech updates delivered to your inbox.</p>
            <div className="flex flex-col sm:flex-row max-w-xl mx-auto gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-[2] px-8 py-4 md:py-6 rounded-full border border-primary/10 bg-white/90 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-inner backdrop-blur-md transition-all font-medium"
              />
              <button
                onClick={() => toast.success("Welcome to the AARO Elite! Please check your email.")}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-white px-10 py-4 md:py-6 rounded-full font-black text-sm md:text-base hover:opacity-90 transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
