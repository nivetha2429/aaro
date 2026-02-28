import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Check, Smartphone } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useData } from "@/context/DataContext";

const Phones = () => {
  const { products } = useData();
  const allPhones = useMemo(() => products.filter((p) => p.category === "phone"), [products]);
  const brands = useMemo(() => [...new Set(allPhones.map((p) => p.brand))].sort(), [allPhones]);

  const [search, setSearch] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const filteredPhones = useMemo(() => {
    return allPhones.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      return matchesSearch && matchesBrand;
    });
  }, [allPhones, search, selectedBrands]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-primary/10 pb-6">
        <div>
          <h1 className="text-glow mb-1">Smartphones</h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-70">Next-Gen Mobile Devices</p>
        </div>

        <div className="flex items-center gap-2 w-full md:max-w-md h-12">
          <div className="relative flex-1 h-full">
            <input
              type="text"
              placeholder="Search phone models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-full pl-11 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium shadow-soft"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden h-full flex items-center justify-center px-4 rounded-xl border border-border bg-card text-primary hover:bg-primary/10 transition-all"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Brand Filter Sidebar */}
        <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0`}>
          <div className="glass-card rounded-[2rem] p-6 sticky top-24 border border-white/40 shadow-xl shadow-primary/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground border-b border-primary/10 pb-3 mb-6">Filter by Brand</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-3 text-sm cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedBrands.includes(brand) ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}>
                    {selectedBrands.includes(brand) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                  <span className={`font-bold transition-colors ${selectedBrands.includes(brand) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>{brand}</span>
                </label>
              ))}
            </div>
            {(selectedBrands.length > 0) && (
              <button
                onClick={() => setSelectedBrands([])}
                className="mt-8 text-[10px] font-black uppercase tracking-widest text-primary hover:underline w-full text-center"
              >
                Clear Selection
              </button>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          {filteredPhones.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPhones.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="py-24 glass-card rounded-[2.5rem] flex flex-col items-center justify-center text-center px-10 border border-dashed border-primary/20 bg-primary/5">
              <div className="w-20 h-20 bg-background/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Smartphone className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-2xl font-black text-foreground mb-2">No Phones Found</h2>
              <p className="text-muted-foreground max-w-xs mb-8">We couldn't find any products matching your specific filters.</p>
              <button
                onClick={() => { setSearch(""); setSelectedBrands([]); }}
                className="gradient-purple text-primary-foreground px-8 py-3.5 rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Phones;

