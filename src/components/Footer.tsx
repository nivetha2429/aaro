import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { INSTAGRAM_URL } from "@/data/products";

const Footer = () => (
  <footer className="bg-card border-t border-border mt-12">
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg gradient-peach flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <span className="text-lg font-bold text-foreground">TechZone</span>
          </div>
          <p className="text-muted-foreground text-sm">Your one-stop shop for premium phones and laptops at unbeatable prices.</p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">Shop</Link>
            <Link to="/offers" className="text-muted-foreground hover:text-primary transition-colors">Offers</Link>
            <Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors">Cart</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3">Contact</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 XXXXXXXXXX</span>
            <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@techzone.com</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Karur, India</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3">Follow Us</h4>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Instagram className="w-5 h-5" /> @techzone
          </a>
        </div>
      </div>

      <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
        © 2024 TechZone. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
