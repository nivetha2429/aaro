import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useData } from "@/context/DataContext";

const Shop = () => {
  const { products } = useData();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

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
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [search, category, selectedBrands, sortBy]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">Shop</h1>

      {/* Search & Sort Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
        <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-sm">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 shrink-0`}>
          <div className="glass-card rounded-lg p-4 space-y-5">
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-2">Category</h3>
              <div className="space-y-1.5">
                {[{ label: "All", value: "" }, { label: "Phones", value: "phone" }, { label: "Laptops", value: "laptop" }].map((c) => (
                  <label key={c.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="category" checked={category === c.value} onChange={() => handleCategoryChange(c.value)} className="accent-primary" />
                    <span className="text-foreground">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-2">Brand</h3>
              <div className="space-y-1.5">
                {brands.map((b) => (
                  <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} className="accent-primary" />
                    <span className="text-foreground">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">No products found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
