import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const Navbar = () => {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md shadow-card transition-all duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0 mr-2">
            <div className="w-8 h-8 rounded-lg gradient-peach flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-foreground">TechZone</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search Products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/shop" className="text-foreground hover:text-primary transition-colors">Shop</Link>
            <Link to="/phones" className="text-foreground hover:text-primary transition-colors">Phones</Link>
            <Link to="/laptops" className="text-foreground hover:text-primary transition-colors">Laptops</Link>
            <Link to="/offers" className="text-foreground hover:text-primary transition-colors">Offers</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-peach text-primary-foreground text-xs flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link to="/admin" className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <User className="w-5 h-5 text-foreground" />
            </Link>
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden flex flex-col gap-3 pt-4 pb-2 text-sm font-medium animate-fade-in">
            <div className="relative">
              <input type="text" placeholder="Search..." className="w-full pl-4 pr-10 py-2 rounded-lg border border-border bg-secondary text-sm" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <Link to="/" onClick={() => setMobileOpen(false)} className="py-2 text-foreground">Home</Link>
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="py-2 text-foreground">Shop</Link>
            <Link to="/phones" onClick={() => setMobileOpen(false)} className="py-2 text-foreground">Phones</Link>
            <Link to="/laptops" onClick={() => setMobileOpen(false)} className="py-2 text-foreground">Laptops</Link>
            <Link to="/offers" onClick={() => setMobileOpen(false)} className="py-2 text-foreground">Offers</Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
