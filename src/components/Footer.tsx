import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { INSTAGRAM_URL, WHATSAPP_NUMBER } from "@/data/products";
import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="bg-background border-t border-border mt-1 md:mt-4 pb-20 md:pb-10">
    <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 pb-16 md:pb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 text-center lg:text-left">
        <div>
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-3 sm:mb-6">
            <img src={logo} alt="AARO Logo" className="h-10 sm:h-16 w-auto object-contain" />
          </div>
          <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed max-w-xs mx-auto lg:mx-0">Your one-stop shop for premium phones and laptops at unbeatable prices.</p>
        </div>

        <div>
          <h4 className="font-black text-foreground mb-3 sm:mb-6 uppercase text-[10px] sm:text-xs tracking-[0.2em] text-primary">Quick Links</h4>
          <div className="grid grid-cols-2 gap-x-1 gap-y-1.5 sm:gap-x-2 sm:gap-y-3 text-[11px] sm:text-sm font-bold justify-items-center lg:justify-items-start">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-all">Home</Link>
            <Link to="/phones" className="text-muted-foreground hover:text-primary transition-all">Phones</Link>
            <Link to="/laptops" className="text-muted-foreground hover:text-primary transition-all">Laptops</Link>
            <Link to="/brands" className="text-muted-foreground hover:text-primary transition-all">Brands</Link>
            <Link to="/cart" className="text-muted-foreground hover:text-primary transition-all">Cart</Link>
          </div>
        </div>

        <div>
          <h4 className="font-black text-foreground mb-3 sm:mb-6 uppercase text-[10px] sm:text-xs tracking-[0.2em] text-primary">Contact Us</h4>
          <div className="flex flex-col items-center lg:items-start gap-2 sm:gap-4 text-[11px] sm:text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-2 sm:gap-3"><Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/60 shrink-0" /> +91 XXXXXXXXXX</span>
            <span className="flex items-center gap-2 sm:gap-3"><Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/60 shrink-0" /> support@aarosystems.com</span>
            <span className="flex items-center gap-2 sm:gap-3"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/60 shrink-0" /> Karur, India</span>
          </div>
        </div>

        <div>
          <h4 className="font-black text-foreground mb-3 sm:mb-6 uppercase text-[10px] sm:text-xs tracking-[0.2em] text-primary">Connect</h4>
          <div className="flex flex-col items-center lg:items-start gap-2 sm:gap-4">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 sm:gap-3 text-[11px] sm:text-sm text-muted-foreground hover:text-primary transition-all group">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="font-bold">@aarosystems</span>
            </a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 sm:gap-3 text-[11px] sm:text-sm text-muted-foreground hover:text-primary transition-all group">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
              </div>
              <span className="font-bold">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-5 sm:mt-10 pt-4 sm:pt-8 text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
        © 2024 AARO SYSTEMS. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
