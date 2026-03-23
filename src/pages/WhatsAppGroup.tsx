import { MessageCircle, Gift, Zap, Bell, Users, Star, ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import PageMeta from "@/components/PageMeta";

const WhatsAppGroup = () => {
  const { contactSettings } = useData();

  return (
    <div className="w-full section-px py-6 sm:py-12 md:py-24 animate-fade-in">
      <PageMeta title="Join WhatsApp Group" description="Join the AARO Groups WhatsApp group for exclusive deals, offers, and new arrivals." />

      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-20 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 text-[#25D366] text-xs font-black uppercase tracking-[0.3em] mb-6 animate-slide-up border border-[#25D366]/20">
          <MessageCircle className="w-4 h-4" /> WhatsApp Community
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-7xl font-black bg-gradient-to-r from-[#25D366] via-[#128C7E] to-[#25D366] bg-clip-text text-transparent mb-6 tracking-tighter animate-shimmer">
          Join Our WhatsApp Group
        </h1>
        <p className="text-sm sm:text-lg md:text-xl text-muted-foreground font-medium animate-slide-up stagger-1 max-w-xl mx-auto">
          Be the first to know about exclusive deals, flash sales, new arrivals, and special offers directly on your phone.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-16">
        {[
          {
            icon: Gift,
            title: "Exclusive Deals",
            desc: "Get access to members-only discounts and bundle offers not available on the website.",
            color: "text-rose-500",
            bg: "bg-rose-50"
          },
          {
            icon: Zap,
            title: "Flash Sales",
            desc: "Be the first to grab limited-time flash sales with up to 50% off on phones and laptops.",
            color: "text-amber-500",
            bg: "bg-amber-50"
          },
          {
            icon: Bell,
            title: "New Arrivals",
            desc: "Get instant notifications when new products are added to our store before anyone else.",
            color: "text-blue-500",
            bg: "bg-blue-50"
          },
          {
            icon: Star,
            title: "Priority Support",
            desc: "Group members get priority customer support and faster responses to queries.",
            color: "text-purple-500",
            bg: "bg-purple-50"
          },
          {
            icon: Users,
            title: "Community Reviews",
            desc: "Read real reviews from other buyers and share your own product experiences.",
            color: "text-green-500",
            bg: "bg-green-50"
          },
          {
            icon: MessageCircle,
            title: "Direct Communication",
            desc: "Chat directly with our team for product inquiries, order tracking, and after-sales support.",
            color: "text-indigo-500",
            bg: "bg-indigo-50"
          }
        ].map((perk, i) => (
          <div
            key={i}
            className={`p-5 sm:p-8 rounded-sm sm:rounded-[2.5rem] bg-white border border-border hover:border-[#25D366]/20 hover:shadow-2xl hover:shadow-[#25D366]/5 transition-all duration-500 group animate-slide-up stagger-${(i % 3) + 1}`}
          >
            <div className={`w-14 h-14 ${perk.bg} rounded-2xl flex items-center justify-center ${perk.color} mb-6 group-hover:scale-110 transition-transform`}>
              <perk.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">{perk.title}</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">{perk.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="glass-morphism rounded-sm sm:rounded-[3rem] p-6 sm:p-12 md:p-24 text-center relative overflow-hidden border border-[#25D366]/20 bg-white/40 mb-12 sm:mb-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#25D366]/10 rounded-full -ml-48 -mt-48 blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#128C7E]/10 rounded-full -mr-48 -mb-48 blur-3xl opacity-50" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-3xl bg-[#25D366] flex items-center justify-center shadow-2xl shadow-green-500/30 animate-elastic">
            <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h2 className="text-xl sm:text-3xl md:text-5xl font-black text-foreground mb-4 sm:mb-6 tracking-tighter">Ready to Join?</h2>
          <p className="text-muted-foreground text-sm sm:text-lg mb-8 sm:mb-10 font-medium max-w-md mx-auto">
            Tap the button below to join our WhatsApp group and start saving on premium tech today.
          </p>
          <a
            href={contactSettings.whatsappGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full font-black text-sm sm:text-lg hover:opacity-90 hover:-translate-y-1 transition-all shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 active:scale-[0.98] click-scale whatsapp-pulse"
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            Join WhatsApp Group
            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 opacity-70" />
          </a>
          <p className="text-[11px] text-muted-foreground mt-6 uppercase font-bold tracking-widest">
            Free to join · No spam · Leave anytime
          </p>
        </div>
      </div>

      {/* Back to Home */}
      <div className="text-center">
        <Link to="/" className="text-sm font-black text-primary hover:underline uppercase tracking-widest flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to AARO Groups
        </Link>
      </div>
    </div>
  );
};

export default WhatsAppGroup;
