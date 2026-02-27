import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, Search, User, LogOut, LayoutDashboard, Package, ChevronRight, Smartphone, Laptop, Headphones } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen, isSearchOpen]);

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img
            src={logo}
            alt="AARO Systems Logo"
            className="h-14 md:h-20 w-auto object-contain transition-transform group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/200x60/7c3aed/ffffff?text=AARO+SYSTEMS";
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 ml-8">
          <Link to="/shop" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Shop</Link>
          <Link to="/phones" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Phones</Link>
          <Link to="/laptops" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Laptops</Link>
          <Link to="/offers" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Offers</Link>
        </nav>

        <div className="flex-1 max-w-md hidden lg:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full bg-secondary text-sm border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="lg:hidden p-2 text-muted-foreground hover:text-primary" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="w-5 h-5" />
          </button>

          <Link to="/cart" className="p-2 text-muted-foreground hover:text-primary relative group">
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {totalItems}
              </span>
            )}
          </Link>

          <div className="h-6 w-px bg-border mx-1" />

          {!isAuthenticated ? (
            <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:bg-secondary transition-all">
              <User className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Login</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 rounded-full hover:bg-secondary transition-all">
                  <div className="w-8 h-8 rounded-full gradient-purple flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform scale-95 group-hover:scale-100 z-[60]">
                  <div className="px-4 py-2 border-b border-border mb-1">
                    <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                  </div>

                  {isAdmin && (
                    <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-secondary">
                      <LayoutDashboard className="w-4 h-4 text-primary" /> Admin Panel
                    </Link>
                  )}

                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-secondary">
                    <User className="w-4 h-4 text-primary" /> My Profile
                  </Link>

                  <Link to="/my-orders" className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-secondary">
                    <Package className="w-4 h-4 text-primary" /> My Orders
                  </Link>

                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          <button className="md:hidden p-2 text-muted-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay & Sidebar */}
      <div
        className={`fixed inset-0 z-[100] transition-all duration-500 lg:hidden ${isMenuOpen ? "visible" : "invisible pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-background/40 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col shadow-2xl ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center text-white">
                <Menu className="w-5 h-5" />
              </div>
              <p className="font-black text-xs tracking-widest text-foreground">MENU</p>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 mb-4">Shop by Category</p>
              {[
                { label: "Smartphones", path: "/phones", icon: Smartphone },
                { label: "Laptops & PCs", path: "/laptops", icon: Laptop },
                { label: "Accessories", path: "/shop?category=accessories", icon: Headphones },
                { label: "Special Offers", path: "/offers", icon: Search }
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-all group border border-primary/5 hover:border-primary/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <link.icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-black">{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-30 group-hover:opacity-100 transition-all" />
                </Link>
              ))}
            </div>

            <div className="h-px bg-border/50 mx-2" />

            <div className="space-y-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 mb-4">Account Services</p>
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="p-4 bg-secondary/50 rounded-2xl mb-4 flex items-center gap-3 border border-border">
                    <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center text-white font-black">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-xs text-foreground truncate">{user?.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{user?.role}</p>
                    </div>
                  </div>
                  <Link to={isAdmin ? "/admin/dashboard" : "/profile"} className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-all border border-primary/5 hover:border-primary/20" onClick={() => setIsMenuOpen(false)}>
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary transition-colors">
                      {isAdmin ? <LayoutDashboard className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <span className="font-bold text-sm text-black">{isAdmin ? "Admin Portal" : "My Profile Settings"}</span>
                  </Link>
                  <Link to="/my-orders" className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-all border border-primary/5 hover:border-primary/20" onClick={() => setIsMenuOpen(false)}>
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary transition-colors">
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-black">Order Tracking</span>
                  </Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 p-4 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    Log Out
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-primary text-white hover:opacity-90 transition-all shadow-xl shadow-primary/20 mt-4" onClick={() => setIsMenuOpen(false)}>
                  <User className="w-5 h-5" />
                  <span className="font-black text-sm uppercase tracking-widest">Sign In</span>
                </Link>
              )}
            </div>
          </nav>

          <div className="p-6 bg-secondary/30 text-center border-t border-border/50">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">AARO PREMIUM TECH</p>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <div
        className={`fixed inset-0 z-[110] bg-white/95 backdrop-blur-md transition-all duration-300 lg:hidden ${isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black tracking-tight">Search Catalog</h3>
            <button onClick={() => setIsSearchOpen(false)} className="p-2 rounded-full hover:bg-secondary">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              autoFocus
              type="text"
              placeholder="What are you looking for?"
              className="w-full h-16 bg-secondary rounded-2xl pl-12 pr-4 font-bold placeholder:font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="mt-8 flex-1 overflow-y-auto">
            <p className="text-[10px] uppercase font-black tracking-widest text-[#7a869a] mb-4">Trending Searches</p>
            <div className="flex flex-wrap gap-2">
              {["iPhone 16", "MacBook Air", "Galaxy S24", "Gaming Laptop", "AirPods"].map(tag => (
                <button key={tag} className="px-4 py-2 rounded-full border border-border text-sm font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
