import { Link, useNavigate } from "react-router-dom";
import { Package, ShoppingCart, Star, Tag, LogOut, LayoutDashboard, Pencil, Trash2, X, Plus } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useEffect, useState, useMemo } from "react";
import { Product, Offer } from "@/data/products";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { products, reviews, offers, addProduct, updateProduct, deleteProduct, addOffer, deleteOffer, deleteReview } = useData();
  const navigate = useNavigate();

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "bg-primary/10 text-primary" },
    { label: "Total Orders", value: 24, icon: ShoppingCart, color: "bg-accent/10 text-accent" },
    { label: "Total Reviews", value: reviews.length, icon: Star, color: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" },
    { label: "Active Offers", value: offers.filter((o) => o.active).length, icon: Tag, color: "bg-destructive/10 text-destructive" },
  ];

  useEffect(() => {
    if (!localStorage.getItem("techzone_admin")) navigate("/admin");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("techzone_admin");
    navigate("/admin");
  };


  const [activeTab, setActiveTab] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "", brand: "", category: "phone", price: 0, originalPrice: 0, description: "", specifications: [], rating: 0, reviewCount: 0
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowProductForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
      toast.success("Product deleted successfully");
    }
  };

  const uniqueBrands = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), [products]);
  const uniqueCategories = useMemo(() => [...new Set(products.map(p => p.category))].sort(), [products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      category: formData.category || "phone",
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      rating: formData.rating || 0,
      reviewCount: formData.reviewCount || 0,
      images: formData.images || [],
      featured: formData.featured || false,
      specifications: Array.isArray(formData.specifications) ? formData.specifications.filter(s => s.trim() !== "") : []
    } as Product;

    if (editingProduct) {
      updateProduct(productData);
      toast.success("Product updated successfully");
    } else {
      addProduct(productData);
      toast.success("Product added successfully");
    }
    setShowProductForm(false);
    setEditingProduct(null);
    setFormData({ name: "", brand: "", category: "phone", price: 0, originalPrice: 0, description: "", specifications: [] });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="glass-card rounded-lg p-5">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mb-6 overflow-x-auto">
        {["products", "offers", "reviews"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Products</h2>
            <button onClick={() => {
              setEditingProduct(null);
              setFormData({ name: "", brand: "", category: "phone", price: 0, originalPrice: 0, description: "", specifications: [], rating: 0, reviewCount: 0 });
              setShowProductForm(true);
            }} className="gradient-purple text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
              + Add Product
            </button>
          </div>

          {showProductForm && (
            <div className="glass p-6 rounded-lg relative animate-fade-in">
              <button onClick={() => setShowProductForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              <h3 className="font-bold mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                <input required placeholder="Name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" />

                <div className="relative">
                  <input
                    required
                    placeholder="Brand"
                    list="brand-suggestions"
                    value={formData.brand || ""}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="input-field w-full"
                  />
                  <datalist id="brand-suggestions">
                    {uniqueBrands.map(brand => <option key={brand} value={brand} />)}
                  </datalist>
                </div>

                <select value={formData.category || "phone"} onChange={(e) => setFormData({ ...formData, category: e.target.value as any })} className="input-field">
                  <option value="phone">Phone</option>
                  <option value="laptop">Laptop</option>
                  {uniqueCategories.filter(c => c !== "phone" && c !== "laptop").map((c: any) => (
                    <option key={c} value={c}>{(c as string).charAt(0).toUpperCase() + (c as string).slice(1)}</option>
                  ))}
                </select>
                <input required type="number" placeholder="Price" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="input-field" />
                <input required type="number" placeholder="Original Price" value={formData.originalPrice || ""} onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })} className="input-field" />
                <input placeholder="Image URL (optional)" value={formData.images?.[0] || ""} onChange={(e) => setFormData({ ...formData, images: e.target.value ? [e.target.value] : [] })} className="input-field md:col-span-2" />
                <input type="number" step="0.1" min="0" max="5" placeholder="Rating (0-5)" value={formData.rating || ""} onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })} className="input-field" />
                <input type="number" min="0" placeholder="Review Count" value={formData.reviewCount || ""} onChange={(e) => setFormData({ ...formData, reviewCount: Number(e.target.value) })} className="input-field" />
                <textarea required placeholder="Description" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field md:col-span-2" />
                <textarea required placeholder="Specifications (one per line)" value={Array.isArray(formData.specifications) ? formData.specifications.join('\n') : formData.specifications || ""} onChange={(e) => setFormData({ ...formData, specifications: e.target.value.split('\n') })} className="input-field md:col-span-2 h-32" />
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.featured || false} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="accent-primary" />
                    <span className="text-sm">Featured Product</span>
                  </label>
                </div>
                <button type="submit" className="md:col-span-2 gradient-purple text-primary-foreground py-2 rounded-lg font-medium">Save Product</button>
              </form>
            </div>
          )}

          <div className="overflow-x-auto glass rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">Price</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-white/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{p.name}</td>
                    <td className="p-3 text-muted-foreground">{p.brand}</td>
                    <td className="p-3 text-foreground">₹{p.price}</td>
                    <td className="p-3 text-right flex justify-end gap-2">
                      <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Offers Tab */}
      {activeTab === "offers" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Offers</h2>
            {/* Simple Add Offer for demo */}
            <button onClick={() => {
              const title = prompt("Enter Offer Title:");
              if (title) addOffer({ id: Date.now().toString(), title, description: "Limited time offer!", discount: 10, active: true });
            }} className="gradient-purple text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
              + Add Offer
            </button>
          </div>
          <div className="grid gap-4">
            {offers.map((offer) => (
              <div key={offer.id} className="glass-card p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-foreground">{offer.title}</h3>
                  <p className="text-sm text-muted-foreground">{offer.discount}% Discount • {offer.active ? "Active" : "Inactive"}</p>
                </div>
                <button onClick={() => { if (confirm("Delete Offer?")) deleteOffer(offer.id); }} className="p-2 text-destructive hover:bg-destructive/10 rounded">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Reviews</h2>
          <div className="space-y-4 animate-stagger">
            {reviews.map((review) => (
              <div key={review.id} className="glass-card p-4 rounded-lg flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-foreground">{review.name}</span>
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{review.comment}</p>
                  <p className="text-xs text-muted-foreground mt-1">Product ID: {review.productId} • {review.date}</p>
                </div>
                <button onClick={() => { if (confirm("Delete Review?")) deleteReview(review.id); }} className="p-2 text-destructive hover:bg-destructive/10 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
