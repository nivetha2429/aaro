import { X, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { offers } from "@/data/products";
import { Link } from "react-router-dom";

export const OfferPopup = () => {
  const [open, setOpen] = useState(false);
  const activeOffer = offers.find((o) => o.active);

  useEffect(() => {
    if (activeOffer) {
      const timer = setTimeout(() => setOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeOffer]);

  if (!activeOffer || !open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-lg p-6 max-w-sm mx-4 shadow-soft relative">
        <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full gradient-peach mx-auto flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">{activeOffer.title}</h3>
          <p className="text-3xl font-extrabold text-primary mb-4">{activeOffer.discount}% OFF</p>
          <Link to="/shop" onClick={() => setOpen(false)} className="inline-block gradient-peach text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export const FloatingOfferIcon = () => {
  const [dismissed, setDismissed] = useState(false);
  const activeOffer = offers.find((o) => o.active);
  const [popupShown, setPopupShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPopupShown(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!activeOffer || !popupShown || !dismissed) return null;

  return (
    <Link to="/offers" className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full gradient-peach flex items-center justify-center shadow-soft hover:scale-110 transition-transform">
      <Tag className="w-5 h-5 text-primary-foreground" />
    </Link>
  );
};
