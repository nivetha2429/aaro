import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { WHATSAPP_NUMBER } from "@/data/products";
import { MessageCircle, CheckCircle, Package, Home, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { orderFormSchema, type OrderFormData } from "@/lib/schemas";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const OrderForm = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(() => sessionStorage.getItem("aaro_order_placed") === "true");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (user) {
      reset((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user, reset]);

  const buildWhatsAppMessage = () => {
    const siteUrl = window.location.origin;

    const productLines = items
      .map((i) => {
        return [
          `  • *${i.product.name}*`,
          `    Brand: ${i.product.brand}`,
          `    ${i.ram} / ${i.storage} / ${i.color}`,
          `    Qty: ${i.quantity} × ₹${i.price.toLocaleString()} = ₹${(i.price * i.quantity).toLocaleString()}`,
          `    ${siteUrl}/product/${i.product.id}`,
        ].join("\n");
      })
      .join("\n\n");

    return [
      `🛒 *New Order — AARO*`,
      ``,
      `👤 *Customer Details:*`,
      `  • Name: ${formValues.name}`,
      `  • Phone: ${formValues.phone}`,
      formValues.email ? `  • Email: ${formValues.email}` : null,
      ``,
      `📦 *Order Items:*`,
      productLines,
      ``,
      `💰 *Grand Total: ₹${totalPrice.toLocaleString()}*`,
      `🚚 Shipping: FREE`,
      ``,
      `📍 *Delivery Address:*`,
      `  ${formValues.address}`,
      `  ${formValues.city}, ${formValues.state} — ${formValues.pincode}`,
      ``,
      `Please confirm the order and share the delivery timeline. Thank you!`,
    ]
      .filter((line) => line !== null)
      .join("\n");
  };

  const onSubmit = async (data: OrderFormData) => {
    if (!isAuthenticated) return toast.error("Please login to place an order");

    setLoading(true);
    try {
      const fullAddress = `${data.address}, ${data.city}, ${data.state} - ${data.pincode}`;
      const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(buildWhatsAppMessage())}`;

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
        sessionStorage.setItem("aaro_order_placed", "true");
        setSubmitted(true);
        clearCart();
        toast.success("Order placed! Opening WhatsApp...");
        setTimeout(() => window.open(waUrl, "_blank", "noopener,noreferrer"), 600);
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to place order");
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
        <div className="relative inline-block mb-4">
          <CheckCircle className="w-20 h-20 mx-auto text-green-500 animate-elastic" />
          <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150 -z-10" />
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tighter animate-slide-up">Order Placed!</h2>
        <p className="text-muted-foreground mb-8 text-sm">
          Your order is confirmed. WhatsApp should have opened automatically.
        </p>
        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(buildWhatsAppMessage())}`, "_blank", "noopener,noreferrer")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-black hover:opacity-90 transition-all whatsapp-pulse click-scale shadow-xl shadow-green-500/20"
            >
              <MessageCircle className="w-5 h-5" /> Open WhatsApp Again
            </button>
            <Link
              to="/my-orders"
              onClick={() => sessionStorage.removeItem("aaro_order_placed")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-secondary text-foreground px-8 py-4 rounded-2xl font-black hover:bg-border transition-all click-scale"
            >
              <Package className="w-5 h-5" /> View My Orders
            </Link>
          </div>

          <Link
            to="/"
            onClick={() => sessionStorage.removeItem("aaro_order_placed")}
            className="inline-flex items-center justify-center gap-3 bg-white/40 backdrop-blur-md border border-primary/20 text-primary px-8 py-4 rounded-2xl font-black hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 click-scale group"
          >
            <Home className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium";

  return (
    <div className="container mx-auto px-4 py-8 pb-32 md:pb-8 max-w-lg animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors" aria-label="Back to home">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Delivery Details</h1>
          <p className="text-xs text-muted-foreground">Fill in your details — your order will be sent to WhatsApp automatically.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, () => toast.error("Please fill all required fields correctly"))} className="bg-card border border-border rounded-3xl p-6 shadow-soft space-y-5">
        {/* Contact */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Contact</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-muted-foreground uppercase mb-1.5 block tracking-wider">Full Name *</label>
              <input {...register("name")} className={inputClass} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-black text-muted-foreground uppercase mb-1.5 block tracking-wider">Phone Number *</label>
              <input type="tel" placeholder="10-digit mobile number" {...register("phone")} className={inputClass} />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="text-xs font-black text-muted-foreground uppercase mb-1.5 block tracking-wider">Email (Optional)</label>
              <input type="email" placeholder="you@example.com" {...register("email")} className={inputClass} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
          </div>
        </div>

        <div className="border-t border-border/50" />

        {/* Address */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Delivery Address</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-muted-foreground uppercase mb-1.5 block tracking-wider">Full Address *</label>
              <textarea
                placeholder="House no., Street, Area, Landmark..."
                {...register("address")}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all font-medium"
              />
              {errors.address && <p className="text-xs text-destructive mt-1">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-muted-foreground uppercase mb-1.5 block tracking-wider">City *</label>
                <input placeholder="e.g. Chennai" {...register("city")} className={inputClass} />
                {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="text-xs font-black text-muted-foreground uppercase mb-1.5 block tracking-wider">State *</label>
                <input placeholder="e.g. Tamil Nadu" {...register("state")} className={inputClass} />
                {errors.state && <p className="text-xs text-destructive mt-1">{errors.state.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-muted-foreground uppercase mb-1.5 block tracking-wider">Pincode *</label>
              <input placeholder="6-digit pincode" {...register("pincode")} className={inputClass} />
              {errors.pincode && <p className="text-xs text-destructive mt-1">{errors.pincode.message}</p>}
            </div>
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
          className="w-full bg-[#25D366] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 hover:opacity-90 hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed click-scale whatsapp-pulse"
        >
          <MessageCircle className="w-6 h-6" />
          {loading ? "Placing Order..." : "Confirm WhatsApp"}
        </button>

        <p className="text-center text-[10px] text-muted-foreground">
          Your order details will be sent directly to our WhatsApp. We'll confirm shortly.
        </p>
      </form>
    </div>
  );
};

export default OrderForm;
