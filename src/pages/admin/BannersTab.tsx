import { useState } from "react";
import { Trash2, Plus, X, Image, Pencil, Monitor, Layout } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Banner } from "@/data/products";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ImageUpload";

const BannersTab = () => {
  const { banners, addBanner, updateBanner, deleteBanner } = useData();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({ image: "", title: "", subtitle: "", link: "/shop", position: "hero" as "hero" | "center" });

  const heroBanners = banners.filter(b => b.position === "hero");
  const centerBanners = banners.filter(b => b.position === "center");

  const openForm = (banner?: Banner) => {
    setEditing(banner || null);
    setForm({
      image: banner?.image || "",
      title: banner?.title || "",
      subtitle: banner?.subtitle || "",
      link: banner?.link || "/shop",
      position: banner?.position || "hero",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.image) return toast.error("Banner image is required");
    try {
      if (editing) {
        await updateBanner({ ...editing, ...form });
        toast.success("Banner updated!");
      } else {
        const maxCount = form.position === "center" ? 1 : 3;
        const existing = banners.filter(b => b.position === form.position).length;
        if (existing >= maxCount) {
          return toast.error(`Maximum ${maxCount} ${form.position} banner(s) allowed. Delete one first.`);
        }
        await addBanner({ ...form, order: existing, active: true });
        toast.success("Banner added!");
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save banner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await deleteBanner(id);
      toast.success("Banner deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await updateBanner({ ...banner, active: !banner.active });
      toast.success(banner.active ? "Banner deactivated" : "Banner activated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const BannerCard = ({ banner }: { banner: Banner }) => (
    <Card className="border-none shadow-sm rounded-lg sm:rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="relative h-32 sm:h-44 md:h-48 bg-[#f8f9fc]">
        {banner.image ? (
          <img src={banner.image} alt={banner.title || "Banner"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Image className="w-8 h-8 sm:w-10 sm:h-10 text-[#eaedf3]" /></div>
        )}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex gap-1">
          <Badge
            className={`text-[8px] sm:text-[9px] font-black cursor-pointer ${banner.active ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-600 border-red-200"}`}
            onClick={() => handleToggleActive(banner)}
          >
            {banner.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>
      <div className="p-2.5 sm:p-4">
        <h4 className="text-[11px] sm:text-sm font-black text-[#1a1f36] truncate">{banner.title || "Untitled Banner"}</h4>
        {banner.subtitle && <p className="text-[9px] sm:text-[10px] text-[#7a869a] truncate mt-0.5">{banner.subtitle}</p>}
        <p className="text-[8px] sm:text-[9px] text-[#a3acb9] mt-1 truncate">Link: {banner.link}</p>
        <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3">
          <Button variant="outline" size="sm" onClick={() => openForm(banner)} className="flex-1 rounded-xl h-7 sm:h-8 text-[9px] sm:text-[10px] font-bold">
            <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />Edit
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)} className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      <div className="space-y-8">
        {/* Hero Banners Section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-4 rounded-lg sm:rounded-2xl shadow-sm mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><Monitor className="w-4 h-4 sm:w-5 sm:h-5" /></div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#1a1f36]">Hero Banners</h3>
                <p className="text-[10px] sm:text-xs text-[#7a869a]">Auto-sliding carousel (max 3)</p>
              </div>
            </div>
            <Button
              onClick={() => { setForm(f => ({ ...f, position: "hero" })); openForm(); }}
              disabled={heroBanners.length >= 3}
              className="gradient-purple rounded-2xl h-8 sm:h-9 px-3 sm:px-5 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider text-white hover:scale-105 transition-transform disabled:opacity-40 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />Add Banner ({heroBanners.length}/3)
            </Button>
          </div>
          {heroBanners.length === 0 ? (
            <Card className="border-none shadow-sm rounded-3xl p-12 text-center">
              <Image className="w-12 h-12 text-[#eaedf3] mx-auto mb-4" />
              <p className="text-sm font-bold text-[#7a869a]">No hero banners added yet</p>
              <p className="text-xs text-[#a3acb9] mt-1">Default banners will be shown on the home page</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {heroBanners.map(b => <BannerCard key={b.id} banner={b} />)}
            </div>
          )}
        </div>

        {/* Center Banner Section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-4 rounded-lg sm:rounded-2xl shadow-sm mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center shrink-0"><Layout className="w-4 h-4 sm:w-5 sm:h-5" /></div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#1a1f36]">Center Page Banner</h3>
                <p className="text-[10px] sm:text-xs text-[#7a869a]">Between categories & brands (max 1)</p>
              </div>
            </div>
            <Button
              onClick={() => { setForm(f => ({ ...f, position: "center" })); openForm(); }}
              disabled={centerBanners.length >= 1}
              className="bg-[#1a1f36] hover:bg-[#2a3047] text-white rounded-2xl h-8 sm:h-9 px-3 sm:px-5 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider transition-transform hover:scale-105 disabled:opacity-40 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />{centerBanners.length >= 1 ? "Max Reached" : "Add Banner"}
            </Button>
          </div>
          {centerBanners.length === 0 ? (
            <Card className="border-none shadow-sm rounded-3xl p-12 text-center">
              <Layout className="w-12 h-12 text-[#eaedf3] mx-auto mb-4" />
              <p className="text-sm font-bold text-[#7a869a]">No center banner added yet</p>
              <p className="text-xs text-[#a3acb9] mt-1">A default banner will be shown on the home page</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {centerBanners.map(b => <BannerCard key={b.id} banner={b} />)}
            </div>
          )}
        </div>
      </div>

      {/* BANNER MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-8 border-b border-[#eaedf3] flex justify-between items-center">
              <h3 className="text-sm sm:text-base font-bold text-[#1a1f36]">{editing ? "Edit Banner" : "New Banner"}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="rounded-full h-8 w-8 sm:h-10 sm:w-10"><X className="w-4 h-4 sm:w-5 sm:h-5" /></Button>
            </div>
            <div className="p-4 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              <ImageUpload label="Banner Image *" value={form.image} onChange={url => setForm({ ...form, image: url })} />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Title</label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="rounded-2xl h-12" placeholder="e.g. Summer Sale" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Subtitle</label>
                <Input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="rounded-2xl h-12" placeholder="e.g. Up to 50% off on all products" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Link</label>
                <Input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="rounded-2xl h-12" placeholder="/shop or /phones" />
              </div>
              {!editing && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Position</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, position: "hero" })}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${form.position === "hero" ? "bg-primary text-white border-primary" : "bg-white text-[#7a869a] border-[#eaedf3] hover:border-primary/30"}`}
                    >
                      Hero Slider
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, position: "center" })}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${form.position === "center" ? "bg-primary text-white border-primary" : "bg-white text-[#7a869a] border-[#eaedf3] hover:border-primary/30"}`}
                    >
                      Center Banner
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 sm:p-8 bg-[#f8f9fc] border-t border-[#eaedf3] flex gap-3 sm:gap-4">
              <Button variant="ghost" onClick={() => setShowForm(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px]">Cancel</Button>
              <Button onClick={handleSave} className="flex-1 h-12 rounded-2xl gradient-purple font-black uppercase text-[10px] text-white">
                {editing ? "Update" : "Add Banner"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BannersTab;
