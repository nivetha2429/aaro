import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Smartphone, Laptop, ArrowUpRight, Package } from "lucide-react";
import { useData } from "@/context/DataContext";

const Brands = () => {
  const { products, brands: brandsData, loading } = useData();

  const brandMap = useMemo(() => {
    const map: Record<string, { count: number; categories: Set<string>; topProduct?: string }> = {};
    products.forEach((p) => {
      if (!p?.brand) return;
      if (!map[p.brand]) map[p.brand] = { count: 0, categories: new Set() };
      map[p.brand].count++;
      map[p.brand].categories.add(p.category);
      if (!map[p.brand].topProduct) map[p.brand].topProduct = p.name;
    });
    return Object.entries(map)
      .map(([name, data]) => {
        const brandEntry = brandsData.find(b => b.name.toLowerCase() === name.toLowerCase());
        return {
          name,
          count: data.count,
          categories: Array.from(data.categories),
          topProduct: data.topProduct,
          image: brandEntry?.image || "",
          initial: name.charAt(0).toUpperCase(),
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [products, brandsData]);

  const phoneBrands = brandMap.filter((b) => b.categories.includes("phone"));
  const laptopBrands = brandMap.filter((b) => b.categories.includes("laptop"));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-pulse text-muted-foreground">
        Loading brands...
      </div>
    );
  }

  const BrandGrid = ({ brands, label, Icon }: { brands: typeof brandMap; label: string; Icon: any }) => (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-foreground">{label}</h2>
          <p className="text-xs text-muted-foreground">{brands.length} brands available</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <Link
            key={brand.name}
            to={`/shop?brand=${encodeURIComponent(brand.name)}`}
            className="group relative overflow-hidden rounded-3xl bg-white border border-border shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 hover-scale click-scale shine-effect"
          >
            {/* Hover tint */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

            <div className="relative z-10 p-5 flex flex-col items-center text-center gap-3">
              {/* Brand Logo or Initial */}
              <div className="w-16 h-16 rounded-2xl bg-secondary/40 border border-border flex items-center justify-center overflow-hidden">
                {brand.image ? (
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-12 h-12 object-contain transition-all duration-300"
                  />
                ) : (
                  <span className="text-2xl font-black text-foreground/40 tracking-tight">{brand.initial}</span>
                )}
              </div>

              {/* Brand Name */}
              <div>
                <p className="font-bold text-muted-foreground text-sm leading-tight group-hover:text-primary transition-colors">{brand.name}</p>
                <p className="text-muted-foreground/60 text-[10px] font-bold mt-0.5">
                  {brand.count} {brand.count === 1 ? "model" : "models"}
                </p>
              </div>

              {/* Explore arrow */}
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div className="container mx-auto px-4 py-10 pb-24 md:pb-10 max-w-7xl">
      {/* Header */}
      <div className="mb-12 text-center animate-slide-up">
        <h1 className="text-4xl md:text-6xl font-black animate-shimmer mb-4 tracking-tighter">
          Our Brands
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
          Premium tech from the world's most trusted manufacturers. Click any brand to explore their lineup.
        </p>
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="font-bold">{brandMap.length} Brands</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            <span className="font-bold">{phoneBrands.length} Phone Brands</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-primary" />
            <span className="font-bold">{laptopBrands.length} Laptop Brands</span>
          </div>
        </div>
      </div>

      {brandMap.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🏷️</p>
          <p className="font-bold text-muted-foreground">No brands yet. Add products in the admin panel.</p>
        </div>
      ) : (
        <>
          {phoneBrands.length > 0 && (
            <BrandGrid brands={phoneBrands} label="Smartphone Brands" Icon={Smartphone} />
          )}
          {laptopBrands.length > 0 && (
            <BrandGrid brands={laptopBrands} label="Laptop Brands" Icon={Laptop} />
          )}
        </>
      )}
    </div>
  );
};

export default Brands;
