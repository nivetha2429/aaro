import { X, Tag, ArrowRight, Clock, Gift } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useData } from "@/context/DataContext";
import { Link } from "react-router-dom";

// ── Countdown box ──────────────────────────────────────────────────────────────
const Box = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/50 border border-white/50 backdrop-blur-sm flex items-center justify-center shadow-soft">
      <span className="text-base sm:text-xl font-black text-primary tabular-nums">{String(value).padStart(2, "0")}</span>
    </div>
    <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
  </div>
);

const Colon = () => (
  <span className="text-primary/30 font-black text-xl pb-4 select-none">:</span>
);

// ── Compute remaining time from end Date ───────────────────────────────────────
function calcTimeLeft(end: Date) {
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    expired: false,
  };
}

export const OfferPopup = () => {
  const { offers } = useData();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 24, minutes: 0, seconds: 0, expired: false });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const popupOffer = offers.find(o => o.title === "__popup__" && o.active);
  const heading = popupOffer?.description || "Exclusive Offer!";
  const sub = popupOffer?.tag || "Limited time deals on phones & laptops";

  // ── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!popupOffer?.code) return;

    const end = new Date(popupOffer.code);
    if (isNaN(end.getTime())) return;

    const tick = () => {
      if (!isMountedRef.current) return;
      const tl = calcTimeLeft(end);
      setTimeLeft(tl);
      if (tl.expired) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [popupOffer?.code]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // ── Auto-show logic ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!popupOffer) return;
    if (!sessionStorage.getItem("seenOffer")) {
      const t = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("seenOffer", "true");
      }, 1500);
      return () => clearTimeout(t);
    }
    setMinimized(true);
  }, [!!popupOffer]);

  const close = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpen(false);
    setMinimized(true);
  };

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    setMinimized(false);
    sessionStorage.setItem("dismissedOffer", "true");
  };

  if (!popupOffer || sessionStorage.getItem("dismissedOffer") === "true") return null;

  const showDays = timeLeft.days > 0;

  return (
    <>
      {/* ── Full popup box — top of page ── */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="offer-heading"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in"
          onClick={close}
        >
          <div
            className="w-full max-w-sm sm:max-w-lg rounded-[2rem] overflow-hidden shadow-2xl relative animate-scale-in border border-white/50"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white/60 backdrop-blur-xl p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-primary/10" />
              <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full bg-accent/10" />

              {/* Close */}
              <button
                aria-label="Close offer"
                onClick={close}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/50 hover:bg-white/80 text-foreground transition-all shadow-soft"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-5">
                <Tag className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Special Offer</span>
              </div>

              {/* Heading + sub */}
              <h2 id="offer-heading" className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight mb-2">{heading}</h2>
              <p className="text-muted-foreground text-xs sm:text-sm mb-6 sm:mb-8 max-w-xs">{sub}</p>

              {/* Countdown */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {timeLeft.expired ? "Offer has ended" : "Offer ends in"}
                  </span>
                </div>
                {timeLeft.expired ? (
                  <p className="text-muted-foreground text-sm font-bold">This offer has expired.</p>
                ) : (
                  <div className="flex items-center gap-2">
                    {showDays && (
                      <>
                        <Box value={timeLeft.days} label="Days" />
                        <Colon />
                      </>
                    )}
                    <Box value={timeLeft.hours} label="Hrs" />
                    <Colon />
                    <Box value={timeLeft.minutes} label="Min" />
                    <Colon />
                    <Box value={timeLeft.seconds} label="Sec" />
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-4">
                <Link
                  to="/shop"
                  onClick={close}
                  className="group flex-1 inline-flex items-center justify-between bg-white/50 backdrop-blur-sm border border-white/50 text-foreground pl-6 pr-2 py-2 rounded-full font-black text-sm shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                >
                  <span>Shop Now</span>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center ml-3">
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
                <button
                  onClick={dismiss}
                  className="text-muted-foreground hover:text-foreground text-xs font-bold transition-colors whitespace-nowrap"
                >
                  Don't show
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Minimized icon — above WhatsApp button (bottom-right) ── */}
      {minimized && !open && (
        <div className="fixed bottom-[9.5rem] lg:bottom-[6rem] right-4 z-50 flex flex-col items-center gap-2 animate-fade-in">
          {/* Close/dismiss button */}
          <button
            aria-label="Dismiss offer"
            onClick={dismiss}
            className="w-5 h-5 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 text-foreground flex items-center justify-center hover:bg-white/80 transition-colors shadow-soft"
          >
            <X className="w-3 h-3" />
          </button>
          {/* Offer icon */}
          <button
            aria-label="Open special offer"
            onClick={() => { setMinimized(false); setOpen(true); }}
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/60 backdrop-blur-xl text-primary shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-2 border-white/50 hover:shadow-primary/20"
          >
            <Gift className="w-6 h-6" />
            <span className="absolute flex h-3 w-3 -top-0.5 -right-0.5">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
            </span>
          </button>
        </div>
      )}
    </>
  );
};
