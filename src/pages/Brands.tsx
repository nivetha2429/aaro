import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Smartphone, Laptop, ArrowUpRight, Package } from "lucide-react";
import { useData } from "@/context/DataContext";

const BRAND_COLORS: Record<string, string> = {
  Apple: "from-slate-700 to-slate-900",
  Samsung: "from-blue-600 to-blue-900",
  OnePlus: "from-red-500 to-red-800",
  Google: "from-green-500 to-blue-600",
  Xiaomi: "from-orange-500 to-orange-800",
  Nothing: "from-zinc-700 to-zinc-900",
  Vivo: "from-indigo-500 to-indigo-800",
  OPPO: "from-teal-500 to-teal-800",
  Realme: "from-yellow-500 to-orange-600",
  Motorola: "from-sky-500 to-sky-800",
  Dell: "from-blue-500 to-blue-800",
  HP: "from-cyan-600 to-blue-700",
  Lenovo: "from-red-600 to-red-900",
  ASUS: "from-blue-700 to-indigo-900",
  Microsoft: "from-sky-400 to-blue-700",
  Acer: "from-green-600 to-green-900",
  MSI: "from-red-700 to-gray-900",
  Razer: "from-green-400 to-green-800",
  default: "from-primary to-accent",
};

const Brands = () => {
  const { products, loading } = useData();

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
      .map(([name, data]) => ({
        name,
        count: data.count,
        categories: Array.from(data.categories),
        topProduct: data.topProduct,
        gradient: BRAND_COLORS[name] || BRAND_COLORS.default,
        initial: name.charAt(0).toUpperCase(),
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

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
            className="group relative overflow-hidden rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1.5 transition-all duration-300"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${brand.gradient} opacity-90`} />

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 p-5 flex flex-col items-center text-center gap-3">
              {/* Brand Initial Logo */}
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-inner">
                <span className="text-2xl font-black text-white tracking-tight">{brand.initial}</span>
              </div>

              {/* Brand Name */}
              <div>
                <p className="font-black text-white text-sm leading-tight">{brand.name}</p>
                <p className="text-white/70 text-[10px] font-bold mt-0.5">
                  {brand.count} {brand.count === 1 ? "model" : "models"}
                </p>
              </div>

              {/* Explore arrow */}
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
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
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3 tracking-tight">
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
            <BrandGrid brands={laptopBrands} label="Laptop & PC Brands" Icon={Laptop} />
          )}
        </>
      )}
    </div>
  );
};

export default Brands;
