import { Phone, MessageCircle, MapPin, Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import PageMeta from "@/components/PageMeta";

const Contact = () => {
  const { contactSettings } = useData();
  const branches = contactSettings.branches;

  return (
    <div className="w-full section-px py-4 sm:py-6 pb-24 lg:pb-6 animate-fade-in">
      <PageMeta
        title="Contact Aaro Groups | Mobile Shop Coimbatore | Phone Number Address"
        description="Visit Aaro Groups store in Coimbatore or call us for product enquiries. Phone, WhatsApp & store visit available. Open Monday to Saturday. Best mobile & laptop shop."
        keywords="Aaro Groups contact, Aaro Groups phone number, electronics shop Coimbatore address, phone store near me Coimbatore, mobile shop contact number Coimbatore, laptop shop Coimbatore location"
        canonicalPath="/contact"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Aaro Groups",
          "telephone": "+917094223143",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Coimbatore",
            "addressRegion": "Tamil Nadu",
            "addressCountry": "IN"
          },
          "openingHours": "Mo-Sa 09:00-21:00",
          "sameAs": [
            "https://www.instagram.com/aaro_groups?igsh=MTZvOTcweHVma3UyeA%3D%3D&utm_source=qr",
            "https://wa.me/917094223143"
          ]
        }}
      />

      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors" aria-label="Back to home">
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">Contact Us</h1>
          <p className="text-xs text-muted-foreground">Visit any of our branches or reach out directly</p>
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {branches.map((branch, i) => (
          <div
            key={branch._id || i}
            className="glass-card rounded-sm sm:rounded-3xl p-4 sm:p-5 md:p-6 border border-white/40 shadow-xl shadow-primary/5 flex flex-col hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1"
          >
            <h2 className="text-sm sm:text-base font-black text-foreground mb-4 tracking-tight">{branch.name}</h2>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Address</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{branch.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Phone</p>
                <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors mt-0.5 block">
                  {branch.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 mb-5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Business Hours</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{branch.hours}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{branch.closed}</p>
              </div>
            </div>

            <div className="mt-auto flex gap-2 sm:gap-3">
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

            {branch.mapUrl && (
              <a
                href={branch.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
              >
                <MapPin className="w-3.5 h-3.5" /> View on Google Maps
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contact;
