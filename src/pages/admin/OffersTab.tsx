import { useState, useEffect, Fragment } from "react";
import { Trash2, Plus, X, Tag, Pencil, Loader2, Clock } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Offer } from "@/data/products";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ImageUpload";

interface OffersTabProps {
  pendingAction: string | null;
  onActionHandled: () => void;
}

const OffersTab = ({ pendingAction, onActionHandled }: OffersTabProps) => {
  const { offers, addOffer, updateOffer, deleteOffer } = useData();

  // Offer Banner Form
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerForm, setOfferForm] = useState({ title: "", image: "", active: false, tag: "" });

  // Popup Form
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [popupForm, setPopupForm] = useState({ heading: "", sub: "", hours: 24 });
  const [savingPopup, setSavingPopup] = useState(false);

  useEffect(() => {
    if (pendingAction === "add-offer") {
      openOfferForm();
      onActionHandled();
    }
  }, [pendingAction]);

  const openOfferForm = (offer?: Offer) => {
    setEditingOffer(offer || null);
    setOfferForm({
      title: offer?.title || "",
      image: offer?.image || "",
      active: offer?.active || false,
      tag: offer?.tag || "",
    });
    setShowOfferForm(true);
  };

  const handleSaveOffer = async () => {
    if (!offerForm.image) return toast.error("Please upload an offer banner image");
    try {
      if (editingOffer) {
        await updateOffer({ ...editingOffer, title: offerForm.title || "Offer", image: offerForm.image, active: offerForm.active, tag: offerForm.tag, description: editingOffer.description || "", discount: editingOffer.discount || 0, code: editingOffer.code || "" });
        toast.success("Offer updated!");
      } else {
        await addOffer({ title: offerForm.title || "Offer", image: offerForm.image, active: offerForm.active, tag: offerForm.tag, description: "", discount: 0, code: "" });
        toast.success("Offer created!");
      }
      setShowOfferForm(false);
    } catch (e: any) {
      if (e?.message !== "__SESSION_EXPIRED__") toast.error("Failed to save offer");
    }
  };

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

  const bannerOffers = offers.filter(o => o.title !== "__popup__");
  const bannerCount = bannerOffers.length;
  const atLimit = bannerCount >= 3;

  return (
    <>
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

        {/* OFFER BANNERS SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-4 rounded-lg sm:rounded-2xl shadow-sm">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1a1f36]">Offer Banners</h3>
            <p className="text-[10px] sm:text-xs text-[#7a869a]">
              JPG / PNG / WEBP only, max 2MB each
              <span className={`ml-2 font-bold ${atLimit ? "text-red-500" : "text-primary"}`}>({bannerCount}/3 used)</span>
            </p>
            {atLimit && <p className="text-[10px] text-red-500 font-bold mt-0.5">Delete a banner below to upload a new one</p>}
          </div>
          {!atLimit && (
            <Button onClick={() => openOfferForm()} className="bg-[#1a1f36] hover:bg-[#2a3047] text-white rounded-2xl h-10 sm:h-11 px-4 sm:px-6 font-black uppercase text-[9px] sm:text-[10px] tracking-widest w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />Upload Banner
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {bannerOffers.map(offer => (
            <Card key={offer.id} className={`border-none shadow-sm rounded-lg sm:rounded-3xl overflow-hidden transition-all hover:shadow-lg ${offer.active ? "ring-2 ring-primary/30" : ""}`}>
              <div className="w-full h-28 sm:h-36 bg-[#f8f9fc] border-b border-[#eaedf3] overflow-hidden relative">
                {offer.image ? <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Tag className="w-6 h-6 sm:w-8 sm:h-8 text-[#eaedf3]" /></div>}
                {offer.active && <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-green-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">ACTIVE</div>}
                {offer.tag && <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-primary text-white text-[8px] sm:text-[9px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full tracking-wider">{offer.tag}</div>}
              </div>
              <div className="p-2.5 sm:p-4">
                <p className="font-black text-[#1a1f36] text-[11px] sm:text-sm mb-2 sm:mb-3 truncate">{offer.title || "Untitled Banner"}</p>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openOfferForm(offer)} className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl hover:bg-primary/10 hover:text-primary"><Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteOffer(offer.id)} className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></Button>
                </div>
              </div>
            </Card>
          ))}
          {bannerOffers.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-[#eaedf3]">
              <Tag className="w-12 h-12 text-[#eaedf3] mx-auto mb-4" />
              <p className="text-sm font-bold text-[#1a1f36] mb-1">No offer banners yet</p>
              <p className="text-xs text-[#7a869a]">Upload a banner image to show offers to visitors.</p>
            </div>
          )}
        </div>
      </div>

      {/* OFFER MODAL */}
      {showOfferForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-8 border-b border-[#eaedf3] flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[#1a1f36]">{editingOffer ? "Edit Banner" : "Upload Banner"}</h3>
                <p className="text-xs text-[#a3acb9] mt-1">Upload an offer banner image</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowOfferForm(false)} className="rounded-full h-10 w-10"><X className="w-5 h-5" /></Button>
            </div>
            <div className="p-4 sm:p-8 space-y-4 sm:space-y-5">
              <ImageUpload label="Banner Image * (JPG / PNG / WEBP, max 2MB)" value={offerForm.image}
                onChange={url => setOfferForm(prev => ({ ...prev, image: url }))} accept=".jpg,.jpeg,.png,.webp" maxSizeMB={2} />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Label (for admin reference)</label>
                <Input value={offerForm.title} onChange={e => { const v = e.target.value; setOfferForm(prev => ({ ...prev, title: v })); }} className="rounded-2xl h-12" placeholder="e.g. Summer Sale Banner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Offer Tag <span className="text-[#b0b8c9] normal-case font-medium">(short badge shown on banner)</span></label>
                <div className="relative">
                  <Input value={offerForm.tag} onChange={e => { const v = e.target.value.toUpperCase().slice(0, 20); setOfferForm(prev => ({ ...prev, tag: v })); }}
                    className="rounded-2xl h-12 pr-16" placeholder="e.g. FLASH SALE" />
                  {offerForm.tag && <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full">{offerForm.tag}</span>}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-[#f8f9fc] border border-[#eaedf3] hover:border-primary/30 transition-colors">
                <input type="checkbox" checked={offerForm.active} onChange={e => { const v = e.target.checked; setOfferForm(prev => ({ ...prev, active: v })); }} className="w-5 h-5 accent-primary" />
                <div>
                  <span className="text-sm font-bold text-[#1a1f36] block">Set as Active</span>
                  <span className="text-[10px] text-[#7a869a]">Show this banner in the Offers section</span>
                </div>
              </label>
            </div>
            <div className="p-4 sm:p-8 bg-[#f8f9fc] border-t border-[#eaedf3] flex gap-3 sm:gap-4">
              <Button variant="ghost" onClick={() => setShowOfferForm(false)} className="flex-1 h-11 sm:h-12 rounded-2xl font-black uppercase text-[10px]">Cancel</Button>
              <Button onClick={handleSaveOffer} className="flex-1 h-12 rounded-2xl gradient-purple font-black uppercase text-[10px] text-white shadow-lg">
                {editingOffer ? "Update" : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OffersTab;
