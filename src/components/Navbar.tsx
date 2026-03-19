import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, Search, User, LogOut, LayoutDashboard, Package, ChevronRight, Smartphone, Laptop, Home, Tag, Headphones, Phone, Users, Store } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const { totalItems } = useCart();
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth();
  const { products, contactSettings } = useData();

  const navigate = useNavigate();
  const location = useLocation();
  const isInsideAdmin = location.pathname.startsWith("/admin") || location.pathname.startsWith("/superadmin");

  // Debounce search to prevent filtering on every keystroke
  const debouncedSearch = useDebounce(searchQuery, 250);

  // Compute live search results
  const searchResults = useMemo(() => products.filter(p =>
    debouncedSearch.length > 1 && p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  ).slice(0, 6), [debouncedSearch, products]);

  // Reset active index when results change
  useEffect(() => { setActiveIndex(-1); }, [searchQuery]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && searchResults[activeIndex]) {
        navigate(`/product/${searchResults[activeIndex].id}`);
        setSearchQuery("");
        setIsSearchOpen(false);
      } else if (searchQuery.trim()) {
        setIsSearchOpen(false);
        navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
      }
    } else if (e.key === "Escape") {
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>{text.slice(0, idx)}<span className="text-primary font-black">{text.slice(idx, idx + query.length)}</span>{text.slice(idx + query.length)}</>
    );
  };

  const getLowestPrice = (product: any) => {
    const variants = product.variants || [];
    if (variants.length === 0) return 0;
    const prices = variants.map((v: any) => v.price).filter((p: number) => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen, isSearchOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-lg border-b border-primary/10 shadow-sm transition-all duration-500" style={{ minHeight: 'clamp(48px, 3rem + 1vw, 64px)' }}>
      <div className="w-full section-px py-0 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          {contactSettings.logoUrl ? (
            <img src={contactSettings.logoUrl} alt="AARO Systems" className="block object-contain transition-transform group-hover:scale-105 -my-6" style={{ height: 'clamp(96px, 14vw, 130px)', maxWidth: 'clamp(320px, 40vw, 450px)' }} />
          ) : (
            <span className="text-lg sm:text-xl font-black tracking-tight text-foreground transition-transform group-hover:scale-105">
              AARO<span className="text-primary italic">Systems</span>
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-3 lg:gap-4 xl:gap-6 ml-4 lg:ml-6 xl:ml-8">
          <Link to="/" className="text-xs lg:text-sm font-bold text-muted-foreground hover:text-primary transition-all whitespace-nowrap">Home</Link>
          <Link to="/laptops" className="text-xs lg:text-sm font-bold text-muted-foreground hover:text-primary transition-all whitespace-nowrap">Laptops</Link>
          <Link to="/phones" className="text-xs lg:text-sm font-bold text-muted-foreground hover:text-primary transition-all whitespace-nowrap">Phones</Link>
          <Link to="/accessories" className="text-xs lg:text-sm font-bold text-muted-foreground hover:text-primary transition-all whitespace-nowrap">Accessory</Link>
          <Link to="/brands" className="text-xs lg:text-sm font-bold text-muted-foreground hover:text-primary transition-all whitespace-nowrap">Brands</Link>
          <Link to="/community" className="text-xs lg:text-sm font-bold text-muted-foreground hover:text-primary transition-all whitespace-nowrap">Community</Link>
          <Link to="/contact" className="text-xs lg:text-sm font-bold text-muted-foreground hover:text-primary transition-all whitespace-nowrap">Contact</Link>
        </nav>

        <div className="flex-1 max-w-xs lg:max-w-sm xl:max-w-lg 2xl:max-w-xl hidden lg:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <input
            type="text"
            role="combobox"
            aria-label="Search products"
            aria-expanded={searchQuery.length > 1 && searchResults.length > 0}
            aria-controls="search-listbox"
            aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search products..."
            className="w-full bg-white/80 backdrop-blur-md text-sm border hover:border-primary/20 border-transparent rounded-full py-2 md:py-2.5 pl-10 pr-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium shadow-sm z-10 relative"
          />

          {/* Desktop Search Dropdown */}
          {searchQuery.length > 1 && searchResults.length > 0 && (
            <div id="search-listbox" role="listbox" className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="max-h-[50vh] overflow-y-auto w-full">
                {searchResults.map((p, i) => (
                  <Link
                    key={p.id}
                    id={`search-result-${i}`}
                    role="option"
                    aria-selected={activeIndex === i}
                    to={`/product/${p.id}`}
                    onClick={() => { setSearchQuery(""); setIsSearchOpen(false); }}
                    className={`flex items-center gap-3 p-3 transition-colors border-b border-primary/5 last:border-0 ${activeIndex === i ? "bg-primary/10" : "hover:bg-secondary/50"}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border">
                      {p.images && p.images[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-6 h-6 object-contain" loading="lazy" />
                      ) : (
                        p.category === 'phone' ? '📱' : p.category === 'accessory' ? '🎧' : '💻'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{highlightMatch(p.name, searchQuery)}</p>
                      <p className="text-[11px] uppercase font-black tracking-widest text-[#7a869a]">{p.brand}</p>
                    </div>
                    {getLowestPrice(p) > 0 && (
                      <span className="text-xs font-black text-primary shrink-0">₹{getLowestPrice(p).toLocaleString()}</span>
                    )}
                  </Link>
                ))}
              </div>
              <button
                onClick={() => { navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(""); }}
                className="w-full p-2 text-xs font-black uppercase tracking-wider text-primary hover:bg-primary/5 text-center transition-colors border-t border-primary/10"
              >
                View all results
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button aria-label="Open search" className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-primary" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="w-5 h-5" />
          </button>

          {!isAdmin && (
            <Link to="/cart" aria-label={`Cart (${totalItems} items)`} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-primary relative group">
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          <div className="h-6 w-px bg-border mx-0.5 sm:mx-1" />

          {!isAuthenticated ? (
            <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:bg-secondary transition-all">
              <User className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Login</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative">
                {isProfileOpen && (
                  <div className="fixed inset-0 z-50" onClick={() => setIsProfileOpen(false)} />
                )}
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} aria-label="Open profile menu" aria-expanded={isProfileOpen} aria-haspopup="true" className="relative z-[60] flex items-center gap-2 p-2 rounded-full hover:bg-secondary transition-all">
                  <div className="w-8 h-8 rounded-full gradient-purple flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </button>
                <div role="menu" className={`absolute right-0 top-full mt-2 w-44 sm:w-48 bg-card border border-border rounded-xl shadow-xl py-2 transition-all transform z-[60] origin-top-right ${isProfileOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
                  <div className="px-4 py-2 border-b border-border mb-1">
                    <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                  </div>

                  {/* Admin outside admin panel: Admin Panel, My Profile, Logout */}
                  {/* Admin inside admin panel: My Profile, View Store, Logout */}
                  {/* Regular user: My Orders, My Profile, Logout */}
                  {isAdmin && !isInsideAdmin && (
                    <Link to={isSuperAdmin ? "/superadmin" : "/admin/dashboard"} className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-secondary" onClick={() => setIsProfileOpen(false)}>
                      <LayoutDashboard className="w-4 h-4 text-primary" /> {isSuperAdmin ? "Super Admin" : "Admin Panel"}
                    </Link>
                  )}

                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-secondary" onClick={() => setIsProfileOpen(false)}>
                    <User className="w-4 h-4 text-primary" /> My Profile
                  </Link>

                  {isAdmin && isInsideAdmin && (
                    <Link to="/" className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-secondary" onClick={() => setIsProfileOpen(false)}>
                      <Store className="w-4 h-4 text-primary" /> View Store
                    </Link>
                  )}

                  {!isAdmin && (
                    <Link to="/my-orders" className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-secondary" onClick={() => setIsProfileOpen(false)}>
                      <Package className="w-4 h-4 text-primary" /> My Orders
                    </Link>
                  )}

                  <button onClick={() => { setIsProfileOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Menu Overlay & Sidebar */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden ${isMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-background/40 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-[90%] max-w-[280px] sm:max-w-[320px] bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col shadow-[20px_0_60px_-15px_rgba(76,29,149,0.3)] ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-6 border-b border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white shadow-md">
                <Menu className="w-5 h-5" />
              </div>
              <p className="font-black text-xs tracking-widest text-foreground">MENU</p>
            </div>
            <button aria-label="Close menu" onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full bg-white/50 hover:bg-secondary/80 transition-colors border border-black/5">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-2">
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-2 mb-4">Navigation</p>
              {[
                { label: "Home", path: "/", icon: Home },
                { label: "Laptops", path: "/laptops", icon: Laptop },
                { label: "Phones", path: "/phones", icon: Smartphone },
                { label: "Accessory", path: "/accessories", icon: Headphones },
                { label: "Brands", path: "/brands", icon: Tag },
                { label: "Community", path: "/community", icon: Users },
                { label: "Contact", path: "/contact", icon: Phone },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-foreground/8 hover:bg-foreground/12 transition-all group border border-foreground/10 hover:border-foreground/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-foreground/10 flex items-center justify-center text-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <link.icon className="w-4 h-4" />
                    </div>
                    <span className="font-black text-sm tracking-tight text-primary">{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/40 group-hover:text-primary group-hover:opacity-100 transition-all" />
                </Link>
              ))}
            </div>

            <div className="h-px bg-border/50 mx-2" />

            <div className="space-y-2">
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-2 mb-4">Account Services</p>
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
                  {/* Admin outside admin panel: Admin Panel, My Profile, Logout */}
                  {isAdmin && !isInsideAdmin && (
                    <Link to={isSuperAdmin ? "/superadmin" : "/admin/dashboard"} className="flex items-center gap-4 p-4 rounded-2xl bg-foreground/8 hover:bg-foreground/12 transition-all border border-foreground/10 hover:border-foreground/20" onClick={() => setIsMenuOpen(false)}>
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-primary">{isSuperAdmin ? "Super Admin" : "Admin Panel"}</span>
                    </Link>
                  )}

                  <Link to="/profile" className="flex items-center gap-4 p-4 rounded-2xl bg-foreground/8 hover:bg-foreground/12 transition-all border border-foreground/10 hover:border-foreground/20" onClick={() => setIsMenuOpen(false)}>
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-primary">My Profile</span>
                  </Link>

                  {/* Admin inside admin panel: View Store */}
                  {isAdmin && isInsideAdmin && (
                    <Link to="/" className="flex items-center gap-4 p-4 rounded-2xl bg-foreground/8 hover:bg-foreground/12 transition-all border border-foreground/10 hover:border-foreground/20" onClick={() => setIsMenuOpen(false)}>
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary transition-colors">
                        <Store className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-primary">View Store</span>
                    </Link>
                  )}

                  {/* Regular user: My Orders */}
                  {!isAdmin && (
                    <Link to="/my-orders" className="flex items-center gap-4 p-4 rounded-2xl bg-foreground/8 hover:bg-foreground/12 transition-all border border-foreground/10 hover:border-foreground/20" onClick={() => setIsMenuOpen(false)}>
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary transition-colors">
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-primary">My Orders</span>
                    </Link>
                  )}

                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 p-4 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    Log Out
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center justify-center gap-3 p-4 rounded-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 mt-4 active:scale-95" onClick={() => setIsMenuOpen(false)}>
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
        className={`fixed inset-0 z-[110] bg-white/80 backdrop-blur-2xl transition-all duration-300 lg:hidden ${isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
      >
        <div className="p-4 sm:p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h3 className="text-xl font-black tracking-tight">Search Catalog</h3>
            <button aria-label="Close search" onClick={() => setIsSearchOpen(false)} className="p-2 rounded-full hover:bg-secondary">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="What are you looking for?"
              className="w-full h-12 sm:h-16 bg-white/90 border border-primary/20 shadow-xl rounded-full pl-12 pr-4 font-bold placeholder:font-medium outline-none focus:ring-2 focus:ring-primary/40 transition-all relative z-10"
            />

            {/* Mobile Search Dropdown */}
            {searchQuery.length > 1 && searchResults.length > 0 && (
              <div className="absolute top-16 left-0 right-0 mt-2 bg-white border border-primary/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                <div className="max-h-[50vh] overflow-y-auto w-full">
                  {searchResults.map((p, i) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      onClick={() => { setSearchQuery(""); setIsSearchOpen(false); }}
                      className={`flex items-center gap-4 p-4 transition-colors border-b border-primary/5 last:border-0 ${activeIndex === i ? "bg-primary/10" : "hover:bg-secondary/50"}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0 border border-border shadow-soft">
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-8 h-8 object-contain" loading="lazy" />
                        ) : (
                          p.category === 'phone' ? '📱' : p.category === 'accessory' ? '🎧' : '💻'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-foreground truncate">{highlightMatch(p.name, searchQuery)}</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-primary/60">{p.brand}</p>
                      </div>
                      {getLowestPrice(p) > 0 && (
                        <span className="text-sm font-black text-primary shrink-0">₹{getLowestPrice(p).toLocaleString()}</span>
                      )}
                    </Link>
                  ))}
                </div>
                <button
                  onClick={() => { navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(""); setIsSearchOpen(false); }}
                  className="w-full p-4 text-xs font-black uppercase tracking-wider text-primary hover:bg-primary/5 text-center transition-colors bg-secondary/30"
                >
                  View all results
                </button>
              </div>
            )}
          </div>
          <div className="mt-8 flex-1 overflow-y-auto">
            <p className="text-[11px] uppercase font-black tracking-widest text-[#7a869a] mb-4">Trending Searches</p>
            <div className="flex flex-wrap gap-2">
              {["iPhone 16", "MacBook Air", "Galaxy S24", "Gaming Laptop", "AirPods"].map(tag => (
                <button key={tag} onClick={() => { setSearchQuery(tag); }} className="px-4 py-2 rounded-full border border-border text-sm font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
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
