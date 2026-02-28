import { useState, useEffect, useMemo, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Edit, X, Package, BarChart3, TrendingUp, Smartphone, Laptop, Tag, Link as LinkIcon, AlertCircle, ChevronDown, Check, ShoppingCart, Star, LogOut, LayoutDashboard, Pencil, Users, Menu, Bell, Layers, Search, Filter, RefreshCw, ArrowLeft, Clock, Truck, CheckCircle } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Product, Category, Offer, ProductModel, Variant, Brand } from "@/data/products";
import { toast } from "sonner";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload, MultiImageUpload, VideoUpload } from "@/components/ImageUpload";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─────────────── SPEC FIELDS CONFIG ───────────────
const PHONE_SPECS = ["os", "ramSize", "battery", "displaySize", "camera"];
const LAPTOP_SPECS = ["screenSize", "color", "hardDiskSize", "cpuModel", "ramSize", "os", "specialFeature", "graphicsCard"];
const SPEC_LABEL: Record<string, string> = {
  screenSize: "Screen Size",
  color: "Colour",
  hardDiskSize: "Hard Disk Size",
  cpuModel: "CPU Model",
  ramSize: "RAM Memory Installed Size",
  os: "Operating System",
  specialFeature: "Special Feature",
  graphicsCard: "Graphics Card Description",
  battery: "Battery Capacity",
  displaySize: "Display Size",
  camera: "Camera Details"
};

const emptySpecs = () => ({
  screenSize: "", color: "", hardDiskSize: "", cpuModel: "",
  ramSize: "", os: "", specialFeature: "", graphicsCard: "",
  battery: "", displaySize: "", camera: ""
});

const AdminDashboard = () => {
  const { products, categories, brands, activeOffer, offers, models, loading, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory, addBrand, updateBrand, deleteBrand, addOffer, updateOffer, deleteOffer, fetchModelsByCategory, fetchVariants } = useData();
  const { user, token, isAdmin, logout: authLogout } = useAuth();

  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeTab, setActiveTab] = useState("overview");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("aaro_token")) navigate("/login");
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  const handleLogout = () => { authLogout(); navigate("/"); toast.info("Logged out."); };

  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({ category: "phone", rating: 4.5, featured: false, features: [], images: [] });
  const [specsData, setSpecsData] = useState<any>(emptySpecs());
  const [featuresInput, setFeaturesInput] = useState("");
  const [imagesInput, setImagesInput] = useState<string[]>([]);
  const [currentVariants, setCurrentVariants] = useState<Partial<Variant>[]>([]);

  // Cascading Selection State
  const [filteredModels, setFilteredModels] = useState<ProductModel[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleOpenProductModal = async (product?: Product) => {
    setEditingProduct(product || null);
    const initialData = product || { category: "phone", rating: 4.5, featured: false, features: [], images: [] };
    setFormData(initialData);
    setSpecsData(product?.specifications ? { ...emptySpecs(), ...product.specifications } : emptySpecs());
    setFeaturesInput(product?.features?.join(", ") || "");
    setImagesInput(product?.images?.slice(0, 4) || []);

    // Fetch variants if editing
    if (product?._id || (product as any)?.id) {
      const vars = await fetchVariants(product._id || (product as any).id);
      setCurrentVariants(vars);
    } else {
      setCurrentVariants([{ ram: "", storage: "", color: "", price: 0, originalPrice: 0, stock: 0, isAvailable: true }]);
    }

    // If editing, load models for that category
    if (initialData.category) {
      const models = await fetchModelsByCategory(initialData.category);
      setFilteredModels(models);
    } else {
      setFilteredModels([]);
    }

    setShowProductForm(true);
  };

  const handleAddVariant = () => {
    setCurrentVariants([...currentVariants, { ram: "", storage: "", color: "", price: 0, originalPrice: 0, stock: 0, isAvailable: true }]);
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

        // Also update variants separately if needed by backend
        // For simplicity, our backend POST /api/products handles variants, 
        // but we might need a specific variants update if the product exists.
        // Let's assume for now the payload update handles it or we'll need a Loop.
        toast.success("Product and variants updated!");
      } else {
        await addProduct(payload);
        toast.success("Product added with variants!");
      }
      setShowProductForm(false);
    } catch { toast.error("Failed to save product"); }
  };

  // ── Category Form State ──
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: "", image: "" });

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

  // ── Brand Form State ──
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState({ name: "", category: "", image: "" });

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
        await addBrand({ name: brandForm.name.trim(), slug: `${brandForm.name.trim().toLowerCase().replace(/\s+/g, '-')}-${brandForm.category}`, category: brandForm.category, description: "", image: brandForm.image, productCount: 0 });
        toast.success(`Brand "${brandForm.name}" added!`);
      }
      setShowBrandForm(false);
    } catch { toast.error("Failed to save brand"); }
  };

  // ── Offer Form State ──
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerForm, setOfferForm] = useState({ title: "", image: "", active: false });

  // ── Popup Offer Form State ──
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [popupTemplate, setPopupTemplate] = useState("T1");

  const POPUP_TEMPLATES = [
    { id: "T1", label: "Flash Sale", bg: "from-orange-500 to-red-600", emoji: "⚡", sub: "Hot deals, limited time" },
    { id: "T2", label: "Weekend Deal", bg: "from-violet-600 to-purple-800", emoji: "🎉", sub: "Weekend specials" },
    { id: "T3", label: "Premium Offer", bg: "from-slate-700 to-slate-900", emoji: "👑", sub: "Exclusive members deal" },
    { id: "T4", label: "Festival Sale", bg: "from-green-500 to-teal-600", emoji: "🌟", sub: "Festive season savings" },
  ];

  const handleSavePopupOffer = async () => {
    try {
      const d = new Date(); d.setDate(d.getDate() + 7);
      const autoEndDate = d.toISOString().split("T")[0];
      const existing = offers.find(o => o.title === "__popup__");
      const payload = { title: "__popup__", image: "", active: true, description: autoEndDate, discount: 0, code: popupTemplate };
      if (existing) {
        await updateOffer({ ...existing, ...payload });
      } else {
        await addOffer(payload);
      }
      toast.success("Popup saved!");
      setShowPopupForm(false);
    } catch { toast.error("Failed to save popup"); }
  };

  const openOfferForm = (offer?: Offer) => {
    setEditingOffer(offer || null);
    setOfferForm({
      title: offer?.title || "",
      image: offer?.image || "",
      active: offer?.active || false,
    });
    setShowOfferForm(true);
  };

  const handleSaveOffer = async () => {
    if (!offerForm.image) return toast.error("Please upload an offer banner image");
    try {
      if (editingOffer) {
        await updateOffer({ ...editingOffer, title: offerForm.title || "Offer", image: offerForm.image, active: offerForm.active, description: editingOffer.description || "", discount: editingOffer.discount || 0, code: editingOffer.code || "" });
        toast.success("Offer updated!");
      } else {
        await addOffer({ title: offerForm.title || "Offer", image: offerForm.image, active: offerForm.active, description: "", discount: 0, code: "" });
        toast.success("Offer created!");
      }
      setShowOfferForm(false);
    } catch { toast.error("Failed to save offer"); }
  };

  const totalSales = 0; // Simplified for now since products are multi-variant

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [inventorySearch, setInventorySearch] = useState("");
  const [phonePage, setPhonePage] = useState(1);
  const [laptopPage, setLaptopPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [showFeaturedProductModal, setShowFeaturedProductModal] = useState(false);
  const [featuredSearch, setFeaturedSearch] = useState("");

  // Admin orders state (embedded in orders tab)
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [adminOrdersLoading, setAdminOrdersLoading] = useState(false);
  const [orderYear, setOrderYear] = useState<string>("all");
  const [orderCategory, setOrderCategory] = useState<string>("all");

  const fetchAdminOrders = async () => {
    setAdminOrdersLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAdminOrders(data);
      else toast.error("Failed to fetch orders");
    } catch { toast.error("Connection error"); }
    finally { setAdminOrdersLoading(false); }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Order ${newStatus}`);
        setAdminOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch { toast.error("Update failed"); }
  };

  useEffect(() => {
    if (activeTab === "orders" && isAdmin) fetchAdminOrders();
  }, [activeTab]);

  const orderYears = [...new Set(adminOrders.map(o => new Date(o.createdAt).getFullYear().toString()))].sort((a, b) => Number(b) - Number(a));
  const filteredAdminOrders = adminOrders.filter(order => {
    if (orderYear !== "all" && new Date(order.createdAt).getFullYear().toString() !== orderYear) return false;
    if (orderCategory !== "all" && !order.items.some((i: any) => i.product?.category === orderCategory)) return false;
    return true;
  });

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-500/10 text-green-600 border border-green-500/20";
      case "Shipped": return "bg-blue-500/10 text-blue-600 border border-blue-500/20";
      case "Processing": return "bg-orange-500/10 text-orange-600 border border-orange-500/20";
      case "Cancelled": return "bg-red-500/10 text-red-600 border border-red-500/20";
      default: return "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20";
    }
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
    <div className="min-h-screen bg-[#f8f9fc] flex overflow-hidden font-sans">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#eaedf3] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-dark flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-[#1a1f36]">AARO<span className="text-primary italic">Admin</span></span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-[#a3acb9] hover:text-primary"><X className="w-6 h-6" /></button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
            {[
              { id: "overview", icon: LayoutDashboard, label: "Overview" },
              { id: "products", icon: Package, label: "Inventory" },
              { id: "categories", icon: Layers, label: "Categories & Brands" },
              { id: "featured", icon: Star, label: "Featured" },
              { id: "orders", icon: ShoppingCart, label: "Orders" },
              { id: "offers", icon: Tag, label: "Offers" },
            ].map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-[#4f566b] hover:bg-[#f4f7fa]"}`}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <button onClick={handleLogout} className="mt-auto flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold text-destructive hover:bg-destructive/5 transition-colors border-t border-[#eaedf3] pt-6">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-[#eaedf3] px-4 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-2 text-[#a3acb9] hover:bg-secondary rounded-xl ${isSidebarOpen ? 'hidden' : 'block'}`}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-black text-[#1a1f36] capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-[#a3acb9] hover:text-primary">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 border-l border-[#eaedf3] pl-4 relative">
              {isProfileOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              )}
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center font-black text-primary text-xs relative z-50">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </button>

              <div className={`absolute right-4 top-full mt-2 w-48 bg-white border border-[#eaedf3] rounded-2xl shadow-xl py-2 transition-all transform origin-top-right z-50 ${isProfileOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
                <div className="px-4 py-2 border-b border-[#eaedf3] mb-1">
                  <p className="text-xs font-bold text-[#1a1f36] truncate">{user?.name}</p>
                  <p className="text-[10px] text-[#7a869a] truncate">{user?.email}</p>
                </div>
                <Link to="/" className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-[#4f566b] hover:bg-[#f8f9fc]" onClick={() => setIsProfileOpen(false)}>
                  <Smartphone className="w-4 h-4 text-primary" /> View Store
                </Link>
                <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-[#4f566b] hover:bg-[#f8f9fc]" onClick={() => setIsProfileOpen(false)}>
                  <Users className="w-4 h-4 text-primary" /> My Profile
                </Link>
                <button onClick={() => { setIsProfileOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/5 transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#f8f9fc]">
          <Tabs value={activeTab} className="space-y-6 animate-fade-in mb-10">

            {/* OVERVIEW */}
            <TabsContent value="overview" className="mt-0 space-y-6 outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Products", val: products.length, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
                  { label: "Categories", val: categories.length, icon: Layers, color: "text-purple-500", bg: "bg-purple-50" },
                  { label: "Active Offers", val: offers.filter(o => o.active).length, icon: Tag, color: "text-orange-500", bg: "bg-orange-50" },
                  { label: "Catalog Value", val: `₹${totalSales.toLocaleString()}`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
                ].map((s, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-3xl group hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                        <s.icon className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black text-[#a3acb9] uppercase tracking-widest mb-1">{s.label}</p>
                      <h4 className="text-2xl font-black text-[#1a1f36]">{s.val}</h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="border-none shadow-sm rounded-3xl p-6">
                <CardTitle className="mb-4 font-black text-[#1a1f36]">Quick Actions</CardTitle>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => { setActiveTab("products"); handleOpenProductModal(); }} className="gradient-dark text-white rounded-xl font-black text-xs"><Plus className="w-4 h-4 mr-2" />Add Product</Button>
                  <Button onClick={() => { setActiveTab("categories"); openCategoryForm(); }} className="gradient-purple text-white rounded-xl font-black text-xs"><Plus className="w-4 h-4 mr-2" />Add Category</Button>
                  <Button onClick={() => { setActiveTab("offers"); openOfferForm(); }} variant="outline" className="rounded-xl font-black text-xs"><Plus className="w-4 h-4 mr-2" />New Offer</Button>
                </div>
              </Card>
            </TabsContent>

            {/* PRODUCTS */}
            <TabsContent value="products" className="mt-0 space-y-4 outline-none">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm">
                <div><h3 className="text-xl font-black text-[#1a1f36]">Inventory</h3><p className="text-xs text-[#7a869a]">{products.length} products total</p></div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9]" />
                    <input
                      type="text"
                      value={inventorySearch}
                      onChange={e => { setInventorySearch(e.target.value); setPhonePage(1); setLaptopPage(1); }}
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
                  <Button onClick={() => handleOpenProductModal()} className="gradient-dark rounded-2xl h-11 px-5 font-black uppercase text-[10px] tracking-widest text-white shadow-lg shrink-0">
                    <Plus className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Add Product</span>
                  </Button>
                </div>
              </div>
              {Object.entries(groupedProducts).map(([catName, catProducts]) => {
                const isPhone = catName.toLowerCase().includes("phone") || catName.toLowerCase().includes("mobile");
                const page = isPhone ? phonePage : laptopPage;
                const setPage = isPhone ? setPhonePage : setLaptopPage;
                const totalPages = Math.ceil(catProducts.length / ITEMS_PER_PAGE);
                const paginatedProducts = catProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
                return (
                  <Card key={catName} className="border-none shadow-sm rounded-3xl overflow-hidden">
                    <div className={`px-6 py-3 border-b flex items-center justify-between ${isPhone ? "bg-blue-50 border-blue-100" : "bg-violet-50 border-violet-100"}`}>
                      <div className="flex items-center gap-2">
                        {isPhone ? <Smartphone className="w-4 h-4 text-blue-500" /> : <Laptop className="w-4 h-4 text-violet-500" />}
                        <span className={`text-xs font-black uppercase tracking-wider ${isPhone ? "text-blue-600" : "text-violet-600"}`}>{catName}</span>
                        <Badge variant="secondary" className={`h-5 px-2 text-[9px] rounded-full ${isPhone ? "bg-blue-100 text-blue-600 border-none" : "bg-violet-100 text-violet-600 border-none"}`}>{catProducts.length}</Badge>
                      </div>
                      {totalPages > 1 && (
                        <div className="flex items-center gap-2 text-xs font-bold text-[#7a869a]">
                          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 rounded-lg bg-white border border-[#eaedf3] flex items-center justify-center disabled:opacity-40 hover:border-primary/30 transition-colors">‹</button>
                          <span>{page}/{totalPages}</span>
                          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-7 h-7 rounded-lg bg-white border border-[#eaedf3] flex items-center justify-center disabled:opacity-40 hover:border-primary/30 transition-colors">›</button>
                        </div>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[700px] border-collapse">
                        <thead className="bg-white text-[10px] font-black uppercase text-[#a3acb9] tracking-widest border-b border-[#eaedf3]">
                          <tr className="h-12">
                            <th className="px-6">Product</th>
                            <th className="px-6">Brand</th>
                            <th className="px-5">RAM</th>
                            <th className="px-5">Storage</th>
                            <th className="px-5">Color</th>
                            <th className="px-5">Price</th>
                            <th className="px-5">Stock</th>
                            <th className="px-5 text-right">Actions</th>
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
                                        <td rowSpan={rows.length} className="px-6 py-3 align-middle border-r border-[#f0f2f7]">
                                          <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-white border border-[#eaedf3] shadow-sm flex items-center justify-center p-1 overflow-hidden shrink-0">
                                              {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" /> : <Package className="w-5 h-5 text-muted-foreground" />}
                                            </div>
                                            <span className="font-bold text-[#1a1f36] text-sm line-clamp-2 max-w-[160px]">{p.name}</span>
                                          </div>
                                        </td>
                                        <td rowSpan={rows.length} className="px-6 align-middle text-[#7a869a] text-xs font-semibold border-r border-[#f0f2f7]">{p.brand}</td>
                                      </>
                                    )}
                                    <td className="px-5 py-2.5 text-xs font-bold text-[#1a1f36]">{v?.ram || <span className="text-[#d0d5dd]">—</span>}</td>
                                    <td className="px-5 py-2.5 text-xs font-bold text-[#1a1f36]">{v?.storage || <span className="text-[#d0d5dd]">—</span>}</td>
                                    <td className="px-5 py-2.5 text-xs font-bold text-[#1a1f36]">{v?.color || <span className="text-[#d0d5dd]">—</span>}</td>
                                    <td className="px-5 py-2.5">
                                      {v ? (
                                        <span className="font-black text-[#1a1f36] text-sm">₹{v.price?.toLocaleString()}</span>
                                      ) : <span className="text-[#d0d5dd] text-xs">No variants</span>}
                                    </td>
                                    <td className="px-5 py-2.5">
                                      {v ? (
                                        (v.stock ?? 0) > 0
                                          ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-100 text-[10px] font-black px-2 py-1 rounded-lg">
                                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                              {v.stock}
                                            </span>
                                          : <span className="inline-flex items-center gap-1 bg-red-50 text-red-500 border border-red-100 text-[10px] font-black px-2 py-1 rounded-lg">
                                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                                              Out of Stock
                                            </span>
                                      ) : <span className="text-[#d0d5dd] text-xs">—</span>}
                                    </td>
                                    <td className="px-5 py-2.5 text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenProductModal(p)} className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary"><Pencil className="w-3.5 h-3.5" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)} className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
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
            </TabsContent>

            {/* CATEGORIES & BRANDS */}
            <TabsContent value="categories" className="mt-0 space-y-8 outline-none">

              {/* Categories Section */}
              <div>
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm mb-4">
                  <div><h3 className="text-xl font-black text-[#1a1f36]">Categories</h3><p className="text-xs text-[#7a869a]">Manage product groups</p></div>
                  <Button onClick={() => openCategoryForm()} className="gradient-purple rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest text-white hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4 mr-2" />New Category
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(c => (
                    <Card key={c.id} className="border-none shadow-sm rounded-3xl p-6 group hover:shadow-xl transition-all duration-300">
                      {c.image && <img src={c.image} alt={c.name} className="w-full h-32 object-cover rounded-2xl mb-4" />}
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Layers className="w-6 h-6" /></div>
                        <Badge className="bg-primary/10 text-primary border-none rounded-lg text-[10px]">{c.productCount} Items</Badge>
                      </div>
                      <h4 className="text-lg font-black text-[#1a1f36] mb-1">{c.name}</h4>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" onClick={() => openCategoryForm(c)} className="flex-1 rounded-xl h-10 text-[10px] font-bold"><Pencil className="w-3 h-3 mr-1" />Edit</Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCategory(c.id)} className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Brands Section */}
              <div>
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm mb-4">
                  <div><h3 className="text-xl font-black text-[#1a1f36]">Brands</h3><p className="text-xs text-[#7a869a]">Manage featured product brands</p></div>
                  <Button onClick={() => openBrandForm()} className="bg-[#1a1f36] hover:bg-[#2a3047] text-white rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest transition-transform hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />New Brand
                  </Button>
                </div>
                <div className="space-y-8">
                  {categories.map(c => {
                    const catBrands = brands.filter(b => b.category === (c.slug || c.name.toLowerCase()));
                    if (catBrands.length === 0) return null;
                    return (
                      <div key={c.id}>
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#7a869a] mb-4 flex items-center gap-2">
                          {c.name} Brands
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {catBrands.map(b => (
                            <Card key={b.id} className="border-none shadow-sm rounded-3xl p-6 group hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden">
                              <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-4 overflow-hidden border border-border">
                                {b.image ? <img src={b.image} alt={b.name} className="w-full h-full object-contain p-2" /> : <Tag className="w-6 h-6 text-muted-foreground" />}
                              </div>
                              <h4 className="text-base font-black text-[#1a1f36] mb-1">{b.name}</h4>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{c.name}</p>

                              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white to-transparent translate-y-full group-hover:translate-y-0 transition-transform flex justify-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => openBrandForm(b)} className="w-8 h-8 rounded-lg text-[10px] font-bold bg-white"><Pencil className="w-3 h-3" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteBrand(b.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive bg-white"><Trash2 className="w-3 h-3" /></Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {brands.filter(b => !categories.some(c => (c.slug || c.name.toLowerCase()) === b.category)).length > 0 && (
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#7a869a] mb-4 flex items-center gap-2">
                        Other Brands
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {brands.filter(b => !categories.some(c => (c.slug || c.name.toLowerCase()) === b.category)).map(b => (
                          <Card key={b.id} className="border-none shadow-sm rounded-3xl p-6 group hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-4 overflow-hidden border border-border">
                              {b.image ? <img src={b.image} alt={b.name} className="w-full h-full object-contain p-2" /> : <Tag className="w-6 h-6 text-muted-foreground" />}
                            </div>
                            <h4 className="text-base font-black text-[#1a1f36] mb-1">{b.name}</h4>

                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white to-transparent translate-y-full group-hover:translate-y-0 transition-transform flex justify-center gap-2">
                              <Button variant="outline" size="icon" onClick={() => openBrandForm(b)} className="w-8 h-8 rounded-lg text-[10px] font-bold bg-white"><Pencil className="w-3 h-3" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteBrand(b.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive bg-white"><Trash2 className="w-3 h-3" /></Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* FEATURED */}
            <TabsContent value="featured" className="mt-0 space-y-4 outline-none">
              <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm">
                <div><h3 className="text-xl font-black text-[#1a1f36]">Featured Products</h3><p className="text-xs text-[#7a869a]">Manage frontpage featured products</p></div>
                <Button onClick={() => setShowFeaturedProductModal(true)} className="gradient-dark rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />Add Featured
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Currently Featured */}
                <Card className="border-none shadow-sm rounded-3xl p-6 bg-transparent">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-black text-primary flex items-center gap-2 text-lg"><Star className="w-5 h-5 fill-primary" /> Currently Featured</h4>
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">{products.filter(p => p.featured).length} Items</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.filter(p => p.featured).map(p => (
                      <div key={p.id} className="flex flex-col p-4 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all border border-[#eaedf3] group relative overflow-hidden">
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            onClick={() => updateProduct({ ...p, featured: false })}
                            variant="default"
                            size="icon"
                            className="h-8 w-8 bg-destructive hover:bg-destructive/90 text-white shadow-lg rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#f8f9fc] border border-[#eaedf3] flex items-center justify-center p-2 mt-2 mb-4 shrink-0 overflow-hidden">
                          {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" /> : <Package className="w-6 h-6 text-[#a3acb9]" />}
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-[#1a1f36] line-clamp-1 mb-1">{p.name}</p>
                          <Badge variant="outline" className="text-[9px] text-[#7a869a] uppercase font-black">{p.brand}</Badge>
                        </div>
                      </div>
                    ))}
                    {products.filter(p => p.featured).length === 0 && (
                      <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-[#eaedf3]">
                        <Star className="w-12 h-12 text-[#eaedf3] mx-auto mb-4" />
                        <p className="text-sm font-bold text-[#1a1f36] mb-1">No featured products yet.</p>
                        <p className="text-xs text-[#7a869a]">Click "Add Featured" to highlight items on your frontpage.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* ORDERS */}
            <TabsContent value="orders" className="mt-0 space-y-4 outline-none">
              <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm">
                <div>
                  <h3 className="text-xl font-black text-[#1a1f36]">Orders</h3>
                  <p className="text-xs text-[#7a869a]">{filteredAdminOrders.length} orders{(orderYear !== "all" || orderCategory !== "all") ? " (filtered)" : ""}</p>
                </div>
                <button onClick={fetchAdminOrders} className="p-2.5 rounded-xl bg-[#f8f9fc] hover:bg-[#eaedf3] transition-colors border border-[#eaedf3]">
                  <RefreshCw className="w-4 h-4 text-[#4f566b]" />
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-[#eaedf3]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#7a869a]">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </div>
                <select
                  value={orderYear}
                  onChange={e => setOrderYear(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-[#eaedf3] bg-[#f8f9fc] text-sm font-bold text-[#1a1f36] outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Years</option>
                  {orderYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select
                  value={orderCategory}
                  onChange={e => setOrderCategory(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-[#eaedf3] bg-[#f8f9fc] text-sm font-bold text-[#1a1f36] outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Categories</option>
                  <option value="phone">Phones</option>
                  <option value="laptop">Laptops</option>
                </select>
                {(orderYear !== "all" || orderCategory !== "all") && (
                  <button
                    onClick={() => { setOrderYear("all"); setOrderCategory("all"); }}
                    className="h-9 px-3 rounded-xl border border-red-200 bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {adminOrdersLoading ? (
                <div className="py-16 text-center text-[#7a869a] animate-pulse font-bold">Loading orders...</div>
              ) : filteredAdminOrders.length === 0 ? (
                <Card className="border-none shadow-sm rounded-3xl p-12 text-center">
                  <Package className="w-12 h-12 text-[#eaedf3] mx-auto mb-4" />
                  <p className="text-sm font-bold text-[#7a869a]">No orders found</p>
                </Card>
              ) : (
                <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#f8f9fc] text-[10px] font-black uppercase text-[#a3acb9] tracking-widest border-b border-[#eaedf3]">
                        <tr className="h-12">
                          <th className="px-6">Customer</th>
                          <th className="px-6">Date</th>
                          <th className="px-6">Items</th>
                          <th className="px-6">Amount</th>
                          <th className="px-6">Status</th>
                          <th className="px-6">Update</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eaedf3]">
                        {filteredAdminOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-[#f8f9fc] transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#1a1f36] text-sm">{order.userId?.name || "Deleted User"}</p>
                              <p className="text-xs text-[#7a869a]">{order.userId?.email}</p>
                            </td>
                            <td className="px-6 py-4 text-xs text-[#7a869a] whitespace-nowrap">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-6 py-4">
                              {order.items.map((item: any, i: number) => (
                                <p key={i} className="text-xs text-[#7a869a]">{item.product?.name || "—"} ×{item.quantity}</p>
                              ))}
                            </td>
                            <td className="px-6 py-4 font-black text-primary text-sm">₹{order.totalAmount.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getOrderStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                className="bg-[#f8f9fc] text-xs font-bold rounded-xl border border-[#eaedf3] p-1.5 outline-none focus:ring-2 focus:ring-primary/20"
                              >
                                {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* OFFERS */}
            <TabsContent value="offers" className="mt-0 space-y-6 outline-none">

              {/* ── POPUP OFFER SECTION ── */}
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#eaedf3] flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#1a1f36]">Popup Offer</h3>
                    <p className="text-xs text-[#7a869a]">Pick a template + set end date — shows as popup with live countdown</p>
                  </div>
                  <Button
                    onClick={() => {
                      const existing = offers.find(o => o.title === "__popup__");
                      setPopupTemplate(existing?.code || "T1");
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
                      const tpl = POPUP_TEMPLATES.find(t => t.id === popup?.code) || POPUP_TEMPLATES[0];
                      return popup ? (
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className={`w-full sm:w-64 h-28 rounded-2xl bg-gradient-to-br ${tpl.bg} flex flex-col items-center justify-center flex-shrink-0 shadow-md`}>
                            <span className="text-3xl mb-1">{tpl.emoji}</span>
                            <p className="text-white font-black text-sm">{tpl.label}</p>
                            <p className="text-white/70 text-[10px]">{tpl.sub}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">LIVE</span>
                              <span className="text-xs text-[#7a869a] font-bold">Template: {tpl.label}</span>
                            </div>
                            <p className="text-xs text-[#7a869a]">Countdown ends: <span className="font-bold text-[#1a1f36]">{popup.description}</span></p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-10 text-center bg-[#f8f9fc] rounded-2xl border-2 border-dashed border-[#eaedf3]">
                          <Tag className="w-10 h-10 text-[#eaedf3] mx-auto mb-3" />
                          <p className="text-sm font-bold text-[#7a869a]">No popup set</p>
                          <p className="text-xs text-[#a3acb9] mt-1">Click "Set Popup" to choose a template</p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Template picker form */}
                {showPopupForm && (
                  <div className="p-6 space-y-5 bg-[#f8f9fc] border-t border-[#eaedf3] animate-fade-in">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Template grid */}
                      <div className="flex-1">
                        <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest mb-3 block">Choose Template</label>
                        <div className="grid grid-cols-2 gap-3">
                          {POPUP_TEMPLATES.map(tpl => (
                            <button
                              key={tpl.id}
                              onClick={() => setPopupTemplate(tpl.id)}
                              className={`relative rounded-2xl overflow-hidden border-2 transition-all ${popupTemplate === tpl.id ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]" : "border-transparent hover:border-[#eaedf3]"}`}
                            >
                              <div className={`bg-gradient-to-br ${tpl.bg} p-4 flex flex-col items-center text-center`}>
                                <span className="text-2xl mb-1">{tpl.emoji}</span>
                                <p className="text-white font-black text-xs">{tpl.label}</p>
                                <p className="text-white/70 text-[9px] mt-0.5">{tpl.sub}</p>
                              </div>
                              {popupTemplate === tpl.id && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                                  <Check className="w-3 h-3 text-primary" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live preview */}
                      {(() => {
                        const tpl = POPUP_TEMPLATES.find(t => t.id === popupTemplate) || POPUP_TEMPLATES[0];
                        return (
                          <div className="flex-1">
                            <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest mb-3 block">Preview</label>
                            <div className={`rounded-2xl bg-gradient-to-br ${tpl.bg} p-5 shadow-xl relative overflow-hidden`}>
                              {/* blobs */}
                              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                              <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />
                              {/* pill */}
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 border border-white/20 mb-3">
                                <Tag className="w-2.5 h-2.5 text-white/80" />
                                <span className="text-[9px] font-black text-white/90 uppercase tracking-widest">{tpl.label}</span>
                              </div>
                              {/* emoji + heading */}
                              <div className="mb-1"><span className="text-3xl">{tpl.emoji}</span></div>
                              <p className="text-white font-black text-lg mb-1">{tpl.label}!</p>
                              <p className="text-white/70 text-[10px] mb-4">{tpl.sub}</p>
                              {/* countdown boxes */}
                              <div className="flex items-center gap-1.5 mb-1">
                                <Clock className="w-3 h-3 text-white/60" />
                                <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Offer ends in</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {[{ v: "07", l: "Days" }, { v: "00", l: "Hrs" }, { v: "00", l: "Min" }, { v: "00", l: "Sec" }].map((b, i) => (
                                  <Fragment key={i}>
                                    <div className="flex flex-col items-center gap-0.5">
                                      <div className="w-9 h-9 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
                                        <span className="text-sm font-black text-white tabular-nums">{b.v}</span>
                                      </div>
                                      <span className="text-[8px] font-bold text-white/60 uppercase">{b.l}</span>
                                    </div>
                                    {i < 3 && <span className="text-white/40 font-black text-base pb-3">:</span>}
                                  </Fragment>
                                ))}
                              </div>
                            </div>
                            <p className="text-[10px] text-[#a3acb9] mt-2 font-semibold">Countdown auto-resets to 7 days when saved</p>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="ghost" onClick={() => setShowPopupForm(false)} className="flex-1 h-11 rounded-2xl font-black uppercase text-[10px]">Cancel</Button>
                      <Button onClick={handleSavePopupOffer} className="flex-1 h-11 rounded-2xl gradient-purple font-black uppercase text-[10px] text-white shadow-lg">
                        Save Popup
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── OFFER BANNERS SECTION ── */}
              <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm">
                <div>
                  <h3 className="text-xl font-black text-[#1a1f36]">Offer Banners</h3>
                  <p className="text-xs text-[#7a869a]">Upload banner images — toggle active/inactive</p>
                </div>
                <Button onClick={() => openOfferForm()} className="bg-[#1a1f36] hover:bg-[#2a3047] text-white rounded-2xl h-11 px-6 font-black uppercase text-[10px] tracking-widest">
                  <Plus className="w-4 h-4 mr-2" />Upload Banner
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.filter(o => o.title !== "__popup__").map(offer => (
                  <Card key={offer.id} className={`border-none shadow-sm rounded-3xl overflow-hidden transition-all hover:shadow-lg ${offer.active ? "ring-2 ring-primary/30" : ""}`}>
                    <div className="w-full h-36 bg-[#f8f9fc] border-b border-[#eaedf3] overflow-hidden relative">
                      {offer.image ? (
                        <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tag className="w-8 h-8 text-[#eaedf3]" />
                        </div>
                      )}
                      {offer.active && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-full">ACTIVE</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-black text-[#1a1f36] text-sm mb-3 truncate">{offer.title || "Untitled Banner"}</p>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openOfferForm(offer)} className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteOffer(offer.id)} className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {offers.filter(o => o.title !== "__popup__").length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-[#eaedf3]">
                    <Tag className="w-12 h-12 text-[#eaedf3] mx-auto mb-4" />
                    <p className="text-sm font-bold text-[#1a1f36] mb-1">No offer banners yet</p>
                    <p className="text-xs text-[#7a869a]">Upload a banner image to show offers to visitors.</p>
                  </div>
                )}
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </main>

      {/* ─── PRODUCT MODAL ─── */}
      {showProductForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
            <div className="p-8 border-b border-[#eaedf3] flex justify-between items-center bg-[#fcfdfe] shrink-0">
              <div>
                <h3 className="text-2xl font-black text-[#1a1f36]">{editingProduct ? "Edit Product" : "Add Product"}</h3>
                <p className="text-xs text-[#a3acb9] mt-1">Fill all required fields marked with *</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowProductForm(false)} className="rounded-full h-12 w-12"><X className="w-6 h-6" /></Button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              {/* Cascading Selection Info */}
              <div className="bg-primary/5 rounded-[2rem] border border-primary/10 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Category Selection */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1 transition-colors group-focus-within:text-primary">
                      1. Select Category *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category || ""}
                        onChange={e => handleCategoryChange(e.target.value)}
                        className="w-full rounded-2xl border-[#eaedf3] h-12 font-bold text-[#1a1f36] text-sm px-4 bg-white border outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 appearance-none transition-all shadow-sm group-hover:shadow-md"
                      >
                        <option value="" disabled>Choose Category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.slug || c.name.toLowerCase()}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9] pointer-events-none transition-transform group-focus-within:rotate-180" />
                    </div>
                  </div>

                  {/* Brand - Dropdown */}
                  <div className={`space-y-2 group transition-all duration-300 ${!formData.category ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                    <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1">
                      2. Select Brand *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.brand || ""}
                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                        disabled={!formData.category}
                        className="w-full rounded-2xl border-[#eaedf3] h-12 font-bold text-[#1a1f36] text-sm px-4 bg-white border outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 appearance-none transition-all shadow-sm group-hover:shadow-md disabled:bg-gray-50"
                      >
                        <option value="" disabled>Choose Brand</option>
                        {brands.filter(b => b.category === formData.category).map(b => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9] pointer-events-none transition-transform group-focus-within:rotate-180" />
                    </div>
                  </div>

                  {/* Model Selection - Text Input */}
                  <div className={`space-y-2 group transition-opacity duration-300 ${!formData.brand ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                    <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1 transition-colors group-focus-within:text-primary">
                      3. Enter Model Name *
                    </label>
                    <Input
                      value={formData.name || ""}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      disabled={!formData.brand}
                      className="w-full rounded-2xl border-[#eaedf3] h-12 font-bold text-[#1a1f36] text-sm px-4 bg-white border outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all shadow-sm group-hover:shadow-md disabled:bg-gray-50"
                      placeholder="e.g. iPhone 15 Pro Max"
                    />
                  </div>

                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1 transition-colors group-focus-within:text-primary">Description *</label>
                  <textarea rows={3} value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-2xl border-[#eaedf3] p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none border shadow-sm resize-none transition-all focus:shadow-md" placeholder="Enter compelling product details..." />
                </div>
              </div>

              {/* Variant Management Section */}
              <div className="bg-white rounded-[2rem] border border-[#eaedf3] p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1a1f36] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" /> Product Variants
                  </h4>
                  <Button variant="ghost" size="sm" onClick={handleAddVariant} className="rounded-xl font-black text-[9px] uppercase tracking-wider text-primary hover:bg-primary/5">
                    <Plus className="w-3 h-3 mr-1" /> Add Variant
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-50 text-[9px] font-black uppercase text-[#7a869a] tracking-widest">
                        <th className="pb-3 px-2">RAM</th>
                        <th className="pb-3 px-2">Storage</th>
                        <th className="pb-3 px-2">Color</th>
                        <th className="pb-3 px-2">Price (₹)</th>
                        <th className="pb-3 px-2">MRP (₹)</th>
                        <th className="pb-3 px-2">Stock</th>
                        <th className="pb-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentVariants.map((variant, idx) => (
                        <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-2">
                            <input value={variant.ram}
                              onChange={e => handleVariantChange(idx, "ram" as any, e.target.value)}
                              onBlur={() => handleVariantBlur(idx, "ram")}
                              placeholder="e.g. 8GB"
                              className="w-16 h-8 text-xs font-bold border border-gray-200 bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all px-2" />
                          </td>
                          <td className="py-3 px-2">
                            <input value={variant.storage}
                              onChange={e => handleVariantChange(idx, "storage" as any, e.target.value)}
                              onBlur={() => handleVariantBlur(idx, "storage")}
                              placeholder="e.g. 128GB"
                              className="w-20 h-8 text-xs font-bold border border-gray-200 bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all px-2" />
                          </td>
                          <td className="py-3 px-2">
                            <input value={variant.color} onChange={e => handleVariantChange(idx, "color" as any, e.target.value)}
                              placeholder="e.g. Black"
                              className="w-20 h-8 text-xs font-bold border border-gray-200 bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all px-2" />
                          </td>
                          <td className="py-3 px-2">
                            <input type="number" value={variant.price || ""} onChange={e => handleVariantChange(idx, "price" as any, Number(e.target.value))}
                              placeholder="0"
                              className="w-20 h-8 text-xs font-bold border border-gray-200 bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all px-2" />
                          </td>
                          <td className="py-3 px-2">
                            <input type="number" value={variant.originalPrice || ""} onChange={e => handleVariantChange(idx, "originalPrice" as any, Number(e.target.value))}
                              placeholder="0"
                              className="w-20 h-8 text-xs font-bold border border-gray-200 bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all px-2" />
                          </td>
                          <td className="py-3 px-2">
                            <input type="number" value={variant.stock || ""} onChange={e => handleVariantChange(idx, "stock" as any, Number(e.target.value))}
                              placeholder="0"
                              className="w-16 h-8 text-xs font-bold border border-gray-200 bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all px-2" />
                          </td>
                          <td className="py-3 text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveVariant(idx)}
                              className="h-8 w-8 rounded-lg text-destructive bg-destructive/10 hover:bg-destructive hover:text-white transition-all">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
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
              {(formData.category?.toLowerCase().includes("phone") || formData.category?.toLowerCase().includes("mobile") || formData.category?.toLowerCase().includes("laptop") || formData.category?.toLowerCase().includes("pc") || formData.category?.toLowerCase().includes("macbook") || !formData.category) && (
                <div className="bg-[#fcfdfe] rounded-3xl border border-[#eaedf3] p-6 animate-fade-in">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1a1f36] mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    {formData.category?.toLowerCase().includes("laptop") || formData.category?.toLowerCase().includes("pc") || formData.category?.toLowerCase().includes("macbook") ? "Laptop Configuration" : "Phone Configuration"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {((formData.category?.toLowerCase().includes("laptop") || formData.category?.toLowerCase().includes("pc") || formData.category?.toLowerCase().includes("macbook")) ? LAPTOP_SPECS : PHONE_SPECS).map(key => (
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
                <Input value={featuresInput} onChange={e => setFeaturesInput(e.target.value)}
                  className="rounded-2xl h-12" placeholder="e.g. 5G, Fast Charging, AMOLED, 120Hz" />
              </div>

              {/* Images */}
              <MultiImageUpload
                label="Product Images (up to 4)"
                values={imagesInput}
                onChange={setImagesInput}
                max={4}
              />

              {/* Video */}
              <VideoUpload
                label="Product Video"
                value={formData.videoUrl || ""}
                onChange={(url) => setFormData({ ...formData, videoUrl: url })}
              />
            </div>
            <div className="p-8 bg-[#f8f9fc] border-t border-[#eaedf3] flex gap-4 shrink-0">
              <Button variant="ghost" onClick={() => setShowProductForm(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px]">Cancel</Button>
              <Button onClick={handleSaveProduct} className="flex-1 h-12 rounded-2xl gradient-dark font-black uppercase text-[10px] text-white shadow-xl">
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CATEGORY MODAL ─── */}
      {showCategoryForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-[#eaedf3] flex justify-between items-center">
              <h3 className="text-xl font-black text-[#1a1f36]">{editingCategory ? "Edit Category" : "New Category"}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCategoryForm(false)} className="rounded-full h-10 w-10"><X className="w-5 h-5" /></Button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Name *</label>
                <Input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} className="rounded-2xl h-12" placeholder="Category name" /></div>

              <ImageUpload
                label="Category Image"
                value={catForm.image}
                onChange={url => setCatForm({ ...catForm, image: url })}
              />
            </div>
            <div className="p-8 bg-[#f8f9fc] border-t border-[#eaedf3] flex gap-4">
              <Button variant="ghost" onClick={() => setShowCategoryForm(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px]">Cancel</Button>
              <Button onClick={handleSaveCategory} className="flex-1 h-12 rounded-2xl gradient-purple font-black uppercase text-[10px] text-white">
                {editingCategory ? "Update" : "Add Category"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BRAND MODAL ─── */}
      {showBrandForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-[#eaedf3] flex justify-between items-center">
              <h3 className="text-xl font-black text-[#1a1f36]">{editingBrand ? "Edit Brand" : "New Brand"}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowBrandForm(false)} className="rounded-full h-10 w-10"><X className="w-5 h-5" /></Button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Name *</label>
                <Input value={brandForm.name} onChange={e => setBrandForm({ ...brandForm, name: e.target.value })} className="rounded-2xl h-12" placeholder="Brand name" /></div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Category *</label>
                <div className="relative">
                  <select
                    value={brandForm.category || ""}
                    onChange={e => setBrandForm({ ...brandForm, category: e.target.value })}
                    className="w-full rounded-2xl border-[#eaedf3] h-12 font-bold text-[#1a1f36] text-sm px-4 bg-white border outline-none focus:ring-2 focus:ring-primary/20 appearance-none shadow-sm"
                  >
                    <option value="" disabled>Choose Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.slug || c.name.toLowerCase()}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9] pointer-events-none" />
                </div>
              </div>

              <ImageUpload
                label="Brand Logo"
                value={brandForm.image}
                onChange={url => setBrandForm({ ...brandForm, image: url })}
              />
            </div>
            <div className="p-8 bg-[#f8f9fc] border-t border-[#eaedf3] flex gap-4">
              <Button variant="ghost" onClick={() => setShowBrandForm(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px]">Cancel</Button>
              <Button onClick={handleSaveBrand} className="flex-1 h-12 rounded-2xl bg-[#1a1f36] hover:bg-[#2a3047] font-black uppercase text-[10px] text-white transition-colors">
                {editingBrand ? "Update" : "Add Brand"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── OFFER MODAL ─── */}
      {showOfferForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-[#eaedf3] flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-[#1a1f36]">{editingOffer ? "Edit Banner" : "Upload Banner"}</h3>
                <p className="text-xs text-[#a3acb9] mt-1">Upload an offer banner image</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowOfferForm(false)} className="rounded-full h-10 w-10"><X className="w-5 h-5" /></Button>
            </div>
            <div className="p-8 space-y-5">
              <ImageUpload
                label="Banner Image *"
                value={offerForm.image}
                onChange={url => setOfferForm({ ...offerForm, image: url })}
              />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">Label (for admin reference)</label>
                <Input value={offerForm.title} onChange={e => setOfferForm({ ...offerForm, title: e.target.value })} className="rounded-2xl h-12" placeholder="e.g. Summer Sale Banner" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-[#f8f9fc] border border-[#eaedf3] hover:border-primary/30 transition-colors">
                <input type="checkbox" checked={offerForm.active} onChange={e => setOfferForm({ ...offerForm, active: e.target.checked })} className="w-5 h-5 accent-primary" />
                <div>
                  <span className="text-sm font-bold text-[#1a1f36] block">Set as Active</span>
                  <span className="text-[10px] text-[#7a869a]">Shows as popup to new visitors</span>
                </div>
              </label>
            </div>
            <div className="p-8 bg-[#f8f9fc] border-t border-[#eaedf3] flex gap-4">
              <Button variant="ghost" onClick={() => setShowOfferForm(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px]">Cancel</Button>
              <Button onClick={handleSaveOffer} className="flex-1 h-12 rounded-2xl gradient-purple font-black uppercase text-[10px] text-white shadow-lg">
                {editingOffer ? "Update" : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD FEATURED MODAL */}
      {showFeaturedProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-[#eaedf3]">
              <div>
                <h3 className="text-xl font-black text-[#1a1f36]">Select Product to Feature</h3>
                <p className="text-xs text-[#7a869a]">Search and choose from all category products</p>
              </div>
              <button onClick={() => setShowFeaturedProductModal(false)} className="p-2 text-[#a3acb9] hover:text-primary transition-colors bg-[#f8f9fc] rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 border-b border-[#eaedf3] bg-[#f8f9fc]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#a3acb9]" />
                <Input
                  placeholder="Search all products by name or brand..."
                  value={featuredSearch}
                  onChange={e => setFeaturedSearch(e.target.value)}
                  className="w-full h-12 pl-10 rounded-2xl border-none shadow-sm text-sm font-bold bg-white focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-white">
              {products.filter(p => !p.featured && (p.name.toLowerCase().includes(featuredSearch.toLowerCase()) || p.brand.toLowerCase().includes(featuredSearch.toLowerCase()))).map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border border-[#eaedf3] hover:border-primary/30 hover:bg-[#f8f9fc] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 border border-[#eaedf3] p-1 shadow-sm">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" /> : <Package className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1f36] line-clamp-1">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[9px] uppercase font-black tracking-widest">{p.category}</Badge>
                        <span className="text-[10px] text-[#7a869a] font-bold">{p.brand}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => { updateProduct({ ...p, featured: true }); toast.success(`${p.name} featured!`); }}
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-xs font-black shrink-0 text-primary border-primary/20 hover:bg-primary hover:text-white rounded-xl uppercase tracking-widest transition-all"
                  >
                    Feature
                  </Button>
                </div>
              ))}
              {products.filter(p => !p.featured && (p.name.toLowerCase().includes(featuredSearch.toLowerCase()) || p.brand.toLowerCase().includes(featuredSearch.toLowerCase()))).length === 0 && (
                <div className="py-16 text-center">
                  <Package className="w-12 h-12 text-[#eaedf3] mx-auto mb-4" />
                  <p className="text-sm font-bold text-[#7a869a]">No matching products found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eaedf3; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
