import { useState, useEffect, useRef } from "react";
import { Trash2, Plus, X, Tag, Layers, Pencil, Loader2, Upload } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Category, Brand } from "@/data/products";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// ─── BRAND CARD ───
const BrandCard = ({ brand, categoryName, onEdit, onDelete }: { brand: Brand; categoryName: string; onEdit: () => void; onDelete: () => Promise<void> }) => {
  const [busy, setBusy] = useState(false);
  const [imgSrc, setImgSrc] = useState(brand.image || "");
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (brand.image) { setImgSrc(brand.image); setImgError(false); }
  }, [brand.image]);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    e.target.value = "";
    setBusy(true);
    try {

      const formData = new FormData();
      formData.append("image", file);
      const uploadRes = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!uploadRes.ok) throw new Error((await uploadRes.json()).message);
      const { url } = await uploadRes.json();
      const updateRes = await fetch(`${API_URL}/brands/${brand.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image: url }),
      });
      if (!updateRes.ok) throw new Error("Failed to save logo");
      setImgSrc(url);
      setImgError(false);
      toast.success(`Logo uploaded for ${brand.name}!`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete brand "${brand.name}"?`)) return;
    setBusy(true);
    try {
      await onDelete();
      toast.success(`${brand.name} deleted`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete brand");
    } finally {
      setBusy(false);
    }
  };

  const showLogo = imgSrc && !imgError;

  return (
    <Card className="border-none shadow-sm rounded-lg sm:rounded-3xl p-3 sm:p-5 group hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden flex flex-col items-center">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadFile} />
      <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-lg sm:rounded-xl bg-secondary/50 flex items-center justify-center mb-2 sm:mb-3 overflow-hidden border border-border relative">
        {busy
          ? <Loader2 className="w-6 h-6 text-primary animate-spin" />
          : showLogo
            ? <img src={imgSrc} alt={brand.name} className="w-full h-full object-contain p-2" onError={() => setImgError(true)} />
            : <Tag className="w-6 h-6 text-muted-foreground" />
        }
      </div>
      <h4 className="text-xs sm:text-sm font-black text-[#1a1f36] mb-0.5 truncate">{brand.name}</h4>
      {categoryName && <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">{categoryName}</p>}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-white via-white to-transparent translate-y-full group-hover:translate-y-0 transition-transform flex justify-center gap-1.5">
        <Button variant="outline" size="icon" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }} disabled={busy} title="Upload logo from device"
          className="w-8 h-8 rounded-lg bg-white border-border hover:bg-primary/5">
          <Upload className="w-3 h-3" />
        </Button>
        <Button variant="outline" size="icon" onClick={e => { e.stopPropagation(); onEdit(); }} className="w-8 h-8 rounded-lg bg-white"><Pencil className="w-3 h-3" /></Button>
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={busy} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive bg-white"><Trash2 className="w-3 h-3" /></Button>
      </div>
    </Card>
  );
};

interface CategoriesTabProps {
  pendingAction: string | null;
  onActionHandled: () => void;
}

const CategoriesTab = ({ pendingAction, onActionHandled }: CategoriesTabProps) => {
  const { categories, brands, addCategory, updateCategory, deleteCategory, addBrand, updateBrand, deleteBrand } = useData();
  const { token } = useAuth();

  // Category Form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: "", image: "" });

  // Brand Form
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState({ name: "", category: "", image: "" });

  useEffect(() => {
    if (pendingAction === "add-category") {
      openCategoryForm();
      onActionHandled();
    }
  }, [pendingAction]);

  const openCategoryForm = (cat?: Category) => {
    setEditingCategory(cat || null);
    setCatForm({ name: cat?.name || "", image: cat?.image || "" });
    setShowCategoryForm(true);
  };

  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) return toast.error("Category name required");
    try {
      if (editingCategory) {
        await updateCategory({ ...editingCategory, ...catForm });
        toast.success("Category updated!");
      } else {
        await addCategory({ name: catForm.name.trim(), slug: catForm.name.trim().toLowerCase().replace(/\s+/g, '-'), description: "", image: catForm.image, productCount: 0 });
        toast.success(`Category "${catForm.name}" added!`);
      }
      setShowCategoryForm(false);
    } catch { toast.error("Failed to save category"); }
  };

  const openBrandForm = (brand?: Brand) => {
    setEditingBrand(brand || null);
    setBrandForm({ name: brand?.name || "", category: brand?.category || (categories[0]?.slug || categories[0]?.name.toLowerCase() || ""), image: brand?.image || "" });
    setShowBrandForm(true);
  };

  const handleSaveBrand = async () => {
    if (!brandForm.name.trim()) return toast.error("Brand name required");
    if (!brandForm.category) return toast.error("Category required for this brand");
    try {
      if (editingBrand) {
        await updateBrand({ ...editingBrand, ...brandForm });
        toast.success("Brand updated!");
      } else {
        const created = await addBrand({ name: brandForm.name.trim(), slug: `${brandForm.name.trim().toLowerCase().replace(/\s+/g, '-')}-${brandForm.category}`, category: brandForm.category, description: "", image: brandForm.image, productCount: 0 });
        if (!brandForm.image && created?.id) {
          toast.loading(`Fetching logo for ${brandForm.name}...`, { id: "logo-fetch" });
          try {
      
            await fetch(`${API_URL}/brands/${created.id}/fetch-logo`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(`Brand "${brandForm.name}" added with logo!`, { id: "logo-fetch" });
          } catch {
            toast.success(`Brand "${brandForm.name}" added!`, { id: "logo-fetch" });
          }
        } else {
          toast.success(`Brand "${brandForm.name}" added!`);
        }
      }
      setShowBrandForm(false);
    } catch { toast.error("Failed to save brand"); }
  };

  return (
    <>
      <div className="space-y-8">
        {/* Categories Section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-4 rounded-lg sm:rounded-2xl shadow-sm mb-4">
            <div><h3 className="text-sm sm:text-base font-bold text-[#1a1f36]">Categories</h3><p className="text-[10px] sm:text-xs text-[#7a869a]">Manage product groups</p></div>
            <Button onClick={() => openCategoryForm()} className="gradient-purple rounded-2xl h-8 sm:h-9 px-3 sm:px-5 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider text-white hover:scale-105 transition-transform w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />New Category
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {categories.map(c => (
              <Card key={c.id} className="border-none shadow-sm rounded-lg sm:rounded-3xl p-3 sm:p-5 group hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="w-full h-28 sm:h-40 bg-[#f8f9fc] rounded-xl sm:rounded-2xl mb-3 sm:mb-4 overflow-hidden border border-border flex items-center justify-center relative group-hover:border-primary/20 transition-colors">
                  {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover rounded-xl sm:rounded-2xl transition-transform group-hover:scale-105" /> : <Layers className="w-8 h-8 sm:w-10 sm:h-10 text-[#eaedf3]" />}
                </div>
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Layers className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                  <Badge className="bg-primary/10 text-primary border-none rounded-lg text-[9px] sm:text-[10px]">{brands.filter(b => b.category === (c.slug || c.name.toLowerCase())).length} Brands</Badge>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#1a1f36] mb-1 truncate">{c.name}</h4>
                <div className="flex gap-1.5 sm:gap-2 mt-auto pt-2 sm:pt-3">
                  <Button variant="outline" onClick={() => openCategoryForm(c)} className="flex-1 rounded-xl h-8 sm:h-10 text-[10px] sm:text-[11px] font-bold"><Pencil className="w-3 h-3 mr-1" />Edit</Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCategory(c.id)} className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Brands Section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-4 rounded-lg sm:rounded-2xl shadow-sm mb-4">
            <div><h3 className="text-sm sm:text-base font-bold text-[#1a1f36]">Brands</h3><p className="text-[10px] sm:text-xs text-[#7a869a]">Manage featured product brands</p></div>
            <Button onClick={() => openBrandForm()} className="bg-[#1a1f36] hover:bg-[#2a3047] text-white rounded-2xl h-10 px-4 sm:px-6 font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-transform hover:scale-105 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />New Brand
            </Button>
          </div>
          <div className="space-y-8">
            {categories.map(c => {
              const catBrands = brands.filter(b => b.category === (c.slug || c.name.toLowerCase()));
              if (catBrands.length === 0) return null;
              return (
                <div key={c.id}>
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#7a869a] mb-3 sm:mb-4 flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-primary/40" />{c.name} Brands</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {catBrands.map(b => (
                      <BrandCard key={b.id} brand={b} categoryName={c.name} onEdit={() => openBrandForm(b)} onDelete={() => deleteBrand(b.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CATEGORY MODAL */}
      {showCategoryForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-8 border-b border-[#eaedf3] flex justify-between items-center">
              <h3 className="text-sm sm:text-base font-bold text-[#1a1f36]">{editingCategory ? "Edit Category" : "New Category"}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCategoryForm(false)} className="rounded-full h-8 w-8 sm:h-10 sm:w-10"><X className="w-4 h-4 sm:w-5 sm:h-5" /></Button>
            </div>
            <div className="p-4 sm:p-8 space-y-4">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Name *</label>
                <Input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} className="rounded-2xl h-12" placeholder="Category name" /></div>
              <ImageUpload label="Category Image" value={catForm.image} onChange={url => setCatForm({ ...catForm, image: url })} />
            </div>
            <div className="p-4 sm:p-8 bg-[#f8f9fc] border-t border-[#eaedf3] flex gap-3 sm:gap-4">
              <Button variant="ghost" onClick={() => setShowCategoryForm(false)} className="flex-1 h-11 sm:h-12 rounded-2xl font-black uppercase text-[10px]">Cancel</Button>
              <Button onClick={handleSaveCategory} className="flex-1 h-12 rounded-2xl gradient-purple font-black uppercase text-[10px] text-white">
                {editingCategory ? "Update" : "Add Category"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* BRAND MODAL */}
      {showBrandForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-8 border-b border-[#eaedf3] flex justify-between items-center">
              <h3 className="text-sm sm:text-base font-bold text-[#1a1f36]">{editingBrand ? "Edit Brand" : "New Brand"}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowBrandForm(false)} className="rounded-full h-8 w-8 sm:h-10 sm:w-10"><X className="w-4 h-4 sm:w-5 sm:h-5" /></Button>
            </div>
            <div className="p-4 sm:p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Name *</label>
                <Input value={brandForm.name} onChange={e => setBrandForm({ ...brandForm, name: e.target.value })} className="rounded-2xl h-12" placeholder="e.g. Apple, Samsung, Dell" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Category *</label>
                <div className="relative">
                  <select value={brandForm.category || ""} onChange={e => setBrandForm({ ...brandForm, category: e.target.value })}
                    className="w-full rounded-2xl border-[#eaedf3] h-12 font-bold text-[#1a1f36] text-sm px-4 bg-white border outline-none focus:ring-2 focus:ring-primary/20 appearance-none shadow-sm">
                    <option value="" disabled>Choose Category</option>
                    {categories.map(c => <option key={c.id} value={c.slug || c.name.toLowerCase()}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9] pointer-events-none" />
                </div>
              </div>
              <ImageUpload label="Brand Logo" value={brandForm.image} onChange={url => setBrandForm({ ...brandForm, image: url })} />
            </div>
            <div className="p-4 sm:p-8 bg-[#f8f9fc] border-t border-[#eaedf3] flex gap-3 sm:gap-4">
              <Button variant="ghost" onClick={() => setShowBrandForm(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px]">Cancel</Button>
              <Button onClick={handleSaveBrand} className="flex-1 h-12 rounded-2xl bg-[#1a1f36] hover:bg-[#2a3047] font-black uppercase text-[10px] text-white transition-colors">
                {editingBrand ? "Update" : "Add Brand"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoriesTab;
