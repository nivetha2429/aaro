import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-4 text-sm">Start shopping to add items to your cart.</p>
        <Link to="/shop" className="inline-block gradient-purple text-primary-foreground px-6 py-2.5 rounded-lg font-medium">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-3xl md:text-5xl font-black text-foreground mb-8 tracking-tight">Your Cart <span className="text-primary/50 text-xl font-bold">({totalItems} items)</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.product.id}-${item.ram}-${item.storage}-${item.color}`} className="glass-card rounded-3xl p-4 md:p-6 flex flex-col sm:flex-row items-center gap-6 border border-white/50 shadow-xl shadow-primary/5 group">
              <div className="w-full sm:w-32 h-32 rounded-2xl bg-white/60 flex items-center justify-center shrink-0 text-5xl transform transition-transform group-hover:scale-105">
                {item.product.category === "phone" ? "📱" : "💻"}
              </div>

              <div className="flex-1 w-full text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.product.brand}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#7a869a] bg-gray-100 px-2 py-0.5 rounded-full">{item.ram} / {item.storage} / {item.color}</span>
                </div>
                <Link to={`/product/${item.product.id}`} className="font-black text-lg md:text-xl text-foreground hover:text-primary transition-colors block mb-1">{item.product.name}</Link>
                <div className="mb-4">
                  <span className="text-sm font-bold text-muted-foreground">₹{item.price.toLocaleString()} each</span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4">
                  <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border/50">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.ram, item.storage, item.color)} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white text-muted-foreground hover:text-primary transition-all">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.ram, item.storage, item.color)} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white text-muted-foreground hover:text-primary transition-all">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="font-black text-xl text-primary">₹{(item.price * item.quantity).toLocaleString()}</span>
                    <button onClick={() => removeFromCart(item.product.id, item.ram, item.storage, item.color)} className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Remove Item">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary - Premium Card */}
        <div className="glass-card rounded-[2.5rem] p-8 md:p-10 h-fit sticky top-24 border border-white/60 shadow-2xl shadow-primary/10">
          <h3 className="text-2xl font-black text-foreground mb-6 tracking-tight">Order Summary</h3>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-muted-foreground font-bold">
              <span className="text-sm uppercase tracking-widest">Subtotal</span>
              <span className="text-foreground">₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground font-bold">
              <span className="text-sm uppercase tracking-widest">Shipping</span>
              <span className="text-green-500">FREE</span>
            </div>
            <div className="pt-6 border-t border-primary/10 flex justify-between items-center">
              <span className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Total</span>
              <span className="text-4xl font-black text-primary tracking-tighter">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link to="/order" className="block w-full gradient-purple text-primary-foreground py-5 rounded-2xl font-black text-center shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Proceed to Checkout
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="text-center p-3 glass-light rounded-2xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Secure</p>
              <p className="text-[10px] font-bold">SSL Payment</p>
            </div>
            <div className="text-center p-3 glass-light rounded-2xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Return</p>
              <p className="text-[10px] font-bold">30 Days policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
