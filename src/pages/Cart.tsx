import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <PageMeta title="Cart" description="Review your shopping cart at Aaro Systems." />
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <ShoppingCart className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6 text-sm text-center max-w-xs">Looks like you haven't added anything yet. Start shopping to fill it up!</p>
        <Link to="/shop" className="gradient-purple text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 pb-24 lg:pb-6">
      <PageMeta title="Cart" description="Review your shopping cart at Aaro Systems." />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors" aria-label="Go back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-xs text-muted-foreground">{totalItems} {totalItems === 1 ? "item" : "items"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-start">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={`${item.product.id}-${item.ram}-${item.storage}-${item.color}`} className="bg-white rounded-xl sm:rounded-2xl border border-border/60 shadow-sm p-3 sm:p-4 flex gap-3 sm:gap-4 group hover:shadow-md transition-shadow">
              {/* Product Image */}
              <Link to={`/product/${item.product.id}`} className="shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center">
                  {item.product.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-3xl">{item.product.category === "phone" ? "📱" : item.product.category === "accessory" ? "🎧" : "💻"}</span>
                  )}
                </div>
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">{item.product.brand}</p>
                    <Link to={`/product/${item.product.id}`} className="font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors line-clamp-1 block">
                      {item.product.name}
                    </Link>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{item.ram} · {item.storage} · {item.color}</p>
                  </div>
                  <button
                    aria-label={`Remove ${item.product.name} from cart`}
                    onClick={() => removeFromCart(item.product.id, item.ram, item.storage, item.color)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Price & Quantity */}
                <div className="flex items-center justify-between mt-3 gap-2">
                  <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg border border-border/50">
                    <button
                      aria-label={`Decrease quantity of ${item.product.name}`}
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.ram, item.storage, item.color)}
                      className="w-9 h-9 sm:w-8 sm:h-8 min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-white rounded-l-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm select-none">{item.quantity}</span>
                    <button
                      aria-label={`Increase quantity of ${item.product.name}`}
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.ram, item.storage, item.color)}
                      className="w-9 h-9 sm:w-8 sm:h-8 min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-white rounded-r-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base sm:text-lg text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                    {item.quantity > 1 && (
                      <p className="text-[10px] text-muted-foreground">₹{item.price.toLocaleString()} each</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-border/60 shadow-sm p-5 sm:p-6 h-fit md:sticky md:top-24">
          <h3 className="text-lg font-bold text-foreground mb-5">Order Summary</h3>

          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
              <span className="font-medium text-foreground">₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-medium text-green-600">FREE</span>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="font-bold text-foreground">Total</span>
              <span className="text-xl sm:text-2xl font-bold text-primary">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <Link
            to="/order"
            className="block w-full gradient-purple text-primary-foreground py-3.5 min-h-[44px] rounded-xl font-bold text-sm text-center shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            Proceed to Checkout
          </Link>

          {/* Trust Badges */}
          <div className="mt-5 flex items-center justify-center gap-5 text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[9px] font-medium">Secure Pay</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4" />
              <span className="text-[9px] font-medium">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4" />
              <span className="text-[9px] font-medium">30-Day Return</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
