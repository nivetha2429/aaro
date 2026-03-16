import { MessageCircle, Instagram, ArrowLeft, ExternalLink, Users, Gift, Zap, Bell, Camera, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import PageMeta from "@/components/PageMeta";

const Community = () => {
  const { contactSettings: c } = useData();

  return (
  <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 md:py-10 pb-24 lg:pb-10 animate-fade-in">
    <PageMeta title="Community" description="Join our WhatsApp group for exclusive deals and follow us on Instagram for the latest products and updates." />

    {/* Header */}
    <div className="flex items-center gap-3 mb-8 sm:mb-12">
      <Link to="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors" aria-label="Back to home">
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">Join Our Community</h1>
        <p className="text-xs text-muted-foreground">Stay connected for exclusive deals and updates</p>
      </div>
    </div>

    {/* Two Cards Side by Side */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-10 sm:mb-16">

      {/* WhatsApp Group Card */}
      <div className="glass-card rounded-sm sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 border border-[#25D366]/20 hover:border-[#25D366]/40 shadow-xl hover:shadow-2xl hover:shadow-[#25D366]/10 transition-all duration-500 flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#25D366]/5 rounded-full -mr-24 -mt-24 blur-2xl group-hover:scale-150 transition-transform duration-700" />

        <div className="relative z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl bg-[#25D366] flex items-center justify-center mb-6 shadow-xl shadow-green-500/30 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-foreground mb-3 tracking-tight">Join WhatsApp Group</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Get instant access to exclusive deals, flash sales, new arrivals, and priority support directly on your phone.
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            {[
              { icon: Gift, text: "Exclusive deals & bundle offers" },
              { icon: Zap, text: "Flash sales up to 50% off" },
              { icon: Bell, text: "New arrival notifications" },
              { icon: Users, text: "Community reviews & support" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-3.5 h-3.5 text-[#25D366]" />
                </div>
                <span className="text-xs font-bold text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <a
          href={c.whatsappGroupLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-3 bg-[#25D366] text-white py-3.5 sm:py-4 min-h-[44px] rounded-xl sm:rounded-2xl font-black text-sm hover:opacity-90 hover:-translate-y-1 transition-all shadow-xl shadow-green-500/20 active:scale-[0.98] whatsapp-pulse"
        >
          <MessageCircle className="w-5 h-5" />
          Join Now
          <ExternalLink className="w-4 h-4 opacity-70" />
        </a>
        <p className="text-[10px] text-muted-foreground text-center mt-3 uppercase tracking-wider font-bold">Free to join · No spam · Leave anytime</p>
      </div>

      {/* Instagram Card */}
      <div className="glass-card rounded-sm sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 border border-pink-200/40 hover:border-pink-300/60 shadow-xl hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-orange-500/5 rounded-full -mr-24 -mt-24 blur-2xl group-hover:scale-150 transition-transform duration-700" />

        <div className="relative z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center mb-6 shadow-xl shadow-pink-500/30 group-hover:scale-110 transition-transform">
            <Instagram className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-foreground mb-3 tracking-tight">Follow on Instagram</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Stay updated with the latest products, tech reviews, lifestyle posts, and behind-the-scenes content from AARO.
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            {[
              { icon: Camera, text: "Latest product showcases" },
              { icon: Heart, text: "Tech tips & lifestyle posts" },
              { icon: Zap, text: "Reel reviews & unboxings" },
              { icon: Gift, text: "Instagram-only giveaways" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                  <item.icon className="w-3.5 h-3.5 text-pink-500" />
                </div>
                <span className="text-xs font-bold text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <a
          href={c.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white py-3.5 sm:py-4 min-h-[44px] rounded-xl sm:rounded-2xl font-black text-sm hover:opacity-90 hover:-translate-y-1 transition-all shadow-xl shadow-pink-500/20 active:scale-[0.98]"
        >
          <Instagram className="w-5 h-5" />
          Follow Us
          <ExternalLink className="w-4 h-4 opacity-70" />
        </a>
        <p className="text-[10px] text-muted-foreground text-center mt-3 uppercase tracking-wider font-bold">{c.instagramHandle} · Daily updates</p>
      </div>
    </div>

    {/* Back to Home */}
    <div className="text-center">
      <Link to="/" className="text-sm font-black text-primary hover:underline uppercase tracking-widest inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to AARO Systems
      </Link>
    </div>
  </div>
  );
};

export default Community;
