import { Link, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, Trash2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import PageMeta from "@/components/PageMeta";
import { useWishlist } from "@/context/WishlistContext";
import { useData } from "@/context/DataContext";

const Wishlist = () => {
  const { wishlist, clearWishlist } = useWishlist();
  const { products } = useData();
  const navigate = useNavigate();

  const wishlistProducts = wishlist
    .map(id => products.find(p => p.id === id || p._id === id))
    .filter(Boolean) as typeof products;

  return (
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-6xl animate-fade-in">
      <PageMeta title="Wishlist" description="Your saved products at Aaro Systems." />
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-secondary/80 hover:bg-secondary transition-colors border border-border"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter">
          My Wishlist
        </h1>
        {wishlistProducts.length > 0 && (
          <span className="text-sm font-bold text-muted-foreground">({wishlistProducts.length})</span>
        )}
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-xl font-black text-foreground mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">Save products you love to find them later.</p>
          <Link
            to="/shop"
            className="inline-block gradient-purple text-primary-foreground px-6 py-2.5 rounded-xl font-bold"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={clearWishlist}
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {wishlistProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;
