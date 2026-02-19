import { Link } from "react-router-dom";
import { Smartphone, Laptop, Tag, Truck, Shield, Award, Headphones, Star } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ReviewSection from "@/components/ReviewSection";
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
  const { products } = useData();
  const featured = products.filter((p) => p.featured);

  return (
    <>
      <OfferPopup />
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl mx-4 mt-4 shadow-soft">
        <img src={heroBanner} alt="Summer Sale" className="w-full h-[300px] md:h-80 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/40 to-transparent flex items-center">
          <div className="px-6 md:px-12 w-full">
            <h1 className="text-2xl md:text-5xl font-extrabold text-card mb-2">Summer Sale</h1>
            <p className="text-lg md:text-3xl font-bold text-card/90 mb-4">50% OFF on All Products</p>
            <Link to="/shop" className="inline-block gradient-peach text-primary-foreground px-5 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-base hover:opacity-90 transition-opacity shadow-soft">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 mt-8">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <f.icon className="w-4 h-4 text-primary" />
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Featured Products</h2>
          <Link to="/shop" className="text-sm text-primary font-medium hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 mt-10">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {categories.map((c) => (
            <Link key={c.name} to={c.link} className="bg-card rounded-lg p-6 shadow-card hover:shadow-soft transition-all text-center group">
              <c.icon className="w-8 h-8 md:w-10 md:h-10 mx-auto text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-foreground text-sm">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="container mx-auto px-4 mt-10">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Customer Reviews</h2>
        <ReviewSection />
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-4 mt-10 mb-8">
        <div className="bg-card rounded-lg p-6 shadow-card text-center">
          <h3 className="text-lg font-bold text-foreground mb-2">Stay Updated</h3>
          <p className="text-sm text-muted-foreground mb-4">Subscribe for the latest deals and offers.</p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-2">
            <input type="email" placeholder="Your email address" className="flex-1 px-4 py-2 rounded-lg border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button className="gradient-peach text-primary-foreground px-6 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity whitespace-nowrap">Subscribe</button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
