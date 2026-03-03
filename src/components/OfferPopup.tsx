import { X, Tag, ArrowRight, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Link } from "react-router-dom";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

// ── Countdown box ─────────────────────────────────────────────────────────────
const Box = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center shadow-inner">
      <span className="text-xl font-black text-white tabular-nums">{String(value).padStart(2, "0")}</span>
    </div>
    <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{label}</span>
  </div>
);

export const OfferPopup = () => {
  const { offers } = useData();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 24, minutes: 0, seconds: 0 });

  // The popup offer is identified by title === "__popup__" and active === true
  const popupOffer = offers.find(o => o.title === "__popup__" && o.active);

  // heading is stored in description, sub-text in tag, countdown end ISO in code
  const heading = popupOffer?.description || "Exclusive Offer!";
  const sub = popupOffer?.tag || "Limited time deals on phones & laptops";

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!popupOffer) return;

    const getEnd = () => {
      if (popupOffer.code) {
        const d = new Date(popupOffer.code);
        if (!isNaN(d.getTime())) return d;
      }
      // fallback: 24h from now
      const d = new Date();
      d.setHours(d.getHours() + 24);
      return d;
    };

    const end = getEnd();
    const tick = () => {
      const diff = end.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [popupOffer?.code]);

  // ── Auto-show logic ───────────────────────────────────────────────────────
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
  }, [popupOffer]);

  const close = (e?: React.MouseEvent) => { e?.stopPropagation(); setOpen(false); setMinimized(true); };
  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false); setMinimized(false);
    sessionStorage.setItem("dismissedOffer", "true");
  };

  if (!popupOffer || sessionStorage.getItem("dismissedOffer") === "true") return null;

  return (
    <>
      {/* ── Main popup ── */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={close}
        >
          <div
            className="w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl relative animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Fixed purple gradient body */}
            <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 md:p-10 relative overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full bg-white/5" />

              {/* Close */}
              <button
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
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">{heading}</h2>
              <p className="text-white/70 text-sm mb-8 max-w-xs">{sub}</p>

              {/* Countdown */}
              <div className="mb-8">
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock className="w-3.5 h-3.5 text-white/60" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Offer ends in</span>
                </div>
                <div className="flex items-center gap-2">
                  <Box value={timeLeft.hours} label="Hrs" />
                  <span className="text-white/40 font-black text-xl pb-4">:</span>
                  <Box value={timeLeft.minutes} label="Min" />
                  <span className="text-white/40 font-black text-xl pb-4">:</span>
                  <Box value={timeLeft.seconds} label="Sec" />
                </div>
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
                <button onClick={dismiss} className="text-white/50 hover:text-white/80 text-xs font-bold transition-colors whitespace-nowrap">
                  Don't show
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Minimized pill ── */}
      {minimized && !open && (
        <button
          onClick={() => { setMinimized(false); setOpen(true); }}
          className="fixed bottom-6 left-6 z-50 bg-gradient-to-br from-violet-600 to-purple-700 text-white px-4 py-3 rounded-full shadow-xl flex items-center gap-2 hover:scale-105 transition-all animate-fade-in group border border-white/20"
        >
          <Tag className="w-4 h-4" />
          <span className="text-xs font-black">Special Offer</span>
          <span className="flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
        </button>
      )}
    </>
  );
};
