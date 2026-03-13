import { useState, Fragment } from "react";
import { Tag, Pencil, Plus, Loader2, Clock } from "lucide-react";
import { useData } from "@/context/DataContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const OffersTab = () => {
  const { offers, addOffer, updateOffer } = useData();

  // Popup Form
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [popupForm, setPopupForm] = useState({ heading: "", sub: "", hours: 24 });
  const [savingPopup, setSavingPopup] = useState(false);

  const handleSavePopupOffer = async () => {
    const heading = popupForm.heading.trim();
    const sub = popupForm.sub.trim();
    const hours = Math.max(1, Math.min(720, Number(popupForm.hours) || 24));
    if (!heading) { toast.error("Heading text is required"); return; }
    setSavingPopup(true);
    try {
      const end = new Date();
      end.setHours(end.getHours() + hours);
      const existing = offers.find(o => o.title === "__popup__");
      const payload = {
        title: "__popup__",
        image: "",
        active: true,
        description: heading,
        tag: sub,
        code: end.toISOString(),
        discount: 0,
      };
      if (existing) {
        await updateOffer({ id: existing.id, ...payload } as any);
      } else {
        await addOffer(payload);
      }
      sessionStorage.removeItem("seenOffer");
      sessionStorage.removeItem("dismissedOffer");
      toast.success(`Popup saved! Countdown set to ${hours} hour${hours !== 1 ? "s" : ""}.`);
      setShowPopupForm(false);
    } catch (e: any) {
      if (e?.message !== "__SESSION_EXPIRED__") {
        toast.error(e?.message || "Failed to save popup");
      }
    } finally {
      setSavingPopup(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* POPUP OFFER SECTION */}
      <div className="bg-white rounded-lg sm:rounded-3xl shadow-sm overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-[#eaedf3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1a1f36]">Popup Offer</h3>
            <p className="text-[10px] sm:text-xs text-[#7a869a]">Edit heading, sub-text &amp; countdown duration</p>
          </div>
          <Button
            onClick={() => {
              const existing = offers.find(o => o.title === "__popup__");
              let savedHours = 24;
              if (existing?.code) {
                const diff = new Date(existing.code).getTime() - Date.now();
                if (diff > 0) savedHours = Math.round(diff / 3600000);
              }
              setPopupForm({ heading: existing?.description || "", sub: existing?.tag || "", hours: savedHours });
              setShowPopupForm(!showPopupForm);
            }}
            className="gradient-purple rounded-2xl h-11 px-6 font-black uppercase text-[10px] tracking-widest text-white"
          >
            {offers.find(o => o.title === "__popup__") ? <><Pencil className="w-3.5 h-3.5 mr-2" />Edit Popup</> : <><Plus className="w-4 h-4 mr-2" />Set Popup</>}
          </Button>
        </div>

        {/* Current popup preview */}
        {!showPopupForm && (
          <div className="p-6">
            {(() => {
              const popup = offers.find(o => o.title === "__popup__");
              return popup ? (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-full sm:w-64 h-28 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex flex-col items-center justify-center flex-shrink-0 shadow-md px-4 text-center">
                    <p className="text-white font-black text-sm leading-tight">{popup.description || "Popup Heading"}</p>
                    <p className="text-white/70 text-[10px] mt-1">{popup.tag || "Sub-text here"}</p>
                    <p className="text-white/50 text-[9px] mt-2 font-bold">⏱ 24-hr countdown</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">LIVE</span>
                      <span className="text-xs text-[#7a869a] font-bold">Popup active</span>
                    </div>
                    <p className="text-xs text-[#7a869a]">Heading: <span className="font-bold text-[#1a1f36]">{popup.description}</span></p>
                    {popup.tag && <p className="text-xs text-[#7a869a] mt-0.5">Sub-text: <span className="font-bold text-[#1a1f36]">{popup.tag}</span></p>}
                    <p className="text-xs text-[#7a869a] mt-0.5">Countdown ends: <span className="font-bold text-[#1a1f36]">{popup.code ? new Date(popup.code).toLocaleString() : "—"}</span></p>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center bg-[#f8f9fc] rounded-2xl border-2 border-dashed border-[#eaedf3]">
                  <Tag className="w-10 h-10 text-[#eaedf3] mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#7a869a]">No popup set</p>
                  <p className="text-xs text-[#a3acb9] mt-1">Click "Set Popup" to configure the popup offer</p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Popup form */}
        {showPopupForm && (
          <div className="p-6 space-y-5 bg-[#f8f9fc] border-t border-[#eaedf3] animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest mb-2 block">Heading *</label>
                  <input value={popupForm.heading} onChange={e => { const v = e.target.value; setPopupForm(prev => ({ ...prev, heading: v })); }}
                    placeholder="e.g. Exclusive Offer!" className="w-full h-11 px-4 rounded-2xl border border-[#eaedf3] bg-white text-sm font-bold text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  {!popupForm.heading.trim() && <p className="text-[10px] text-red-400 mt-1 font-semibold">Required</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest mb-2 block">Sub-text <span className="normal-case font-medium text-[#b0b8c9]">(optional)</span></label>
                  <input value={popupForm.sub} onChange={e => { const v = e.target.value; setPopupForm(prev => ({ ...prev, sub: v })); }}
                    placeholder="e.g. Limited time deals on phones & laptops" className="w-full h-11 px-4 rounded-2xl border border-[#eaedf3] bg-white text-sm text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest mb-2 block">Countdown Duration <span className="normal-case font-medium text-[#b0b8c9]">(hours)</span></label>
                  <div className="flex items-center gap-3">
                    <input type="number" min={1} max={720} value={popupForm.hours}
                      onChange={e => { const v = Math.max(1, Math.min(720, Number(e.target.value) || 24)); setPopupForm(prev => ({ ...prev, hours: v })); }}
                      className="w-28 h-11 px-4 rounded-2xl border border-[#eaedf3] bg-white text-sm font-bold text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-primary/30 text-center" />
                    <span className="text-xs text-[#7a869a] font-semibold">hours from now  •  max 720 (30 days)</span>
                  </div>
                </div>
              </div>

              {/* Live preview */}
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest mb-3 block">Preview</label>
                <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-5 shadow-xl relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                  <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />
                  <p className="text-white font-black text-lg mb-1 relative">{popupForm.heading || "Your Heading Here"}</p>
                  <p className="text-white/70 text-[10px] mb-4 relative">{popupForm.sub || "Sub-text goes here"}</p>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3 h-3 text-white/60" />
                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Offer ends in</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const h = popupForm.hours;
                      const boxes = h >= 24
                        ? [{ v: String(Math.floor(h / 24)).padStart(2, "0"), l: "Days" }, { v: String(h % 24).padStart(2, "0"), l: "Hrs" }, { v: "00", l: "Min" }]
                        : [{ v: String(h).padStart(2, "0"), l: "Hrs" }, { v: "00", l: "Min" }, { v: "00", l: "Sec" }];
                      return boxes.map((b, i) => (
                        <Fragment key={i}>
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="w-9 h-9 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
                              <span className="text-sm font-black text-white tabular-nums">{b.v}</span>
                            </div>
                            <span className="text-[8px] font-bold text-white/60 uppercase">{b.l}</span>
                          </div>
                          {i < 2 && <span className="text-white/40 font-black text-base pb-3">:</span>}
                        </Fragment>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowPopupForm(false)} disabled={savingPopup} className="flex-1 h-11 rounded-2xl font-black uppercase text-[10px]">Cancel</Button>
              <Button onClick={handleSavePopupOffer} disabled={savingPopup || !popupForm.heading.trim()}
                className="flex-1 h-11 rounded-2xl gradient-purple font-black uppercase text-[10px] text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {savingPopup ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Saving…</> : "Save Popup"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersTab;
