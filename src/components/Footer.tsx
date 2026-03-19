import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useData } from "@/context/DataContext";

const Footer = () => {
  const { contactSettings: c } = useData();
  return (
    <footer className="bg-background border-t border-border mt-0 pb-20 lg:pb-10">
      <div className="w-full section-px pt-4 sm:pt-6 pb-16 lg:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-fluid">

          {/* Logo & Description */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-0">
              {c.logoUrl ? (
                <img src={c.logoUrl} alt="AARO Systems" className="block object-contain" style={{ height: 'clamp(120px, 18vw, 170px)', maxWidth: 'clamp(360px, 45vw, 540px)' }} />
              ) : (
                <span className="text-xl font-black tracking-tight text-foreground">AARO<span className="text-primary italic">Systems</span></span>
              )}
            </div>
            <p className="text-muted-foreground text-fluid-xs leading-relaxed max-w-xs mx-auto md:mx-0">Your one-stop shop for premium phones and laptops at unbeatable prices.</p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="font-black mb-3 sm:mb-5 uppercase text-fluid-xs tracking-[0.2em] text-primary">Quick Links</h4>
            <div className="flex flex-col gap-1.5 sm:gap-2.5 text-fluid-sm font-bold">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-all">Home</Link>
              <Link to="/phones" className="text-muted-foreground hover:text-primary transition-all">Phones</Link>
              <Link to="/laptops" className="text-muted-foreground hover:text-primary transition-all">Laptops</Link>
              <Link to="/brands" className="text-muted-foreground hover:text-primary transition-all">Brands</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-all">Contact</Link>
            </div>
          </div>

          {/* Contact Us */}
          <div className="text-center md:text-left">
            <h4 className="font-black mb-3 sm:mb-5 uppercase text-fluid-xs tracking-[0.2em] text-primary">Contact Us</h4>
            <div className="flex flex-col items-center md:items-start gap-2.5 sm:gap-3 text-fluid-sm text-muted-foreground font-medium">
              <span className="inline-flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-primary/60 shrink-0" /> {c.phone}</span>
              <span className="inline-flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-primary/60 shrink-0" /><span className="text-xs sm:text-sm break-words">{c.email}</span></span>
              <span className="inline-flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary/60 shrink-0" /> {c.address}</span>
            </div>
          </div>

          {/* Connect */}
          <div className="text-center md:text-left">
            <h4 className="font-black mb-3 sm:mb-5 uppercase text-fluid-xs tracking-[0.2em] text-primary">Connect</h4>
            <div className="flex flex-col items-center md:items-start gap-2.5 sm:gap-3">
              <a href={c.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-fluid-sm text-muted-foreground hover:text-primary transition-all group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                  <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="font-bold">{c.instagramHandle}</span>
              </a>
              <a href={`https://wa.me/${c.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-fluid-sm text-muted-foreground hover:text-primary transition-all group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <span className="font-bold">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border section-mt pt-4 sm:pt-6 md:pt-8 text-center text-fluid-xs font-bold uppercase tracking-widest text-muted-foreground/60">
          &copy; 2026 AARO SYSTEMS. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
