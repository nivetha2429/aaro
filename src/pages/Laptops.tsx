import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useData } from "@/context/DataContext";

const Laptops = () => {
  const { products } = useData();
  const allLaptops = useMemo(() => products.filter((p) => p.category === "laptop"), [products]);
  const brands = useMemo(() => [...new Set(allLaptops.map((p) => p.brand))].sort(), [allLaptops]);

  const [search, setSearch] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const filteredLaptops = useMemo(() => {
    return allLaptops.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      return matchesSearch && matchesBrand;
    });
  }, [allLaptops, search, selectedBrands]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-foreground text-glow whitespace-nowrap">Laptops</h1>

        <div className="flex gap-2 w-full md:max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search laptop models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Brand Filter Sidebar */}
        <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-60 shrink-0`}>
          <div className="glass-card rounded-lg p-5 sticky top-24">
            <h3 className="font-bold text-foreground mb-4">Brands</h3>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-y-2.5">
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-2.5 text-sm cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="accent-primary w-4 h-4 rounded"
                  />
                  <span className="text-foreground group-hover:text-primary transition-colors">{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredLaptops.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
              {filteredLaptops.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card rounded-lg">
              <p className="text-muted-foreground">No laptops match your current filters.</p>
              <button
                onClick={() => { setSearch(""); setSelectedBrands([]); }}
                className="mt-4 text-primary font-medium hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Laptops;

