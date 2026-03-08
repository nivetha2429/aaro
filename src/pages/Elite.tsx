import { Award, Shield, Zap, Star, Smartphone, Crown, Gem, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Elite = () => {
    return (
        <div className="container mx-auto px-4 py-12 md:py-24 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center mb-20 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.3em] mb-6 animate-slide-up">
                    <Crown className="w-4 h-4" /> AARO Elite Member
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-7xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6 tracking-tighter animate-shimmer">
                    Elevate Your Tech Experience
                </h1>
                <p className="text-sm sm:text-lg md:text-xl text-muted-foreground font-medium animate-slide-up stagger-1">
                    Join the inner circle of AARO and enjoy exclusive perks, early access, and premium support for your digital lifestyle.
                </p>
            </div>

            {/* Perks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-16 sm:mb-24">
                {[
                    {
                        icon: Zap,
                        title: "Early Access",
                        desc: "Be the first to know and purchase new iPhone and MacBook releases before they hit the general store.",
                        color: "text-blue-500",
                        bg: "bg-blue-50"
                    },
                    {
                        icon: Shield,
                        title: "Extended Warranty",
                        desc: "Every purchase comes with an additional 6 months of AARO Care warranty for total peace of mind.",
                        color: "text-green-500",
                        bg: "bg-green-50"
                    },
                    {
                        icon: Star,
                        title: "Exclusive Offers",
                        desc: "Unlock hidden discounts and exclusive bundles that are only visible to our Elite members.",
                        color: "text-amber-500",
                        bg: "bg-amber-50"
                    },
                    {
                        icon: Clock,
                        title: "Priority Support",
                        desc: "Your queries and after-sales service requests move to the front of the line with our dedicated team.",
                        color: "text-purple-500",
                        bg: "bg-purple-50"
                    },
                    {
                        icon: Gem,
                        title: "Premium Unboxing",
                        desc: "Elite orders are shipped with special limited-edition packaging and exclusive AARO system accessories.",
                        color: "text-rose-500",
                        bg: "bg-rose-50"
                    },
                    {
                        icon: Award,
                        title: "Loyalty Points",
                        desc: "Earn 2x points on every purchase which can be redeemed for future tech upgrades or accessories.",
                        color: "text-indigo-500",
                        bg: "bg-indigo-50"
                    }
                ].map((perk, i) => (
                    <div
                        key={i}
                        className={`p-5 sm:p-8 rounded-sm sm:rounded-[2.5rem] bg-white border border-border hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group animate-slide-up stagger-${(i % 3) + 1}`}
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
            <div className="glass-morphism rounded-sm sm:rounded-[3rem] p-6 sm:p-12 md:p-24 text-center relative overflow-hidden border border-primary/20 bg-white/40 mb-20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full -ml-48 -mt-48 blur-3xl opacity-50" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full -mr-48 -mb-48 blur-3xl opacity-50" />

                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-xl sm:text-3xl md:text-5xl font-black text-foreground mb-6 tracking-tighter">Ready to Become Elite?</h2>
                    <p className="text-muted-foreground text-sm sm:text-lg mb-8 sm:mb-10 font-medium">
                        Sign up for our newsletter to join the waitlist for the AARO Elite program. No hidden fees, just pure tech excellence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-[2] bg-white border border-border px-8 py-5 rounded-full outline-none focus:ring-2 focus:ring-primary/30 transition-all text-foreground"
                        />
                        <button className="flex-1 bg-gradient-to-r from-primary to-accent text-white px-10 py-5 rounded-full font-black hover:opacity-90 hover:-translate-y-1 transition-all shadow-xl shadow-primary/20">
                            Join Waitlist
                        </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground px-4 sm:px-12 mt-6 uppercase font-bold tracking-widest leading-loose">
                        By joining, you agree to receive promotional updates. You can unsubscribe at any time.
                    </p>
                </div>
            </div>

            {/* Back to Home */}
            <div className="text-center">
                <Link to="/" className="text-sm font-black text-primary hover:underline uppercase tracking-widest flex items-center justify-center gap-2">
                    &larr; Back to AARO Systems
                </Link>
            </div>
        </div>
    );
};

export default Elite;
