import { X, Tag, ArrowRight, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Link } from "react-router-dom";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ── Template definitions ──────────────────────────────────────────────────────
const TEMPLATES: Record<string, {
  bg: string;
  accent: string;
  emoji: string;
  heading: string;
  sub: string;
  pill: string;
}> = {
  T1: {
    bg: "from-orange-500 via-red-500 to-rose-600",
    accent: "bg-white/20",
    emoji: "⚡",
    heading: "Flash Sale!",
    sub: "Lightning deals — grab yours before they're gone",
    pill: "Hot Deal",
  },
  T2: {
    bg: "from-violet-600 via-purple-600 to-indigo-700",
    accent: "bg-white/20",
    emoji: "🎉",
    heading: "Weekend Deals!",
    sub: "Special prices every weekend — don't miss out",
    pill: "Weekend Special",
  },
  T3: {
    bg: "from-slate-700 via-slate-800 to-slate-900",
    accent: "bg-white/15",
    emoji: "👑",
    heading: "Premium Offer",
    sub: "Exclusive deals curated for you — limited units",
    pill: "Members Only",
  },
  T4: {
    bg: "from-emerald-500 via-teal-500 to-cyan-600",
    accent: "bg-white/20",
    emoji: "🌟",
    heading: "Festival Sale!",
    sub: "Celebrate with unbeatable prices on all devices",
    pill: "Festival Savings",
  },
};

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
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 7, hours: 0, minutes: 0, seconds: 0 });

  // The popup offer is identified by title === "__popup__" and active === true
  const popupOffer = offers.find(o => o.title === "__popup__" && o.active)
    ?? offers.find(o => o.active); // fallback to any active offer

  const templateId = popupOffer?.code || "T1";
  const tpl = TEMPLATES[templateId] || TEMPLATES.T1;

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!popupOffer) return;

    const getEnd = () => {
      if (popupOffer.description) {
        const d = new Date(popupOffer.description);
        if (!isNaN(d.getTime())) return d;
      }
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d;
    };

    const end = getEnd();
    const tick = () => {
      const diff = end.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [popupOffer?.description]);

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
            {/* Template gradient body */}
            <div className={`bg-gradient-to-br ${tpl.bg} p-8 md:p-10 relative overflow-hidden`}>
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
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${tpl.accent} border border-white/20 mb-5`}>
                <Tag className="w-3 h-3 text-white/80" />
                <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">{tpl.pill}</span>
              </div>

              {/* Emoji + heading */}
              <div className="mb-2">
                <span className="text-5xl">{tpl.emoji}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">{tpl.heading}</h2>
              <p className="text-white/70 text-sm mb-8 max-w-xs">{tpl.sub}</p>

              {/* Countdown */}
              <div className="mb-8">
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock className="w-3.5 h-3.5 text-white/60" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Offer ends in</span>
                </div>
                <div className="flex items-center gap-2">
                  <Box value={timeLeft.days} label="Days" />
                  <span className="text-white/40 font-black text-xl pb-4">:</span>
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
          className={`fixed bottom-6 left-6 z-50 bg-gradient-to-br ${tpl.bg} text-white px-4 py-3 rounded-full shadow-xl flex items-center gap-2 hover:scale-105 transition-all animate-fade-in group border border-white/20`}
        >
          <span className="text-base">{tpl.emoji}</span>
          <span className="text-xs font-black">{tpl.pill}</span>
          <span className="flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
        </button>
      )}
    </>
  );
};
