import { Link } from "react-router-dom";
import { Tag, Sparkles, Clock, ArrowRight, Zap } from "lucide-react";
import { offers } from "@/data/products";
import summerSaleImg from "@/assets/summer-sale-bg.png";

const Offers = () => (
  <div className="min-h-screen bg-animated">
    {/* Hero Section */}
    <section className="relative h-[300px] md:h-[400px] overflow-hidden rounded-b-[3rem] shadow-2xl">
      <img
        src={summerSaleImg}
        alt="Offers"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-6 md:p-16">
        <div className="max-w-xl animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md text-white border border-white/20 mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Exclusive Deals</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 text-glow">
            Summer <span className="text-primary italic">Spectacular</span>
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-sm">
            Grab the hottest tech at the coolest prices. Limited time offers on your favorite brands.
          </p>
        </div>
      </div>
    </section>

    {/* Offers Grid */}
    <div className="container mx-auto px-4 -mt-10 mb-16 relative z-10">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`group rounded-[2rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${offer.active
                ? "glass-card border-2 border-primary/20 p-8"
                : "bg-background/40 backdrop-blur-sm grayscale opacity-70 p-8"
              }`}
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${offer.active ? "gradient-purple animate-pulse" : "bg-muted text-muted-foreground"
                    }`}>
                    <Tag className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{offer.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{offer.active ? "Ending Soon!" : "Expired"}</span>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 line-clamp-2">
                  {offer.description} Explore our curated selection of premium electronics and find the perfect match for your lifestyle.
                </p>

                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-black text-primary tracking-tighter">{offer.discount}%</span>
                  <span className="text-lg font-bold text-muted-foreground uppercase tracking-widest">Off</span>
                </div>

                {offer.active ? (
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 gradient-purple text-primary-foreground px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 group/btn"
                  >
                    Grab it Now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <button disabled className="px-8 py-3.5 rounded-2xl bg-muted text-muted-foreground font-bold cursor-not-allowed">
                    Expired
                  </button>
                )}
              </div>

              {/* Bonus Badge for Large Screens */}
              <div className="hidden lg:flex flex-col justify-center items-center p-6 rounded-3xl bg-primary/5 border border-primary/10">
                <Zap className="w-8 h-8 text-primary mb-2" />
                <span className="text-[10px] font-black uppercase text-primary text-center">Exclusive<br />Bonus</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {[
          { label: "Original Products", sub: "100% Genuine" },
          { label: "Free Shipping", sub: "On all orders" },
          { label: "Easy Returns", sub: "30 Days policy" },
          { label: "Secure Payment", sub: "SSL Protected" }
        ].map((item, i) => (
          <div key={i} className="glass-light p-6 rounded-2xl text-center border border-white/40 shadow-sm">
            <p className="text-sm font-bold text-foreground">{item.label}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-medium">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Offers;
