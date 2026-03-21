import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Smartphone, Laptop, ArrowUpRight, Package } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { useData } from "@/context/DataContext";
import BrandLogo from "@/components/BrandLogo";

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
      <div className="w-full section-px py-16 text-center animate-pulse text-muted-foreground">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 justify-items-center">
        {brands.map((brand) => (
          <Link
            key={brand.name}
            to={`/shop?brand=${encodeURIComponent(brand.name)}`}
            className="group relative overflow-hidden rounded-sm sm:rounded-3xl bg-white border border-border shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 hover-scale click-scale shine-effect w-full aspect-square"
          >
            {/* Hover tint */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm sm:rounded-2xl" />

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 p-2 sm:p-4">
              {/* Brand Logo or Initial */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-sm sm:rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center overflow-hidden">
                <BrandLogo
                  src={brand.image}
                  name={brand.name}
                  imgClassName="w-8 h-8 sm:w-9 sm:h-9 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain transition-all duration-300"
                  fallbackClassName="text-base sm:text-lg md:text-2xl font-black text-foreground/40 tracking-tight"
                />
              </div>

              {/* Brand Name */}
              <div className="text-center w-full">
                <p className="font-bold text-muted-foreground text-[10px] sm:text-[11px] md:text-sm leading-tight group-hover:text-primary transition-colors truncate">{brand.name}</p>
                <p className="text-muted-foreground/60 text-[10px] sm:text-[11px] font-bold mt-0.5">
                  {brand.count} {brand.count === 1 ? "model" : "models"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div className="w-full section-px py-4 sm:py-6 md:py-10 pb-24 lg:pb-10">
      <PageMeta
        title="Shop by Brand"
        description="Explore top electronics brands at Aaro Groups. Apple, Samsung, OnePlus, HP, Dell, Lenovo & more. Find your favourite brand's latest products."
        keywords="Apple store Coimbatore, Samsung shop, OnePlus dealer, HP laptops, Dell Coimbatore, brand electronics India"
        canonicalPath="/brands"
      />
      {/* Header */}
      <div className="mb-12 text-center animate-slide-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black animate-shimmer mb-4 tracking-tighter">
          Our Brands
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-lg mx-auto">
          Premium tech from the world's most trusted manufacturers. Click any brand to explore their lineup.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 text-xs sm:text-sm text-muted-foreground">
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
