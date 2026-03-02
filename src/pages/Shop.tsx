import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Check, X, ArrowLeft } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useData } from "@/context/DataContext";

const Shop = () => {
  const { products } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialBrand = searchParams.get("brand") || "";

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // Sync state when URL params change (e.g., from Navbar search)
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch !== null) {
      setSearch(urlSearch);
    }
  }, [searchParams]);

  // Dynamically calculate brands based on the current category
  const brands = useMemo(() => {
    const relevantProducts = category
      ? products.filter(p => p.category === category)
      : products;
    return [...new Set(relevantProducts.map((p) => p.brand))].sort();
  }, [products, category]);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSelectedBrands([]); // Reset brand selection when category changes
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
  };

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && p.category !== category) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      return true;
    });

    switch (sortBy) {
      case "name-asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [search, category, selectedBrands, sortBy]);

  return (
    <div className="container mx-auto px-4 py-6 pb-16 md:pb-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-secondary/80 hover:bg-secondary transition-colors border border-border"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter">Shop</h1>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex gap-2 h-12">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 sm:flex-none h-full px-3 md:px-4 rounded-xl border border-border bg-card text-xs md:text-sm font-bold focus:outline-none cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="rating">Top Rated</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden h-full flex items-center justify-center gap-2 px-4 rounded-xl border border-border bg-card text-primary hover:bg-primary/5 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(search || category || selectedBrands.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 mb-6 animate-fade-in">
          <span className="text-xs font-bold text-muted-foreground mr-2">Active Filters:</span>
          {search && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-primary/20 text-xs font-bold text-foreground shadow-sm">
              Search: "{search}"
              <button onClick={() => setSearch("")} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
            </div>
          )}
          {category && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-primary/20 text-xs font-bold text-foreground shadow-sm">
              Category: {category === "phone" ? "Phones" : "Laptops"}
              <button onClick={() => handleCategoryChange("")} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
            </div>
          )}
          {selectedBrands.map(b => (
            <div key={b} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 text-xs font-bold shadow-sm">
              Brand: {b}
              <button onClick={() => toggleBrand(b)} className="ml-1 hover:bg-white rounded-full"><X className="w-3 h-3" /></button>
            </div>
          ))}
          <button onClick={() => { setSearch(""); setCategory(""); setSelectedBrands([]); }} className="text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:text-red-500 ml-2 transition-colors">
            Clear All
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0`}>
          <div className="glass-card rounded-2xl p-6 space-y-8 lg:sticky lg:top-24 border border-white/40 shadow-xl shadow-primary/5">
            <div>
              <h3 className="font-black text-foreground text-xs uppercase tracking-widest mb-4 border-b border-primary/10 pb-2">Category</h3>
              <div className="space-y-3">
                {[{ label: "All Products", value: "" }, { label: "Phones", value: "phone" }, { label: "Laptops", value: "laptop" }].map((c) => (
                  <label key={c.value} className="flex items-center gap-3 text-sm cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${category === c.value ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}>
                      {category === c.value && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <input type="radio" name="category" checked={category === c.value} onChange={() => handleCategoryChange(c.value)} className="hidden" />
                    <span className={`font-bold transition-colors ${category === c.value ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-black text-foreground text-xs uppercase tracking-widest mb-4 border-b border-primary/10 pb-2">Brands</h3>
              <div className="grid grid-cols-1 gap-3">
                {brands.map((b) => (
                  <label key={b} className="flex items-center gap-3 text-sm cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedBrands.includes(b) ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}>
                      {selectedBrands.includes(b) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} className="hidden" />
                    <span className={`font-bold transition-colors ${selectedBrands.includes(b) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>{b}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 md:p-20 text-center border border-dashed border-border">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
              <button onClick={() => { setSearch(""); setCategory(""); setSelectedBrands([]); }} className="mt-6 text-primary font-bold hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
