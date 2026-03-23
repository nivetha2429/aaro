import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Check, X, ArrowLeft } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import PageMeta from "@/components/PageMeta";
import QuickViewModal from "@/components/QuickViewModal";
import { useData } from "@/context/DataContext";
import { useDebounce } from "@/hooks/useDebounce";
import { Product } from "@/data/products";

const Shop = () => {
  const { products, categories: dbCategories, loading: dataLoading } = useData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize all state from URL params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 250);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    const b = searchParams.get("brand");
    return b ? b.split(",") : [];
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const min = searchParams.get("minPrice");
    const max = searchParams.get("maxPrice");
    return [min ? Number(min) : 0, max ? Number(max) : 0];
  });
  const [selectedRAM, setSelectedRAM] = useState<string[]>(() => {
    const r = searchParams.get("ram");
    return r ? r.split(",") : [];
  });
  const [selectedStorage, setSelectedStorage] = useState<string[]>(() => {
    const s = searchParams.get("storage");
    return s ? s.split(",") : [];
  });
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [conditionFilter, setConditionFilter] = useState(searchParams.get("condition") || "all");

  // Sync filters → URL params
  const syncURL = useCallback(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;
    if (selectedBrands.length) params.brand = selectedBrands.join(",");
    if (sortBy !== "featured") params.sort = sortBy;
    if (selectedRAM.length) params.ram = selectedRAM.join(",");
    if (selectedStorage.length) params.storage = selectedStorage.join(",");
    if (priceInitialized && priceRange[0] > 0) params.minPrice = String(priceRange[0]);
    if (priceInitialized && priceRange[1] > 0) params.maxPrice = String(priceRange[1]);
    if (conditionFilter !== "all") params.condition = conditionFilter;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, category, selectedBrands, sortBy, selectedRAM, selectedStorage, priceRange, priceInitialized, conditionFilter, setSearchParams]);

  useEffect(() => { syncURL(); }, [syncURL]);

  // Sync incoming URL search param (e.g., from Navbar search)
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch !== null && urlSearch !== search) {
      setSearch(urlSearch);
    }
  }, [searchParams]);

  // Listen to browser back/forward and update filter state from URL params
  useEffect(() => {
    const handlePopstate = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("search") || "");
      setCategory(params.get("category") || "");
      setSelectedBrands(params.get("brand") ? params.get("brand")!.split(",") : []);
      setSortBy(params.get("sort") || "featured");
      setConditionFilter(params.get("condition") || "all");
      const minPrice = params.get("minPrice");
      const maxPrice = params.get("maxPrice");
      if (minPrice || maxPrice) {
        setPriceRange([minPrice ? Number(minPrice) : 0, maxPrice ? Number(maxPrice) : 0]);
      }
      const ram = params.get("ram");
      setSelectedRAM(ram ? ram.split(",") : []);
      const storage = params.get("storage");
      setSelectedStorage(storage ? storage.split(",") : []);
    };

    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, []);

  // Dynamically calculate brands based on the current category
  const brands = useMemo(() => {
    const relevantProducts = category
      ? products.filter(p => p.category === category)
      : products;
    return [...new Set(relevantProducts.map((p) => p.brand))].sort();
  }, [products, category]);

  // Extract unique RAM/Storage values and price bounds from variants
  const { ramOptions, storageOptions, minPrice, maxPrice } = useMemo(() => {
    const relevantProducts = category ? products.filter(p => p.category === category) : products;
    const rams = new Set<string>();
    const storages = new Set<string>();
    let min = Infinity, max = 0;
    relevantProducts.forEach(p => {
      p.variants?.forEach(v => {
        if (v.ram) rams.add(v.ram);
        if (v.storage) storages.add(v.storage);
        if (v.price > 0) { min = Math.min(min, v.price); max = Math.max(max, v.price); }
      });
    });
    if (min === Infinity) min = 0;
    return {
      ramOptions: [...rams].sort((a, b) => parseInt(a) - parseInt(b)),
      storageOptions: [...storages].sort((a, b) => parseInt(a) - parseInt(b)),
      minPrice: min,
      maxPrice: max,
    };
  }, [products, category]);

  // Initialize price range when bounds change (only if not set from URL)
  useEffect(() => {
    if (maxPrice > 0) {
      if (!priceInitialized) {
        const urlMin = searchParams.get("minPrice");
        const urlMax = searchParams.get("maxPrice");
        setPriceRange([urlMin ? Number(urlMin) : minPrice, urlMax ? Number(urlMax) : maxPrice]);
        setPriceInitialized(true);
      } else {
        setPriceRange(([prevMin, prevMax]) => [
          Math.max(minPrice, Math.min(prevMin, maxPrice)),
          Math.min(maxPrice, Math.max(prevMax, minPrice)),
        ]);
      }
    }
  }, [minPrice, maxPrice]);

  // Compute product counts per filter option
  const { brandCounts, ramCounts, storageCounts } = useMemo(() => {
    const relevantProducts = category ? products.filter(p => p.category === category) : products;
    const bc: Record<string, number> = {};
    const rc: Record<string, number> = {};
    const sc: Record<string, number> = {};
    relevantProducts.forEach(p => {
      bc[p.brand] = (bc[p.brand] || 0) + 1;
      const counted = { ram: new Set<string>(), storage: new Set<string>() };
      p.variants?.forEach(v => {
        if (v.ram && !counted.ram.has(v.ram)) { rc[v.ram] = (rc[v.ram] || 0) + 1; counted.ram.add(v.ram); }
        if (v.storage && !counted.storage.has(v.storage)) { sc[v.storage] = (sc[v.storage] || 0) + 1; counted.storage.add(v.storage); }
      });
    });
    return { brandCounts: bc, ramCounts: rc, storageCounts: sc };
  }, [products, category]);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSelectedBrands([]);
    setSelectedRAM([]);
    setSelectedStorage([]);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
  };

  const toggleRAM = (ram: string) => {
    setSelectedRAM((prev) => prev.includes(ram) ? prev.filter((r) => r !== ram) : [...prev, ram]);
  };

  const toggleStorage = (storage: string) => {
    setSelectedStorage((prev) => prev.includes(storage) ? prev.filter((s) => s !== storage) : [...prev, storage]);
  };

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (debouncedSearch && !p.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (category && p.category !== category) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      if (conditionFilter !== "all" && (p.condition || "new") !== conditionFilter) return false;

      // Variant-based filters: price range, RAM, storage
      const variants = p.variants || [];
      if (variants.length > 0) {
        const hasMatchingVariant = variants.some(v => {
          const inPrice = v.price >= priceRange[0] && v.price <= priceRange[1];
          const inRAM = selectedRAM.length === 0 || selectedRAM.includes(v.ram);
          const inStorage = selectedStorage.length === 0 || selectedStorage.includes(v.storage);
          return inPrice && inRAM && inStorage;
        });
        if (!hasMatchingVariant) return false;
      }

      return true;
    });

    switch (sortBy) {
      case "name-asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "price-asc": result.sort((a, b) => (a.variants?.[0]?.price ?? 0) - (b.variants?.[0]?.price ?? 0)); break;
      case "price-desc": result.sort((a, b) => (b.variants?.[0]?.price ?? 0) - (a.variants?.[0]?.price ?? 0)); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [debouncedSearch, category, selectedBrands, selectedRAM, selectedStorage, priceRange, sortBy, conditionFilter, products]);

  return (
    <div className="w-full section-px py-4 sm:py-6 pb-24 lg:pb-4">
      <PageMeta
        title="Online Mobile & Laptop Shop Coimbatore | Best Deals"
        description="Browse our complete collection of smartphones, laptops & accessories. Filter by brand, price & category. Best deals in Coimbatore. EMI & WhatsApp order available. Aaro Groups."
        keywords="online mobile shop Coimbatore, buy phones online Coimbatore, buy laptops online Coimbatore, electronics shop Coimbatore, mobile phones Tamil Nadu, best laptop deals Coimbatore, Aaro Groups shop"
        canonicalPath="/shop"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://aarogroups.com/" },
            { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://aarogroups.com/shop" }
          ]
        }}
      />
      <div className="flex items-center gap-4 mb-6">
        <button
          aria-label="Go back"
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
          <label htmlFor="shop-search" className="sr-only">Search products</label>
          <input
            id="shop-search"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 sm:h-12 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex gap-2 h-10 sm:h-12">
          <label htmlFor="shop-sort" className="sr-only">Sort products</label>
          <select
            id="shop-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 sm:flex-none h-full px-3 md:px-4 rounded-xl border border-border bg-card text-xs md:text-sm font-bold focus:outline-none cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="rating">Top Rated</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden h-full min-h-[44px] flex items-center justify-center gap-2 px-4 rounded-xl border border-border bg-card text-primary hover:bg-primary/5 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-widest">Filters</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(search || category || selectedBrands.length > 0 || selectedRAM.length > 0 || selectedStorage.length > 0 || (priceRange[0] > minPrice || priceRange[1] < maxPrice)) && (
        <div className="flex flex-wrap items-center gap-2 mb-6 animate-fade-in">
          <span className="text-xs font-bold text-muted-foreground mr-2">Active Filters:</span>
          {search && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-primary/20 text-xs font-bold text-foreground shadow-sm">
              Search: "{search}"
              <button aria-label="Clear search filter" onClick={() => setSearch("")} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
            </div>
          )}
          {category && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-primary/20 text-xs font-bold text-foreground shadow-sm">
              Category: {dbCategories.find(c => (c.slug || c.name.toLowerCase()) === category)?.name || category}
              <button aria-label="Clear category filter" onClick={() => handleCategoryChange("")} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
            </div>
          )}
          {selectedBrands.map(b => (
            <div key={b} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 text-xs font-bold shadow-sm">
              Brand: {b}
              <button aria-label={`Remove ${b} brand filter`} onClick={() => toggleBrand(b)} className="ml-1 hover:bg-white rounded-full"><X className="w-3 h-3" /></button>
            </div>
          ))}
          {selectedRAM.map(r => (
            <div key={r} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200 text-xs font-bold shadow-sm">
              RAM: {r}
              <button aria-label={`Remove ${r} RAM filter`} onClick={() => toggleRAM(r)} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
            </div>
          ))}
          {selectedStorage.map(s => (
            <div key={s} className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 text-xs font-bold shadow-sm">
              Storage: {s}
              <button aria-label={`Remove ${s} storage filter`} onClick={() => toggleStorage(s)} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
            </div>
          ))}
          {(priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-200 text-xs font-bold shadow-sm">
              Price: ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
              <button aria-label="Clear price filter" onClick={() => setPriceRange([minPrice, maxPrice])} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
            </div>
          )}
          <button onClick={() => { setSearch(""); setCategory(""); setSelectedBrands([]); setSelectedRAM([]); setSelectedStorage([]); setPriceRange([minPrice, maxPrice]); setConditionFilter("all"); }} className="text-[11px] uppercase font-black tracking-widest text-muted-foreground hover:text-red-500 ml-2 transition-colors">
            Clear All
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 lg:w-64 xl:w-72 shrink-0`}>
          <div className="glass-card rounded-2xl p-4 sm:p-5 md:p-6 space-y-8 md:sticky md:top-24 border border-white/40 shadow-xl shadow-primary/5">
            {/* Condition Filter */}
            <div>
              <h3 className="font-black text-foreground text-xs uppercase tracking-widest mb-4 border-b border-primary/10 pb-2">Condition</h3>
              <div className="flex flex-wrap gap-2">
                {[{ label: "All", value: "all" }, { label: "New", value: "new" }, { label: "Refurbished", value: "refurbished" }].map(c => (
                  <button key={c.value} onClick={() => setConditionFilter(c.value)}
                    className={`px-4 py-2 min-h-[36px] rounded-full text-xs font-bold transition-all border ${conditionFilter === c.value ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-black text-foreground text-xs uppercase tracking-widest mb-4 border-b border-primary/10 pb-2">Category</h3>
              <div className="space-y-3">
                {[{ label: "All Products", value: "" }, ...dbCategories.map(c => ({ label: c.name, value: c.slug || c.name.toLowerCase() }))].map((c) => (
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
                    <span className={`font-bold transition-colors ${selectedBrands.includes(b) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>{b} <span className="text-[10px] opacity-60">({brandCounts[b] || 0})</span></span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            {maxPrice > 0 && (
              <div>
                <h3 className="font-black text-foreground text-xs uppercase tracking-widest mb-4 border-b border-primary/10 pb-2">Price Range</h3>
                <div className="space-y-3">
                  <label htmlFor="price-range-slider" className="sr-only">Maximum price</label>
                  <input
                    id="price-range-slider"
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    step={500}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-primary"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-card text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary/30"
                      min={minPrice}
                      max={priceRange[1]}
                    />
                    <span className="text-muted-foreground text-xs font-bold">to</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-card text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary/30"
                      min={priceRange[0]}
                      max={maxPrice}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* RAM Filter */}
            {ramOptions.length > 0 && (
              <div>
                <h3 className="font-black text-foreground text-xs uppercase tracking-widest mb-4 border-b border-primary/10 pb-2">RAM</h3>
                <div className="flex flex-wrap gap-2">
                  {ramOptions.map((r) => (
                    <button
                      key={r}
                      onClick={() => toggleRAM(r)}
                      className={`px-3 py-2 min-h-[36px] rounded-lg border text-xs font-bold transition-all ${selectedRAM.includes(r) ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                    >
                      {r} <span className="opacity-60">({ramCounts[r] || 0})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Storage Filter */}
            {storageOptions.length > 0 && (
              <div>
                <h3 className="font-black text-foreground text-xs uppercase tracking-widest mb-4 border-b border-primary/10 pb-2">Storage</h3>
                <div className="flex flex-wrap gap-2">
                  {storageOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleStorage(s)}
                      className={`px-3 py-2 min-h-[36px] rounded-lg border text-xs font-bold transition-all ${selectedStorage.includes(s) ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                    >
                      {s} <span className="opacity-60">({storageCounts[s] || 0})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          {/* Result count */}
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 font-medium">
            {dataLoading ? "Loading products..." : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
          </p>

          {dataLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-fluid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-secondary/50" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-secondary/50 rounded-full w-3/4" />
                    <div className="h-3 bg-secondary/50 rounded-full w-1/2" />
                    <div className="h-5 bg-secondary/50 rounded-full w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-fluid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={() => setQuickViewProduct(p)} />
              ))}
            </div>
          ) : (
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-16 lg:p-20 text-center border border-dashed border-border">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
              <button onClick={() => { setSearch(""); setCategory(""); setSelectedBrands([]); setSelectedRAM([]); setSelectedStorage([]); setPriceRange([minPrice, maxPrice]); setConditionFilter("all"); }} className="mt-6 text-primary font-bold hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
};

export default Shop;
