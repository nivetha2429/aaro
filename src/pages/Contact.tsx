import { Phone, MessageCircle, MapPin, Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { WHATSAPP_NUMBER } from "@/data/products";
import PageMeta from "@/components/PageMeta";

const BRANCHES = [
  {
    name: "AARO Systems — Karur Main",
    address: "123, Jawahar Bazaar, Near Bus Stand, Karur, Tamil Nadu 639001",
    phone: "+91 86680 54205",
    whatsapp: "918668054205",
    hours: "Mon – Sat: 10:00 AM – 8:00 PM",
    closed: "Sunday: Closed",
    mapUrl: "https://maps.google.com/?q=Karur+Bus+Stand+Tamil+Nadu",
  },
  {
    name: "AARO Systems — Karur Branch 2",
    address: "45, Kovai Road, Thanthonimalai, Karur, Tamil Nadu 639002",
    phone: "+91 70104 52495",
    whatsapp: "917010452495",
    hours: "Mon – Sat: 10:00 AM – 8:00 PM",
    closed: "Sunday: Closed",
    mapUrl: "https://maps.google.com/?q=Thanthonimalai+Karur+Tamil+Nadu",
  },
  {
    name: "AARO Systems — Karur Branch 3",
    address: "78, Pallapatti Main Road, Karur, Tamil Nadu 639003",
    phone: "+91 86680 54205",
    whatsapp: "918668054205",
    hours: "Mon – Sat: 10:00 AM – 9:00 PM",
    closed: "Sunday: Closed",
    mapUrl: "https://maps.google.com/?q=Pallapatti+Karur+Tamil+Nadu",
  },
];

const Contact = () => (
  <div className="container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 pb-24 lg:pb-6 animate-fade-in">
    <PageMeta title="Contact Us" description="Visit or call any of our 3 branches in Karur. Get in touch with Aaro Systems for product inquiries and support." />

    <div className="flex items-center gap-3 mb-6">
      <Link to="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors" aria-label="Back to home">
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">Contact Us</h1>
        <p className="text-xs text-muted-foreground">Visit any of our branches or reach out directly</p>
      </div>
    </div>

    {/* Branch Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {BRANCHES.map((branch, i) => (
        <div
          key={i}
          className="glass-card rounded-sm sm:rounded-3xl p-5 sm:p-6 border border-white/40 shadow-xl shadow-primary/5 flex flex-col hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1"
        >
          {/* Branch Name */}
          <h2 className="text-sm sm:text-base font-black text-foreground mb-4 tracking-tight">{branch.name}</h2>

          {/* Address */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Address</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{branch.address}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Phone</p>
              <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="text-[11px] text-muted-foreground hover:text-primary transition-colors mt-0.5 block">
                {branch.phone}
              </a>
            </div>
          </div>

          {/* Business Hours */}
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Business Hours</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{branch.hours}</p>
              <p className="text-[11px] text-muted-foreground">{branch.closed}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex gap-2">
            <a
              href={`tel:${branch.phone.replace(/\s/g, "")}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-xl bg-primary text-white text-xs font-black hover:opacity-90 transition-all active:scale-[0.98] shadow-md shadow-primary/20"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
            <a
              href={`https://wa.me/${branch.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-xl bg-[#25D366] text-white text-xs font-black hover:opacity-90 transition-all active:scale-[0.98] shadow-md shadow-green-500/20"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>

          {/* Google Maps Link */}
          <a
            href={branch.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
          >
            <MapPin className="w-3.5 h-3.5" /> View on Google Maps
          </a>
        </div>
      ))}
    </div>
  </div>
);

export default Contact;
