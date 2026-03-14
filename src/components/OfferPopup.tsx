import { X, Tag, ArrowRight, Clock, Gift } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useData } from "@/context/DataContext";
import { Link } from "react-router-dom";

// ── Countdown box ──────────────────────────────────────────────────────────────
const Box = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center shadow-inner">
      <span className="text-xl font-black text-white tabular-nums">{String(value).padStart(2, "0")}</span>
    </div>
    <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{label}</span>
  </div>
);

const Colon = () => (
  <span className="text-white/40 font-black text-xl pb-4 select-none">:</span>
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={close}
        >
          <div
            className="w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl relative animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 md:p-10 relative overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full bg-white/5" />

              {/* Close */}
              <button
                aria-label="Close offer"
                onClick={close}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/20 mb-5">
                <Tag className="w-3 h-3 text-white/80" />
                <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">Special Offer</span>
              </div>

              {/* Heading + sub */}
              <h2 id="offer-heading" className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">{heading}</h2>
              <p className="text-white/70 text-sm mb-8 max-w-xs">{sub}</p>

              {/* Countdown */}
              <div className="mb-8">
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock className="w-3.5 h-3.5 text-white/60" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    {timeLeft.expired ? "Offer has ended" : "Offer ends in"}
                  </span>
                </div>
                {timeLeft.expired ? (
                  <p className="text-white/50 text-sm font-bold">This offer has expired.</p>
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
                  className="group flex-1 inline-flex items-center justify-between bg-white text-gray-900 pl-6 pr-2 py-2 rounded-full font-black text-sm hover:bg-white/90 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Shop Now</span>
                  <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center ml-3">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
                <button
                  onClick={dismiss}
                  className="text-white/50 hover:text-white/80 text-xs font-bold transition-colors whitespace-nowrap"
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
        <div className="fixed bottom-[5.5rem] md:bottom-[6rem] right-4 z-50 flex flex-col items-center gap-2 animate-fade-in">
          {/* Close/dismiss button */}
          <button
            aria-label="Dismiss offer"
            onClick={dismiss}
            className="w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
          {/* Offer icon */}
          <button
            aria-label="Open special offer"
            onClick={() => { setMinimized(false); setOpen(true); }}
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-all border-2 border-white/40 hover:shadow-purple-500/30"
          >
            <Gift className="w-6 h-6" />
            <span className="absolute flex h-3 w-3 -top-0.5 -right-0.5">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
            </span>
          </button>
        </div>
      )}
    </>
  );
};
