import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { WHATSAPP_NUMBER } from "@/data/products";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  const whatsappMessage = items.map((i) => `${i.product.name} x${i.quantity} - $${i.product.price * i.quantity}`).join("\n");
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'd like to place an order:\n\n${whatsappMessage}\n\nTotal: $${totalPrice}`)}`;

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
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">Shopping Cart ({totalItems})</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.product.id} className="glass-card rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-16 h-16 rounded-lg bg-white/40 flex items-center justify-center shrink-0 text-3xl">
                  {item.product.category === "phone" ? "📱" : "💻"}
                </div>
                <div className="flex-1 min-w-0 sm:hidden">
                  <Link to={`/product/${item.product.id}`} className="font-medium text-foreground text-sm hover:text-primary truncate block">{item.product.name}</Link>
                  <p className="text-primary font-bold">₹{item.product.price}</p>
                </div>
              </div>

              <div className="hidden sm:block flex-1 min-w-0">
                <Link to={`/product/${item.product.id}`} className="font-medium text-foreground text-sm hover:text-primary truncate block">{item.product.name}</Link>
                <p className="text-xs font-semibold text-primary/80 uppercase tracking-tighter mb-0.5">{item.product.brand}</p>
                <p className="text-sm text-muted-foreground">₹{item.product.price}</p>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-white/50">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-white/50">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-foreground text-sm w-16 text-right">${item.product.price * item.quantity}</span>
                  <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="glass rounded-lg p-6 h-fit">
          <h3 className="font-bold text-foreground mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>${totalPrice}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span><span className="text-primary font-medium">Free</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium">Total:</span>
              <span className="text-2xl font-bold text-primary">₹{totalPrice}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-base">
              <span>Total</span><span>${totalPrice}</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Link to="/order" className="block w-full gradient-purple text-primary-foreground py-3 rounded-lg font-medium text-center hover:opacity-90 transition-opacity">
              Place Order
            </Link>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block w-full bg-[hsl(142,70%,45%)] text-primary-foreground py-3 rounded-lg font-medium text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Order via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
