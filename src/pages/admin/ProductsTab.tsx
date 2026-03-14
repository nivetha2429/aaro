import { useState, useEffect, useMemo, Fragment } from "react";
import { Trash2, Plus, X, Package, BarChart3, Smartphone, Laptop, Headphones, ChevronDown, Layers, Search, Pencil, Loader2, Star, MessageSquare } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Product, Variant, Review } from "@/data/products";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MultiImageUpload, VideoUpload } from "@/components/ImageUpload";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const PHONE_SPECS = ["os", "ramSize", "battery", "displaySize", "camera"];
const LAPTOP_SPECS = ["screenSize", "color", "hardDiskSize", "cpuModel", "ramSize", "os", "specialFeature", "graphicsCard"];
const ACCESSORY_SPECS = ["color", "battery", "specialFeature"];
const SPEC_LABEL: Record<string, string> = {
  screenSize: "Screen Size", color: "Colour", hardDiskSize: "Hard Disk Size",
  cpuModel: "CPU Model", ramSize: "RAM Memory Installed Size", os: "Operating System",
  specialFeature: "Special Feature", graphicsCard: "Graphics Card Description",
  battery: "Battery Capacity", displaySize: "Display Size", camera: "Camera Details"
};
const emptySpecs = () => ({
  screenSize: "", color: "", hardDiskSize: "", cpuModel: "",
  ramSize: "", os: "", specialFeature: "", graphicsCard: "",
  battery: "", displaySize: "", camera: ""
});

interface ProductsTabProps {
  pendingAction: string | null;
  onActionHandled: () => void;
}

const ProductsTab = ({ pendingAction, onActionHandled }: ProductsTabProps) => {
  const { products, categories, brands, offers, addProduct, updateProduct, deleteProduct, fetchModelsByCategory, fetchVariants, fetchReviews, addReview, updateReview, deleteReview } = useData();

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({ category: "phone", rating: 4.5, featured: false, features: [], images: [], condition: "new" });
  const [specsData, setSpecsData] = useState<any>(emptySpecs());
  const [featuresInput, setFeaturesInput] = useState("");
  const [imagesInput, setImagesInput] = useState<string[]>([]);
  const [currentVariants, setCurrentVariants] = useState<Partial<Variant>[]>([]);
  const [filteredModels, setFilteredModels] = useState<any[]>([]);

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [inventorySearch, setInventorySearch] = useState("");
  const [phonePage, setPhonePage] = useState(1);
  const [laptopPage, setLaptopPage] = useState(1);
  const [accessoryPage, setAccessoryPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  // Review state
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewForm, setEditReviewForm] = useState({ rating: 5, comment: "" });

  const toggleExpand = (id: string) => setExpandedProducts(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Handle pending action from Overview quick actions
  useEffect(() => {
    if (pendingAction === "add") {
      handleOpenProductModal();
      onActionHandled();
    }
  }, [pendingAction]);

  const handleOpenProductModal = async (product?: Product) => {
    setEditingProduct(product || null);
    const initialData = product || { category: "phone", rating: 4.5, featured: false, features: [], images: [] };
    setFormData(initialData);
    setSpecsData(product?.specifications ? { ...emptySpecs(), ...product.specifications } : emptySpecs());
    setFeaturesInput(product?.features?.join(", ") || "");
    setImagesInput(product?.images?.slice(0, 4) || []);

    if (product?._id || (product as any)?.id) {
      const pid = product._id || (product as any).id;
      const vars = await fetchVariants(pid);
      setCurrentVariants(vars);
      // Fetch reviews for this product
      setLoadingReviews(true);
      const revs = await fetchReviews(pid);
      setProductReviews(revs);
      setLoadingReviews(false);
    } else {
      setCurrentVariants([{ ram: "", storage: "", color: "", price: 0, originalPrice: 0, stock: 0, isAvailable: true }]);
      setProductReviews([]);
    }
    setReviewForm({ rating: 5, comment: "" });

    if (initialData.category) {
      const models = await fetchModelsByCategory(initialData.category);
      setFilteredModels(models);
    } else {
      setFilteredModels([]);
    }

    setShowProductForm(true);
  };

  const handleAddVariant = () => {
    setCurrentVariants([...currentVariants, { ram: "", storage: "", color: "", price: 0, originalPrice: 0, stock: 0, isAvailable: true, condition: "new" as const }]);
  };

  const handleRemoveVariant = (index: number) => {
    setCurrentVariants(currentVariants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const updated = [...currentVariants];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentVariants(updated);
  };

  const handleVariantBlur = (index: number, field: "ram" | "storage") => {
    const updated = [...currentVariants];
    const val = updated[index][field];
    if (val && /^\d+$/.test(val as string)) {
      updated[index] = { ...updated[index], [field]: val + "GB" };
      setCurrentVariants(updated);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setFormData(prev => ({ ...prev, category: cat, name: "", brand: "" }));
    setSpecsData(emptySpecs());
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.brand || !formData.description)
      return toast.error("Please fill Name, Brand and Description");
    if (currentVariants.length === 0)
      return toast.error("Please add at least one variant");
    const invalidVariant = currentVariants.find(v => !v.ram || !v.storage || !v.color || !v.price);
    if (invalidVariant)
      return toast.error("All variants must have RAM, Storage, Color and Price");

    try {
      const payload: any = {
        ...formData,
        specifications: specsData as any,
        features: featuresInput.split(",").map(f => f.trim()).filter(Boolean),
        images: imagesInput.filter(Boolean),
        variants: currentVariants
      };
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...payload } as Product);
        toast.success("Product and variants updated!");
      } else {
        await addProduct(payload);
        toast.success("Product added with variants!");
      }
      setShowProductForm(false);
    } catch { toast.error("Failed to save product"); }
  };

  const groupedProducts = useMemo(() => {
    const g: Record<string, Product[]> = {};
    const search = inventorySearch.toLowerCase();
    products.forEach(p => {
      const c = p.category || "General";
      if (filterCategory !== "all" && c !== filterCategory) return;
      if (search && !p.name.toLowerCase().includes(search) && !p.brand.toLowerCase().includes(search)) return;
      if (!g[c]) g[c] = [];
      g[c].push(p);
    });
    return g;
  }, [products, filterCategory, inventorySearch]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-4 rounded-lg sm:rounded-2xl shadow-sm">
          <div><h3 className="text-sm sm:text-base font-bold text-[#1a1f36]">Inventory</h3><p className="text-[10px] sm:text-xs text-[#7a869a]">{products.length} products total</p></div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9]" />
              <input
                type="text"
                value={inventorySearch}
                onChange={e => { setInventorySearch(e.target.value); setPhonePage(1); setLaptopPage(1); setAccessoryPage(1); }}
                placeholder="Search products..."
                className="h-11 pl-9 pr-4 rounded-2xl border border-[#eaedf3] bg-[#f8f9fc] text-sm font-bold text-[#1a1f36] outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-52"
              />
            </div>
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-11 pl-4 pr-9 rounded-2xl border border-[#eaedf3] bg-[#f8f9fc] text-sm font-bold text-[#1a1f36] outline-none focus:ring-2 focus:ring-primary/20 appearance-none shadow-sm cursor-pointer"
              >
                <option value="all">All</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug || c.name.toLowerCase()}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9] pointer-events-none" />
            </div>
            <Button onClick={() => handleOpenProductModal()} className="gradient-dark rounded-xl h-8 sm:h-9 px-3 sm:px-5 font-bold uppercase text-[10px] tracking-wider text-white shadow-lg shrink-0">
              <Plus className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Add Product</span>
            </Button>
          </div>
        </div>

        {Object.entries(groupedProducts).map(([catName, catProducts]) => {
          const isPhone = catName.toLowerCase().includes("phone") || catName.toLowerCase().includes("mobile");
          const isAccessory = catName.toLowerCase().includes("accessory") || catName.toLowerCase().includes("accessories");
          const page = isPhone ? phonePage : isAccessory ? accessoryPage : laptopPage;
          const setPage = isPhone ? setPhonePage : isAccessory ? setAccessoryPage : setLaptopPage;
          const totalPages = Math.ceil(catProducts.length / ITEMS_PER_PAGE);
          const paginatedProducts = catProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
          return (
            <Card key={catName} className="border-none shadow-sm rounded-lg sm:rounded-3xl overflow-hidden">
              <div className={`px-3 sm:px-6 py-3 border-b flex items-center justify-between ${isPhone ? "bg-blue-50 border-blue-100" : isAccessory ? "bg-amber-50 border-amber-100" : "bg-violet-50 border-violet-100"}`}>
                <div className="flex items-center gap-2">
                  {isPhone ? <Smartphone className="w-4 h-4 text-blue-500" /> : isAccessory ? <Headphones className="w-4 h-4 text-amber-500" /> : <Laptop className="w-4 h-4 text-violet-500" />}
                  <span className={`text-xs font-black uppercase tracking-wider ${isPhone ? "text-blue-600" : isAccessory ? "text-amber-600" : "text-violet-600"}`}>{catName}</span>
                  <Badge variant="secondary" className={`h-5 px-2 text-[9px] rounded-full ${isPhone ? "bg-blue-100 text-blue-600 border-none" : isAccessory ? "bg-amber-100 text-amber-600 border-none" : "bg-violet-100 text-violet-600 border-none"}`}>{catProducts.length}</Badge>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7a869a]">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 rounded-lg bg-white border border-[#eaedf3] flex items-center justify-center disabled:opacity-40 hover:border-primary/30 transition-colors">&lsaquo;</button>
                    <span>{page}/{totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-7 h-7 rounded-lg bg-white border border-[#eaedf3] flex items-center justify-center disabled:opacity-40 hover:border-primary/30 transition-colors">&rsaquo;</button>
                  </div>
                )}
              </div>

              {/* Mobile + Tablet Card List (< xl) */}
              <div className="xl:hidden divide-y divide-[#eaedf3]">
                {paginatedProducts.map(p => {
                  const isExpanded = expandedProducts.has(p.id || (p as any)._id);
                  const pid = p.id || (p as any)._id;
                  const variants = p.variants && p.variants.length > 0 ? p.variants : [];
                  return (
                    <div key={pid}>
                      <div className="flex items-center gap-3 p-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-[#eaedf3] shadow-sm flex items-center justify-center p-1 overflow-hidden shrink-0">
                          {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" /> : <Package className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <p className="flex-1 font-bold text-sm text-[#1a1f36] line-clamp-2 min-w-0">{p.name}</p>
                        <button
                          onClick={() => toggleExpand(pid)}
                          className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all border ${isExpanded ? "bg-primary/10 text-primary border-primary/20" : "bg-[#f4f7fa] text-[#4f566b] border-[#eaedf3] hover:border-primary/30"}`}
                        >
                          {isExpanded ? "Close" : "View"}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="px-3 pb-4 space-y-2 bg-[#fafbfd] border-t border-[#eaedf3]">
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-1.5">
                              {(() => { const b = brands.find(br => br.name === p.brand); return b?.image ? <img src={b.image} alt={b.name} className="w-5 h-5 object-contain rounded shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : null; })()}
                              <p className="text-[10px] font-black text-[#a3acb9] uppercase tracking-widest">{p.brand}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenProductModal(p)} className="h-7 w-7 rounded-xl hover:bg-primary/10 hover:text-primary"><Pencil className="w-3 h-3" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteProduct(pid)} className="h-7 w-7 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
                            </div>
                          </div>
                          {variants.length === 0 ? (
                            <p className="text-xs text-[#a3acb9] italic text-center py-2">No variants added</p>
                          ) : (
                            <div className="space-y-1.5">
                              {/* Variant header */}
                              <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 px-3 py-1">
                                <span className="text-[9px] font-black text-[#a3acb9] uppercase tracking-widest">RAM</span>
                                <span className="text-[9px] font-black text-[#a3acb9] uppercase tracking-widest">Storage</span>
                                <span className="text-[9px] font-black text-[#a3acb9] uppercase tracking-widest">Color</span>
                                <span className="text-[9px] font-black text-[#a3acb9] uppercase tracking-widest text-right">Price</span>
                                <span className="text-[9px] font-black text-[#a3acb9] uppercase tracking-widest text-right">Stock</span>
                              </div>
                              {variants.map((v, vi) => (
                                <div key={vi} className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 items-center bg-white border border-[#eaedf3] rounded-xl px-3 py-2">
                                  <span className="text-[10px] font-black text-[#7a869a] bg-[#f4f7fa] px-2 py-0.5 rounded-lg text-center truncate">{v.ram}</span>
                                  <span className="text-[10px] font-black text-[#7a869a] bg-[#f4f7fa] px-2 py-0.5 rounded-lg text-center truncate">{v.storage}</span>
                                  <span className="text-[10px] font-black text-[#7a869a] bg-[#f4f7fa] px-2 py-0.5 rounded-lg text-center truncate">{v.color}</span>
                                  <span className="text-xs font-black text-[#1a1f36] text-right whitespace-nowrap">₹{v.price?.toLocaleString()}</span>
                                  {(v.stock ?? 0) > 0
                                    ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-100 text-[10px] font-black px-2 py-0.5 rounded-lg justify-end"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />{v.stock}</span>
                                    : <span className="inline-flex items-center gap-1 bg-red-50 text-red-500 border border-red-100 text-[10px] font-black px-2 py-0.5 rounded-lg justify-end"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Out</span>
                                  }
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table (xl+) */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full text-left md:min-w-0 border-collapse">
                  <thead className="bg-white text-[10px] font-black uppercase text-[#a3acb9] tracking-widest border-b border-[#eaedf3]">
                    <tr className="h-10 sm:h-12">
                      <th className="px-3 sm:px-6">Product</th>
                      <th className="px-3 sm:px-6">Brand</th>
                      <th className="px-3 sm:px-5">RAM</th>
                      <th className="px-3 sm:px-5">Storage</th>
                      <th className="px-3 sm:px-5">Color</th>
                      <th className="px-3 sm:px-5">Price</th>
                      <th className="px-3 sm:px-5">Stock</th>
                      <th className="px-3 sm:px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map(p => {
                      const variants = p.variants && p.variants.length > 0 ? p.variants : [];
                      const rows = variants.length > 0 ? variants : [null];
                      return (
                        <Fragment key={p.id}>
                          {rows.map((v, vi) => (
                            <tr key={vi} className={`hover:bg-[#f8f9fc] transition-colors ${vi < rows.length - 1 ? "border-b border-dashed border-[#f0f2f7]" : "border-b border-[#eaedf3]"}`}>
                              {vi === 0 && (
                                <>
                                  <td rowSpan={rows.length} className="px-3 sm:px-6 py-2 sm:py-3 align-middle border-r border-[#f0f2f7]">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white border border-[#eaedf3] shadow-sm flex items-center justify-center p-1 overflow-hidden shrink-0">
                                        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" /> : <Package className="w-5 h-5 text-muted-foreground" />}
                                      </div>
                                      <span className="font-bold text-[#1a1f36] text-xs sm:text-sm line-clamp-2 max-w-[120px] sm:max-w-[160px]">{p.name}</span>
                                    </div>
                                  </td>
                                  <td rowSpan={rows.length} className="px-3 sm:px-6 align-middle border-r border-[#f0f2f7]">
                                    <div className="flex items-center gap-2">
                                      {(() => { const b = brands.find(br => br.name === p.brand); return b?.image ? <img src={b.image} alt={b.name} className="w-6 h-6 object-contain rounded shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : null; })()}
                                      <span className="text-[#7a869a] text-xs font-semibold">{p.brand}</span>
                                    </div>
                                  </td>
                                </>
                              )}
                              <td className="px-3 sm:px-5 py-2 text-xs font-bold text-[#8a92a6]">{v?.ram || <span className="text-[#d0d5dd]">—</span>}</td>
                              <td className="px-3 sm:px-5 py-2 text-xs font-bold text-[#8a92a6]">{v?.storage || <span className="text-[#d0d5dd]">—</span>}</td>
                              <td className="px-3 sm:px-5 py-2 text-xs font-bold text-[#8a92a6]">{v?.color || <span className="text-[#d0d5dd]">—</span>}</td>
                              <td className="px-3 sm:px-5 py-2">
                                {v ? <span className="font-black text-[#8a92a6] text-sm">₹{v.price?.toLocaleString()}</span> : <span className="text-[#d0d5dd] text-xs">No variants</span>}
                              </td>
                              <td className="px-3 sm:px-5 py-2">
                                {v ? (
                                  (v.stock ?? 0) > 0
                                    ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-100 text-[10px] font-black px-2 py-1 rounded-lg"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />{v.stock}</span>
                                    : <span className="inline-flex items-center gap-1 bg-red-50 text-red-500 border border-red-100 text-[10px] font-black px-2 py-1 rounded-lg"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Out of Stock</span>
                                ) : <span className="text-[#d0d5dd] text-xs">—</span>}
                              </td>
                              <td className="px-3 sm:px-5 py-2 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleOpenProductModal(p)} className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary"><Pencil className="w-3.5 h-3.5" /></Button>
                                  <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id || (p as any)._id)} className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}

        {Object.keys(groupedProducts).length === 0 && (
          <Card className="border-none shadow-sm rounded-3xl p-12 text-center">
            <Package className="w-12 h-12 text-[#eaedf3] mx-auto mb-4" />
            <p className="text-sm font-bold text-[#7a869a]">No products match your search</p>
          </Card>
        )}
      </div>

      {/* PRODUCT MODAL */}
      {showProductForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-4 sm:my-8 max-h-[90vh]">
            <div className="p-4 sm:p-8 border-b border-[#eaedf3] flex justify-between items-center bg-[#fcfdfe] shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#1a1f36]">{editingProduct ? "Edit Product" : "Add Product"}</h3>
                <p className="text-xs text-[#a3acb9] mt-1">Fill all required fields marked with *</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowProductForm(false)} className="rounded-full h-10 w-10 sm:h-12 sm:w-12"><X className="w-5 h-5 sm:w-6 sm:h-6" /></Button>
            </div>
            <div className="p-4 sm:p-8 overflow-y-auto flex-1 space-y-4 sm:space-y-6">
              {/* Cascading Selection */}
              <div className="bg-primary/5 rounded-xl sm:rounded-[2rem] border border-primary/10 p-3 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1 transition-colors group-focus-within:text-primary">1. Select Category *</label>
                    <div className="relative">
                      <select value={formData.category || ""} onChange={e => handleCategoryChange(e.target.value)}
                        className="w-full rounded-2xl border-[#eaedf3] h-12 font-bold text-[#1a1f36] text-sm px-4 bg-white border outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 appearance-none transition-all shadow-sm group-hover:shadow-md">
                        <option value="" disabled>Choose Category</option>
                        {categories.map(c => <option key={c.id} value={c.slug || c.name.toLowerCase()}>{c.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9] pointer-events-none transition-transform group-focus-within:rotate-180" />
                    </div>
                  </div>
                  <div className={`space-y-2 group transition-all duration-300 ${!formData.category ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                    <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1">2. Select Brand *</label>
                    <div className="relative">
                      <select value={formData.brand || ""} onChange={e => setFormData({ ...formData, brand: e.target.value })} disabled={!formData.category}
                        className="w-full rounded-2xl border-[#eaedf3] h-12 font-bold text-[#1a1f36] text-sm px-4 bg-white border outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 appearance-none transition-all shadow-sm group-hover:shadow-md disabled:bg-gray-50">
                        <option value="" disabled>Choose Brand</option>
                        {brands.filter(b => b.category === formData.category).map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9] pointer-events-none transition-transform group-focus-within:rotate-180" />
                    </div>
                  </div>
                  <div className={`space-y-2 group transition-opacity duration-300 ${!formData.brand ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                    <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1 transition-colors group-focus-within:text-primary">3. Enter Model Name *</label>
                    <Input value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} disabled={!formData.brand}
                      className="w-full rounded-2xl border-[#eaedf3] h-12 font-bold text-[#1a1f36] text-sm px-4 bg-white border outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all shadow-sm group-hover:shadow-md disabled:bg-gray-50"
                      placeholder="e.g. iPhone 15 Pro Max" />
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1 transition-colors group-focus-within:text-primary">Description *</label>
                  <textarea rows={3} value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-2xl border-[#eaedf3] p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none border shadow-sm resize-none transition-all focus:shadow-md" placeholder="Enter compelling product details..." />
                </div>
                {/* Offer Tag */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1">Offer Tag <span className="text-[#b0b8c9] normal-case font-medium">(badge on product card)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {["", "NEW", "HOT", "SALE", "TRENDING", "BESTSELLER", "LIMITED",
                      ...Array.from(new Set(offers.filter(o => o.tag && o.title !== "__popup__").map(o => o.tag as string)))
                    ].filter((t, i, arr) => arr.indexOf(t) === i).map(tag => (
                      <button key={tag || "none"} type="button" onClick={() => setFormData({ ...formData, tag: tag || undefined })}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${(formData.tag || "") === tag ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-white text-[#7a869a] border-[#eaedf3] hover:border-primary/30 hover:text-primary"}`}>
                        {tag || "None"}
                      </button>
                    ))}
                  </div>
                  {formData.tag && <p className="text-[10px] text-[#7a869a] ml-1">Tag <span className="font-black text-primary">{formData.tag}</span> will appear as a badge on the product card.</p>}
                </div>
                {/* Condition */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1">Product Condition</label>
                  <div className="flex gap-2">
                    {[{ label: "New", value: "new" }, { label: "Refurbished", value: "refurbished" }].map(c => (
                      <button key={c.value} type="button" onClick={() => setFormData({ ...formData, condition: c.value as 'new' | 'refurbished' })}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${(formData.condition || "new") === c.value ? c.value === "new" ? "bg-green-500 text-white border-green-500 shadow-md" : "bg-amber-500 text-white border-amber-500 shadow-md" : "bg-white text-[#7a869a] border-[#eaedf3] hover:border-primary/30"}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="bg-white rounded-xl sm:rounded-[2rem] border border-[#eaedf3] p-3 sm:p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1a1f36] flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> Product Variants</h4>
                  <Button variant="ghost" size="sm" onClick={handleAddVariant} className="rounded-xl font-black text-[9px] uppercase tracking-wider text-primary hover:bg-primary/5"><Plus className="w-3 h-3 mr-1" /> Add Variant</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-50 text-[9px] font-black uppercase text-[#7a869a] tracking-widest">
                        <th className="pb-3 px-2">RAM</th><th className="pb-3 px-2">Storage</th><th className="pb-3 px-2">Color</th>
                        <th className="pb-3 px-2">Price (₹)</th><th className="pb-3 px-2">MRP (₹)</th><th className="pb-3 px-2">Stock</th><th className="pb-3 px-2">Condition</th><th className="pb-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentVariants.map((variant, idx) => (
                        <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-2"><input value={variant.ram} onChange={e => handleVariantChange(idx, "ram" as any, e.target.value)} onBlur={() => handleVariantBlur(idx, "ram")} placeholder="e.g. 8GB" className="w-16 h-8 text-xs font-bold border border-gray-200 bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all px-2" /></td>
                          <td className="py-3 px-2"><input value={variant.storage} onChange={e => handleVariantChange(idx, "storage" as any, e.target.value)} onBlur={() => handleVariantBlur(idx, "storage")} placeholder="e.g. 128GB" className="w-20 h-8 text-xs font-bold border border-gray-200 bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all px-2" /></td>
                          <td className="py-3 px-2"><input value={variant.color} onChange={e => handleVariantChange(idx, "color" as any, e.target.value)} placeholder="e.g. Black" className="w-20 h-8 text-xs font-bold border border-gray-200 bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all px-2" /></td>
                          <td className="py-3 px-2"><input type="number" value={variant.price || ""} onChange={e => handleVariantChange(idx, "price" as any, Number(e.target.value))} placeholder="0" className="w-20 h-8 text-xs font-bold border border-gray-200 bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all px-2" /></td>
                          <td className="py-3 px-2"><input type="number" value={variant.originalPrice || ""} onChange={e => handleVariantChange(idx, "originalPrice" as any, Number(e.target.value))} placeholder="0" className="w-20 h-8 text-xs font-bold border border-gray-200 bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all px-2" /></td>
                          <td className="py-3 px-2"><input type="number" value={variant.stock || ""} onChange={e => handleVariantChange(idx, "stock" as any, Number(e.target.value))} placeholder="0" className="w-16 h-8 text-xs font-bold border border-gray-200 bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all px-2" /></td>
                          <td className="py-3 px-2">
                            <select value={variant.condition || "new"} onChange={e => handleVariantChange(idx, "condition" as any, e.target.value)} className="w-24 h-8 text-xs font-bold border border-gray-200 bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all px-1.5">
                              <option value="new">New</option>
                              <option value="refurbished">Refurbished</option>
                            </select>
                          </td>
                          <td className="py-3 text-right"><Button variant="ghost" size="icon" onClick={() => handleRemoveVariant(idx)} className="h-8 w-8 rounded-lg text-destructive bg-destructive/10 hover:bg-destructive hover:text-white transition-all"><Trash2 className="w-4 h-4" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {currentVariants.length === 0 && (
                  <div className="py-8 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-xs font-bold text-[#a3acb9]">No variants added. Click "Add Variant" to begin.</p>
                  </div>
                )}
              </div>

              {/* Specifications */}
              {(formData.category?.toLowerCase().includes("phone") || formData.category?.toLowerCase().includes("mobile") || formData.category?.toLowerCase().includes("laptop") || formData.category?.toLowerCase().includes("pc") || formData.category?.toLowerCase().includes("macbook") || formData.category?.toLowerCase().includes("accessory") || !formData.category) && (
                <div className="bg-[#fcfdfe] rounded-xl sm:rounded-3xl border border-[#eaedf3] p-3 sm:p-6 animate-fade-in">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1a1f36] mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    {formData.category?.toLowerCase().includes("laptop") || formData.category?.toLowerCase().includes("pc") || formData.category?.toLowerCase().includes("macbook") ? "Laptop Configuration" : formData.category?.toLowerCase().includes("accessory") ? "Accessory Configuration" : "Phone Configuration"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {((formData.category?.toLowerCase().includes("laptop") || formData.category?.toLowerCase().includes("pc") || formData.category?.toLowerCase().includes("macbook")) ? LAPTOP_SPECS : formData.category?.toLowerCase().includes("accessory") ? ACCESSORY_SPECS : PHONE_SPECS).map(key => (
                      <div key={key} className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#7a869a]">{SPEC_LABEL[key]}</label>
                        <Input value={specsData[key] || ""} onChange={e => setSpecsData({ ...specsData, [key]: e.target.value })}
                          className="rounded-xl h-10 text-sm" placeholder={`Enter ${SPEC_LABEL[key]}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Key Features (comma-separated)</label>
                <Input value={featuresInput} onChange={e => setFeaturesInput(e.target.value)} className="rounded-2xl h-12" placeholder="e.g. 5G, Fast Charging, AMOLED, 120Hz" />
              </div>

              {/* Images */}
              <MultiImageUpload label="Product Images (up to 4)" values={imagesInput} onChange={setImagesInput} max={4} />

              {/* Video */}
              <VideoUpload label="Product Video" value={formData.videoUrl || ""} onChange={(url) => setFormData({ ...formData, videoUrl: url })} />

              {/* Reviews & Ratings — only when editing */}
              {editingProduct && (
                <div className="bg-white rounded-xl sm:rounded-[2rem] border border-[#eaedf3] p-3 sm:p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1a1f36] flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" /> Reviews & Ratings
                      <Badge variant="secondary" className="h-5 px-2 text-[9px] rounded-full bg-primary/10 text-primary border-none">{productReviews.length}</Badge>
                    </h4>
                  </div>

                  {/* Existing Reviews */}
                  {loadingReviews ? (
                    <div className="py-6 text-center">
                      <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-[10px] text-[#7a869a]">Loading reviews...</p>
                    </div>
                  ) : productReviews.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {productReviews.map(review => {
                        const rid = review.id || review._id!;
                        const isEditing = editingReviewId === rid;
                        return (
                          <div key={rid} className="bg-[#f8f9fc] rounded-xl p-3 group">
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-black text-primary">{review.name?.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <span className="text-xs font-bold text-[#1a1f36]">{review.name}</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} type="button" onClick={() => setEditReviewForm(f => ({ ...f, rating: s }))} className="p-0.5">
                                      <Star className={`w-4 h-4 ${s <= editReviewForm.rating ? "fill-amber-400 text-amber-400" : "text-[#eaedf3] hover:text-amber-200"}`} />
                                    </button>
                                  ))}
                                  <span className="ml-1 text-[10px] font-bold text-[#7a869a]">{editReviewForm.rating}/5</span>
                                </div>
                                <textarea
                                  value={editReviewForm.comment}
                                  onChange={e => setEditReviewForm(f => ({ ...f, comment: e.target.value }))}
                                  rows={2}
                                  className="w-full rounded-lg border border-[#eaedf3] px-2.5 py-1.5 text-[11px] resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                                />
                                <div className="flex gap-1.5 justify-end">
                                  <button onClick={() => setEditingReviewId(null)} className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#7a869a] hover:bg-white border border-[#eaedf3]">Cancel</button>
                                  <button
                                    onClick={async () => {
                                      if (!editReviewForm.comment.trim()) { toast.error("Comment required"); return; }
                                      try {
                                        await updateReview(rid, editReviewForm);
                                        const pid = editingProduct!._id || (editingProduct as any).id;
                                        const updated = await fetchReviews(pid);
                                        setProductReviews(updated);
                                        setEditingReviewId(null);
                                        toast.success("Review updated");
                                      } catch { toast.error("Failed to update review"); }
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-primary hover:bg-primary/90"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-black text-primary">{review.name?.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-bold text-[#1a1f36]">{review.name}</span>
                                      <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                          <Star key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-[#eaedf3]"}`} />
                                        ))}
                                      </div>
                                      {review.createdAt && (
                                        <span className="text-[9px] text-[#7a869a]">{new Date(review.createdAt).toLocaleDateString()}</span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-[#4f566b] mt-0.5 line-clamp-2">{review.comment}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                  <button
                                    onClick={() => { setEditingReviewId(rid); setEditReviewForm({ rating: review.rating, comment: review.comment }); }}
                                    className="p-1.5 text-[#a3acb9] hover:text-primary hover:bg-primary/10 rounded-lg"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!confirm("Delete this review?")) return;
                                      try {
                                        await deleteReview(rid);
                                        const pid = editingProduct!._id || (editingProduct as any).id;
                                        const updated = await fetchReviews(pid);
                                        setProductReviews(updated);
                                        toast.success("Review deleted");
                                      } catch { toast.error("Failed to delete review"); }
                                    }}
                                    className="p-1.5 text-[#a3acb9] hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-[#a3acb9] text-center py-4">No reviews yet for this product.</p>
                  )}

                  {/* Add Review Form */}
                  <div className="border-t border-[#eaedf3] pt-4 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#7a869a]">Add Review</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))} className="p-0.5 transition-transform hover:scale-110">
                          <Star className={`w-6 h-6 ${s <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-[#eaedf3] hover:text-amber-200"}`} />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-[#1a1f36]">{reviewForm.rating}/5</span>
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        value={reviewForm.comment}
                        onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                        placeholder="Write a review..."
                        rows={2}
                        className="flex-1 rounded-xl border border-[#eaedf3] px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <Button
                        onClick={async () => {
                          if (!reviewForm.comment.trim()) { toast.error("Enter a review comment"); return; }
                          setSubmittingReview(true);
                          try {
                            const pid = editingProduct._id || (editingProduct as any).id;
                            await addReview({ productId: pid, rating: reviewForm.rating, comment: reviewForm.comment });
                            const updated = await fetchReviews(pid);
                            setProductReviews(updated);
                            setReviewForm({ rating: 5, comment: "" });
                            toast.success("Review added!");
                          } catch (err: any) { toast.error(err.message || "Failed to add review"); }
                          finally { setSubmittingReview(false); }
                        }}
                        disabled={submittingReview}
                        className="gradient-dark rounded-xl h-auto px-4 font-bold text-[10px] text-white self-end"
                      >
                        {submittingReview ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 sm:p-8 bg-[#f8f9fc] border-t border-[#eaedf3] flex gap-3 sm:gap-4 shrink-0">
              <Button variant="ghost" onClick={() => setShowProductForm(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px]">Cancel</Button>
              <Button onClick={handleSaveProduct} className="flex-1 h-12 rounded-2xl gradient-dark font-black uppercase text-[10px] text-white shadow-xl">
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsTab;
