import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { INSTAGRAM_URL, WHATSAPP_NUMBER } from "@/data/products";
import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="bg-background border-t border-border mt-1 md:mt-4 pb-20 md:pb-10">
    <div className="container mx-auto px-4 py-8 pb-16 md:pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <img src={logo} alt="AARO Logo" className="h-16 sm:h-20 w-auto object-contain" />
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">Your one-stop shop for premium phones and laptops at unbeatable prices. Experience the power of AARO Systems.</p>
        </div>

        <div>
          <h4 className="font-black text-foreground mb-6 uppercase text-[10px] tracking-[0.2em] text-primary">Quick Links</h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-sm font-bold">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1">Home</Link>
            <Link to="/phones" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1">Phones</Link>
            <Link to="/laptops" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1">Laptops</Link>
            <Link to="/brands" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1">Brands</Link>
            <Link to="/offers" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1">Offers</Link>
            <Link to="/cart" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1">Cart</Link>
          </div>
        </div>

        <div>
          <h4 className="font-black text-foreground mb-6 uppercase text-[10px] tracking-[0.2em] text-primary">Contact Us</h4>
          <div className="flex flex-col gap-4 text-xs sm:text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary/60" /> +91 XXXXXXXXXX</span>
            <span className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary/60" /> support@aarosystems.com</span>
            <span className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary/60" /> Karur, India</span>
          </div>
        </div>

        <div>
          <h4 className="font-black text-foreground mb-6 uppercase text-[10px] tracking-[0.2em] text-primary">Connect</h4>
          <div className="flex flex-col gap-4">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-all group">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Instagram className="w-4 h-4" />
              </div>
              <span className="font-bold">@aarosystems</span>
            </a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-all group">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <MessageCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-bold">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-10 pt-8 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
        © 2024 AARO SYSTEMS. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
