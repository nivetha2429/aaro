import { X, Tag, Sparkles, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { offers } from "@/data/products";
import { Link } from "react-router-dom";
import summerSaleImg from "@/assets/summer-sale-bg.png";

export const OfferPopup = () => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [copied, setCopied] = useState(false);
  const activeOffer = offers.find((o) => o.active);

  useEffect(() => {
    const hasSeenOffer = sessionStorage.getItem("seenOffer");

    if (activeOffer) {
      if (!hasSeenOffer) {
        const timer = setTimeout(() => {
          setOpen(true);
          sessionStorage.setItem("seenOffer", "true");
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        setMinimized(true);
      }
    }
  }, [activeOffer]);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpen(false);
    setMinimized(true);
  };

  const handleMaximize = () => {
    setMinimized(false);
    setOpen(true);
  };

  const copyCode = () => {
    navigator.clipboard.writeText("SUMMER50");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeOffer) return null;

  return (
    <>
      {/* Main Popup */}
      {open && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-md animate-fade-in"
          onClick={() => handleClose()}
        >
          <div 
            className="bg-card w-full max-w-4xl overflow-hidden rounded-[2rem] shadow-2xl relative animate-scale-in flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => handleClose()} 
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 backdrop-blur-sm text-foreground hover:bg-background/80 transition-all shadow-lg border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Image */}
            <div className="w-full md:w-1/2 h-48 md:h-auto relative overflow-hidden group">
              <img 
                src={summerSaleImg} 
                alt="Summer Sale" 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-primary/30 to-transparent" />
              <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 glass-light p-3 md:p-4 rounded-xl border border-white/30 backdrop-blur-md">
                <p className="text-white font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Limited Time
                </p>
                <p className="text-white text-lg md:text-xl font-black">Ends in 24 Hours!</p>
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center text-center md:text-left bg-gradient-to-br from-background via-background to-primary/5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary self-center md:self-start mb-6 border border-primary/20">
                <Tag className="w-4 h-4" />
                <span className="text-xs font-extrabold uppercase tracking-wider">{activeOffer.title}</span>
              </div>
              
              <h3 className="text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight">
                Get <span className="text-transparent bg-clip-text gradient-purple">50% OFF</span> Everything
              </h3>
              
              <p className="text-muted-foreground text-sm md:text-base mb-8 max-w-sm mx-auto md:mx-0">
                {activeOffer.description} Upgrade your tech game today with our premium summer collection.
              </p>

              {/* Promo Code Section */}
              <div className="mb-8 p-4 rounded-2xl bg-secondary/50 border border-dashed border-primary/30 relative">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 tracking-tighter">Use code at checkout</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-mono font-black tracking-widest text-primary">SUMMER50</span>
                  <button 
                    onClick={copyCode}
                    className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    {copied ? (
                      <><Check className="w-4 h-4 text-green-500" /> Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy Code</>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/shop" 
                  onClick={() => handleClose()} 
                  className="flex-1 gradient-purple text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] text-center"
                >
                  Shop the Sale
                </Link>
              </div>
              
              <p className="mt-6 text-[10px] text-muted-foreground italic">
                *T&C apply. Valid on all phones and laptops. Limited stock available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Icon */}
      {minimized && !open && (
        <button
          onClick={handleMaximize}
          className="fixed bottom-6 left-6 z-50 w-16 h-16 rounded-3xl gradient-purple flex items-center justify-center shadow-2xl hover:scale-110 hover:-rotate-6 transition-all animate-fade-in group"
        >
          <div className="relative">
            <Tag className="w-7 h-7 text-primary-foreground" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white text-[10px] font-bold text-primary items-center justify-center">!</span>
            </span>
          </div>
          <div className="absolute left-full ml-4 px-4 py-2 bg-white rounded-xl shadow-xl opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap border border-primary/10">
            <p className="text-sm font-black text-primary">Don't miss out! 🔥</p>
          </div>
        </button>
      )}
    </>
  );
};
