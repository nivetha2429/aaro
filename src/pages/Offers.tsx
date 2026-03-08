import { Link } from "react-router-dom";
import { Tag, Sparkles, Clock, ArrowRight, Zap } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { useData } from "@/context/DataContext";
import summerSaleImg from "@/assets/summer-sale-bg.png";

const Offers = () => {
  const { offers } = useData();

  return (
    <div className="min-h-screen bg-animated pb-24 md:pb-0">
      <PageMeta title="Offers & Deals" description="Grab the latest deals and discounts on smartphones, laptops, and accessories at Aaro Systems." />
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden rounded-b-sm sm:rounded-b-[3rem] shadow-2xl">
        <img
          src={offers.find(o => o.active)?.image || summerSaleImg}
          alt="Offers"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent flex items-center p-6 md:p-16">
          <div className="max-w-xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Exclusive Deals</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white mb-4 text-glow">
              Summer <span className="text-primary italic">Spectacular</span>
            </h1>
            <p className="text-sm sm:text-lg text-white/80 mb-8 max-w-sm">
              Grab the hottest tech at the coolest prices. Limited time offers on your favorite brands.
            </p>
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <div className="container mx-auto px-2 sm:px-4 -mt-10 mb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`group rounded-sm sm:rounded-[2rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${offer.active
                ? "glass-card border-2 border-primary/20 p-4 lg:p-8"
                : "bg-background/40 backdrop-blur-sm grayscale opacity-70 p-4 lg:p-8"
                }`}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-sm sm:rounded-2xl flex items-center justify-center shadow-lg ${offer.active ? "gradient-offer animate-pulse" : "bg-muted text-muted-foreground"
                      }`}>
                      <Tag className="w-6 h-6 text-white" />
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
                    {offer.description}
                  </p>

                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-gradient-offer tracking-tighter">{offer.discount}%</span>
                    <span className="text-lg font-bold text-muted-foreground uppercase tracking-widest">Off</span>
                  </div>

                  {offer.active ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        to="/shop"
                        className="group/btn inline-flex items-center justify-between gap-4 gradient-purple text-primary-foreground pl-8 pr-2 py-2 rounded-sm sm:rounded-2xl font-black transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 flex-1 sm:flex-none min-w-[180px]"
                      >
                        <span>Grab it Now</span>
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border-l border-white/30 ml-2">
                          <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-sm sm:rounded-2xl border border-dashed border-primary/30">
                        <span className="text-xs font-mono font-bold text-primary">{offer.code}</span>
                      </div>
                    </div>
                  ) : (
                    <button disabled className="px-8 py-3.5 rounded-sm sm:rounded-2xl bg-muted text-muted-foreground font-bold cursor-not-allowed w-full sm:w-auto">
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
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 px-4">
          {[
            { label: "Original Products", sub: "100% Genuine" },
            { label: "Free Shipping", sub: "On all orders" },
            { label: "Easy Returns", sub: "30 Days policy" },
            { label: "Secure Payment", sub: "SSL Protected" }
          ].map((item, i) => (
            <div key={i} className="glass-light p-4 sm:p-6 rounded-sm sm:rounded-2xl text-center border border-white/40 shadow-sm">
              <p className="text-sm font-bold text-foreground">{item.label}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Offers;
