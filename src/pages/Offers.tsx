import { Link } from "react-router-dom";
import { Tag, Sparkles, Clock, ArrowRight, Zap } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { useData } from "@/context/DataContext";
import summerSaleImg from "@/assets/summer-sale-bg.png";

const Offers = () => {
  const { offers } = useData();

  // Filter out the popup offer from the display
  const displayOffers = offers.filter(o => o.title !== "__popup__");

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <PageMeta title="Offers & Deals" description="Grab the latest deals and discounts on smartphones, laptops, and accessories at Aaro Systems." />

      {/* Hero Section */}
      <section className="relative h-[220px] sm:h-[300px] md:h-[380px] lg:h-[420px] xl:h-[480px] overflow-hidden">
        <img
          src={displayOffers.find(o => o.active)?.image || summerSaleImg}
          alt="Offers"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
          <div className="w-full section-px">
            <div className="max-w-lg xl:max-w-xl animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 mb-3 sm:mb-5">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Exclusive Deals</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-black text-white mb-2 sm:mb-4 leading-tight">
                Summer <span className="text-primary italic">Spectacular</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/80 max-w-sm">
                Grab the hottest tech at the coolest prices. Limited time offers on your favorite brands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <div className="w-full section-px -mt-6 sm:-mt-10 mb-12 sm:mb-16 relative z-10">
        {displayOffers.length > 0 ? (
          <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {displayOffers.map((offer) => (
              <div
                key={offer.id}
                className={`group rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl ${offer.active
                  ? "bg-white border border-border shadow-sm"
                  : "bg-white/60 border border-border/50 grayscale opacity-70"
                  }`}
              >
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md shrink-0 ${offer.active ? "gradient-offer" : "bg-muted text-muted-foreground"}`}>
                      <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">{offer.title}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{offer.active ? "Ending Soon!" : "Expired"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {offer.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2">{offer.description}</p>
                  )}

                  {/* Discount */}
                  <div className="flex items-baseline gap-2 mb-5">
                    <span className="text-3xl sm:text-4xl font-black text-gradient-offer tracking-tighter">{offer.discount}%</span>
                    <span className="text-sm sm:text-base font-bold text-muted-foreground uppercase tracking-widest">Off</span>
                  </div>

                  {/* Actions */}
                  {offer.active ? (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Link
                        to="/shop"
                        className="group/btn inline-flex items-center justify-center gap-2 gradient-purple text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                      >
                        <span>Grab it Now</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                      {offer.code && (
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary rounded-xl border border-dashed border-primary/30">
                          <span className="text-xs font-mono font-bold text-primary">{offer.code}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button disabled className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-muted text-muted-foreground font-bold text-sm cursor-not-allowed">
                      Expired
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 sm:py-24 text-center bg-white rounded-2xl border border-dashed border-border">
            <Tag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">No offers available</h3>
            <p className="text-sm text-muted-foreground">Check back soon for exciting deals!</p>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Original Products", sub: "100% Genuine" },
            { label: "Free Shipping", sub: "On all orders" },
            { label: "Easy Returns", sub: "30 Days policy" },
            { label: "Secure Payment", sub: "SSL Protected" }
          ].map((item, i) => (
            <div key={i} className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center border border-border shadow-sm">
              <p className="text-xs sm:text-sm font-bold text-foreground">{item.label}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-medium mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Offers;
