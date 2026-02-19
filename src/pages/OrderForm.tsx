import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { WHATSAPP_NUMBER } from "@/data/products";
import { MessageCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const OrderForm = () => {
  const { items, totalPrice, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "", email: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error("Please fill in required fields."); return; }
    setSubmitted(true);
    toast.success("Order placed successfully!");
    clearCart();
  };

  const whatsappMsg = `Order from ${form.name}\nPhone: ${form.phone}\nAddress: ${form.address}\n\nProducts:\n${items.map((i) => `${i.product.name} x${i.quantity} - $${i.product.price * i.quantity}`).join("\n")}\n\nTotal: $${totalPrice}`;
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMsg)}`;

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-fade-in">
        <CheckCircle className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Order Placed!</h2>
        <p className="text-muted-foreground mb-4">We'll get back to you soon.</p>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[hsl(142,70%,45%)] text-primary-foreground px-6 py-2.5 rounded-lg font-medium">
          <MessageCircle className="w-4 h-4" /> Also send via WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <h1 className="text-3xl font-bold text-foreground mb-6">Order Details</h1>
      <form onSubmit={handleSubmit} className="bg-card rounded-lg p-6 shadow-card space-y-4">
        {[
          { label: "Name *", key: "name", type: "text" },
          { label: "Phone *", key: "phone", type: "tel" },
          { label: "Email", key: "email", type: "email" },
        ].map((f) => (
          <div key={f.key}>
            <label className="text-sm font-medium text-foreground mb-1 block">{f.label}</label>
            <input
              type={f.type}
              value={form[f.key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        ))}
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Address</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {items.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-sm text-muted-foreground mb-1">Items: {items.length}</p>
            <p className="font-bold text-foreground">Total: ${totalPrice}</p>
          </div>
        )}

        <button type="submit" className="w-full gradient-peach text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Submit Order
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
