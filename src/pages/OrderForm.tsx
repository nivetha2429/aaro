import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { WHATSAPP_NUMBER } from "@/data/products";
import { MessageCircle, CheckCircle, Package } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const OrderForm = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const buildWhatsAppMessage = () => {
    const productLines = items
      .map(
        (i) =>
          `  • ${i.product.name} (${i.ram} / ${i.storage} / ${i.color}) × ${i.quantity} = ₹${(i.price * i.quantity).toLocaleString()}`
      )
      .join("\n");

    const imageLines = items
      .map((i, idx) =>
        i.product.images?.[0]
          ? `  ${idx + 1}. ${i.product.name}: ${i.product.images[0]}`
          : null
      )
      .filter(Boolean)
      .join("\n");

    return [
      `🛒 *New Order — AARO*`,
      ``,
      `👤 *Customer Details:*`,
      `  • Name: ${form.name}`,
      `  • Phone: ${form.phone}`,
      form.email ? `  • Email: ${form.email}` : null,
      ``,
      `📦 *Order Items:*`,
      productLines,
      ``,
      imageLines ? `🖼️ *Product Images:*\n${imageLines}` : null,
      ``,
      `💰 *Grand Total: ₹${totalPrice.toLocaleString()}*`,
      `🚚 Shipping: FREE`,
      ``,
      `📍 *Delivery Address:*`,
      `  ${form.address}`,
      `  ${form.city}, ${form.state} — ${form.pincode}`,
      ``,
      `Please confirm the order and share the delivery timeline. Thank you!`,
    ]
      .filter((line) => line !== null)
      .join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, phone, address, city, state, pincode } = form;
    if (!name || !phone || !address || !city || !state || !pincode) {
      return toast.error("Please fill in all required fields");
    }
    if (!/^\d{6}$/.test(pincode)) {
      return toast.error("Enter a valid 6-digit pincode");
    }

    if (!isAuthenticated) return toast.error("Please login to place an order");

    setLoading(true);
    try {
      const fullAddress = `${address}, ${city}, ${state} - ${pincode}`;
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          totalAmount: totalPrice,
          shippingAddress: fullAddress,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        clearCart();
        toast.success("Order placed! Opening WhatsApp...");
        // Auto-open WhatsApp with full order details
        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
        setTimeout(() => window.open(waUrl, "_blank", "noopener,noreferrer"), 600);
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to place order");
      }
    } catch {
      toast.error("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-fade-in">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-black text-foreground mb-2">Order Placed!</h2>
        <p className="text-muted-foreground mb-2 text-sm">
          Your order is confirmed. WhatsApp should have opened automatically.
        </p>
        <p className="text-muted-foreground mb-8 text-xs">
          If WhatsApp didn't open,{" "}
          <button
            onClick={() =>
              window.open(
                `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="text-primary underline font-bold"
          >
            click here to send your order
          </button>
          .
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() =>
              window.open(
                `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-black hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-4 h-4" /> Open WhatsApp Again
          </button>
          <a
            href="/my-orders"
            className="inline-flex items-center gap-2 bg-secondary text-foreground px-6 py-3 rounded-xl font-black hover:bg-border transition-colors"
          >
            <Package className="w-4 h-4" /> View My Orders
          </a>
        </div>
      </div>
    );
  }

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div key={key}>
      <label className="text-xs font-black text-muted-foreground uppercase mb-1.5 block tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
      />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-lg animate-fade-in">
      <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">Delivery Details</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Fill in your details — your order will be sent to WhatsApp automatically.
      </p>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-6 shadow-soft space-y-5">
        {/* Contact */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Contact</p>
          <div className="space-y-4">
            {field("Full Name *", "name")}
            {field("Phone Number *", "phone", "tel", "10-digit mobile number")}
            {field("Email (Optional)", "email", "email", "you@example.com")}
          </div>
        </div>

        <div className="border-t border-border/50" />

        {/* Address */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Delivery Address</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-muted-foreground uppercase mb-1.5 block tracking-wider">
                Full Address *
              </label>
              <textarea
                value={form.address}
                placeholder="House no., Street, Area, Landmark..."
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {field("City *", "city", "text", "e.g. Chennai")}
              {field("State *", "state", "text", "e.g. Tamil Nadu")}
            </div>

            {field("Pincode *", "pincode", "text", "6-digit pincode")}
          </div>
        </div>

        <div className="border-t border-border/50" />

        {/* Order Summary */}
        {items.length > 0 && (
          <div className="bg-secondary/50 rounded-2xl p-4 border border-border/50 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Order Summary</p>
            {items.map((i) => (
              <div
                key={`${i.product.id}-${i.ram}-${i.storage}-${i.color}`}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-foreground font-bold truncate max-w-[60%]">
                  {i.product.name}{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    ({i.ram}/{i.storage}/{i.color}) ×{i.quantity}
                  </span>
                </span>
                <span className="font-black text-foreground">₹{(i.price * i.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-border/50 flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Grand Total</span>
              <span className="text-2xl font-black text-primary">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MessageCircle className="w-5 h-5" />
          {loading ? "Placing Order..." : "Confirm & Send to WhatsApp"}
        </button>

        <p className="text-center text-[10px] text-muted-foreground">
          Your order details will be sent directly to our WhatsApp. We'll confirm shortly.
        </p>
      </form>
    </div>
  );
};

export default OrderForm;
