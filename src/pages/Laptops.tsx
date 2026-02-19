import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const laptops = products.filter((p) => p.category === "laptop");

const Laptops = () => (
  <div className="container mx-auto px-4 py-6">
    <h1 className="text-3xl font-bold text-foreground mb-6">Laptops</h1>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {laptops.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  </div>
);

export default Laptops;
