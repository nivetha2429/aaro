import { Link } from "react-router-dom";
import { Smartphone, Laptop, Tag, Truck, Shield, Award, Headphones, Star, ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";

import { OfferPopup } from "@/components/OfferPopup";
import { useData } from "@/context/DataContext";
import heroBanner from "@/assets/hero-banner.jpg";

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
      <OfferPopup />
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl mx-2 md:mx-4 mt-4 shadow-soft">
        <img
          src={activeOffer?.image || heroBanner}
          alt={activeOffer?.title || "Summer Sale"}
          className="w-full h-[250px] sm:h-[300px] md:h-80 lg:h-[400px] object-cover"
        />
        <div className="absolute inset-0 flex items-center p-6 md:p-12 bg-black/10 md:bg-transparent">
          <div className="glass p-6 md:p-8 rounded-2xl max-w-lg transform transition-all hover:scale-[1.02] duration-500">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground mb-2 text-glow leading-tight">
              {activeOffer?.title || "Summer Sale"}
            </h1>
            <p className="text-base sm:text-lg md:text-3xl font-bold text-foreground/90 mb-6">
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

      {/* Features - Scrollable on mobile */}
      <section className="container mx-auto px-4 mt-12 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex md:grid md:grid-cols-4 gap-4 min-w-max md:min-w-0 pb-4 md:pb-0">
          {features.map((f) => (
            <div key={f.label} className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-white/50 shadow-soft hover:shadow-xl hover:shadow-primary/5 transition-all cursor-default min-w-[240px] md:min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs uppercase tracking-widest text-foreground">{f.label}</span>
              </div>
              <div className="h-8 w-px bg-border/50 mx-2" />
              <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:bg-primary/10 transition-all">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Featured Products</h2>
            <div className="h-1 w-12 bg-primary mt-1 rounded-full" />
          </div>
          <Link to="/shop" className="text-sm text-primary font-bold hover:underline flex items-center gap-1 group">
            View all <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 mt-16">
        <h2 className="text-xl md:text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map((c) => (
            <Link key={c.name} to={c.link} className="glass-card bg-white/60 backdrop-blur-lg border border-primary/10 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 rounded-2xl p-8 text-center group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150" />
              <c.icon className="w-10 h-10 md:w-12 md:h-12 mx-auto text-primary mb-4 group-hover:scale-110 transition-transform relative z-10" />
              <span className="font-bold text-foreground text-lg relative z-10">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Brands Showcase */}
      <section className="container mx-auto px-4 mt-20 group">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-primary/10 pb-6">
          <div>
            <h2 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">Global Brands</h2>
            <p className="text-muted-foreground text-sm md:text-base">Explore our wide range of premium electronics from industry leaders.</p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Unified Brands Grid */}
          <div className="animate-fade-in">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-3">
              <Smartphone className="w-4 h-4" /> All Featured Brands
            </h3>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
              {Array.from(new Set(brands.map(b => b.name))).sort().map((brandName) => (
                <Link
                  key={brandName}
                  to={`/shop?brand=${brandName}`}
                  className="glass-card bg-white/60 backdrop-blur-md px-3 py-5 text-center rounded-2xl hover:bg-white hover:shadow-xl hover:-translate-y-1 hover:shadow-primary/10 transition-all duration-300 group/brand border border-primary/5"
                >
                  <span className="text-xs font-black text-foreground group-hover/brand:text-primary transition-colors">{brandName}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-4 mt-20 mb-12">
        <div className="glass-card bg-white/60 backdrop-blur-lg rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden border border-primary/10 shadow-xl">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full -ml-16 -mt-16 blur-3xl" />
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">Join the AARO Elite</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-md mx-auto">Get early access to sales and exclusive tech updates delivered to your inbox.</p>
            <div className="flex flex-col sm:flex-row max-w-lg mx-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-8 py-4 rounded-full border border-primary/20 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm backdrop-blur-md"
              />
              <button className="bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-full font-black text-sm hover:opacity-90 transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
