import { Link, useNavigate } from "react-router-dom";
import {
  Package, ShoppingCart, Star, Tag, LogOut, LayoutDashboard,
  Pencil, Trash2, X, Plus, Users, TrendingUp, Search,
  Menu, Bell, Settings, ChevronRight, Filter, Download,
  Layers, UserPlus, Eye, CheckCircle2, Clock, BarChart3
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { Product, Offer, Category, Order, Customer } from "@/data/products";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const {
    products, reviews, offers, categories, customers, orders,
    addProduct, updateProduct, deleteProduct,
    addOffer, deleteOffer,
    addCategory, deleteCategory,
    updateOrderStatus, deleteReview
  } = useData();
  const { logout: authLogout } = useAuth();

  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    products.forEach(p => {
      const cat = p.category || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [products]);

  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!localStorage.getItem("aaro_admin")) navigate("/admin");
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  const handleLogout = () => {
    authLogout();
    navigate("/");
    toast.info("Security session ended. Logged out.");
  };

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex overflow-hidden font-sans">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar for Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#eaedf3] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center shadow-lg shadow-primary/20">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-[#1a1f36]">Admin<span className="text-primary italic">Pro</span></span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-[#a3acb9] hover:text-primary">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
            {[
              { id: "overview", icon: LayoutDashboard, label: "Overview" },
              { id: "products", icon: Package, label: "Inventory" },
              { id: "categories", icon: Layers, label: "Categories" },
              { id: "orders", icon: ShoppingCart, label: "Orders" },
              { id: "customers", icon: Users, label: "Customers" },
              { id: "offers", icon: Tag, label: "Marketing" },
              { id: "reviews", icon: Star, label: "Feedback" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-[#4f566b] hover:bg-[#f4f7fa]"}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>

          <button onClick={handleLogout} className="mt-auto flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold text-destructive hover:bg-destructive/5 transition-colors border-t border-[#eaedf3] pt-6">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-[72px] lg:h-20 bg-white border-b border-[#eaedf3] px-4 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-2 text-[#a3acb9] hover:bg-secondary rounded-xl transition-colors ${isSidebarOpen ? 'hidden' : 'block'}`}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg lg:text-xl font-black text-[#1a1f36] capitalize truncate max-w-[150px] lg:max-w-none">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            <button className="relative p-2 text-[#a3acb9] hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 border-l border-[#eaedf3] pl-3 lg:pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-[#1a1f36] leading-none mb-1">Master Admin</p>
                <p className="text-[10px] font-bold text-[#7a869a]">Store Manager</p>
              </div>
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs tracking-tighter">MA</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar bg-[#f8f9fc]">
          <Tabs value={activeTab} className="space-y-6 lg:space-y-8 animate-fade-in mb-10">

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6 lg:space-y-8 mt-0 outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                  { label: "Sales", val: "₹1.4M", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
                  { label: "Products", val: products.length, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
                  { label: "Orders", val: orders.length, icon: ShoppingCart, color: "text-orange-500", bg: "bg-orange-50" },
                  { label: "Users", val: customers.length, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
                ].map((s, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-2xl lg:rounded-3xl group hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-5 lg:p-6">
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-3 lg:mb-4 transition-transform group-hover:scale-110`}><s.icon className="w-5 h-5 lg:w-6 lg:h-6" /></div>
                      <p className="text-[9px] lg:text-[10px] font-black text-[#a3acb9] uppercase tracking-widest mb-1">{s.label}</p>
                      <h4 className="text-xl lg:text-2xl font-black text-[#1a1f36]">{s.val}</h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8">
                  <CardTitle className="mb-6 text-lg lg:text-xl font-black">Recent Orders</CardTitle>
                  <div className="space-y-3 lg:space-y-4">
                    {orders.slice(0, 3).map(o => (
                      <div key={o.id} className="flex items-center justify-between p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white flex items-center justify-center font-bold text-[10px] lg:text-xs">#{o.id.slice(-3)}</div>
                          <div><p className="font-bold text-xs lg:text-sm">{o.customerName}</p><p className="text-[9px] lg:text-[10px] text-muted-foreground">{o.date}</p></div>
                        </div>
                        <p className="font-black text-xs lg:text-sm">₹{o.totalAmount}</p>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8 hidden sm:block">
                  <CardTitle className="mb-6 text-lg lg:text-xl font-black">Performance Highlights</CardTitle>
                  <div className="flex flex-col justify-center h-40 lg:h-48 text-center text-muted-foreground italic font-medium text-sm">Real-time charts powered by AdminPro™ Analytics</div>
                </Card>
              </div>
            </TabsContent>

            {/* INVENTORY TAB */}
            <TabsContent value="products" className="mt-0 space-y-4 lg:space-y-6 outline-none">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm gap-4">
                <div><h3 className="text-lg lg:text-xl font-black text-[#1a1f36]">Inventory Manager</h3><p className="text-[10px] lg:text-xs font-medium text-[#7a869a]">Manage your stock and listing details</p></div>
                <Button onClick={() => { setEditingProduct(null); setFormData({}); setShowProductForm(true); }} className="gradient-purple rounded-xl lg:rounded-2xl h-11 lg:h-12 px-6 lg:px-8 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">Add Product</Button>
              </div>
              <Card className="border-none shadow-sm rounded-2xl lg:rounded-3xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-[#f8f9fc] text-[10px] font-black uppercase text-[#a3acb9] tracking-widest border-b border-[#eaedf3]"><tr className="h-12 lg:h-14">
                      <th className="px-6 lg:px-8">Item Details</th><th className="px-6 lg:px-8">Brand</th><th className="px-6 lg:px-8">Category</th><th className="px-6 lg:px-8">Price</th><th className="px-6 lg:px-8 text-right">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-[#eaedf3]">
                      {Object.entries(groupedProducts).map(([catName, catProducts]) => (
                        <>
                          <tr key={`header-${catName}`} className="bg-secondary/20 h-10">
                            <td colSpan={5} className="px-6 lg:px-8">
                              <div className="flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-tighter text-primary">{catName}</span>
                                <Badge variant="secondary" className="h-4 px-1.5 text-[8px] rounded-sm">{catProducts.length} Items</Badge>
                              </div>
                            </td>
                          </tr>
                          {catProducts.map(p => (
                            <tr key={p.id} className="group hover:bg-[#f8f9fc] transition-colors h-16 lg:h-20">
                              <td className="px-6 lg:px-8 font-bold text-[#1a1f36] text-sm">{p.name}</td>
                              <td className="px-6 lg:px-8 font-semibold text-[#7a869a] text-xs">{p.brand}</td>
                              <td className="px-6 lg:px-8"><Badge variant="outline" className="rounded-lg py-0.5 lg:py-1 px-2 lg:px-3 border-[#eaedf3] text-[9px] lg:text-[10px] font-black uppercase tracking-widest">{p.category}</Badge></td>
                              <td className="px-6 lg:px-8 font-black text-[#1a1f36] text-sm">₹{p.price.toLocaleString()}</td>
                              <td className="px-6 lg:px-8 text-right space-x-1 lg:space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setFormData(p); setShowProductForm(true); }} className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg lg:rounded-xl hover:bg-primary/10 hover:text-primary transition-all"><Pencil className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)} className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg lg:rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"><Trash2 className="w-3.5 h-3.5" /></Button>
                              </td>
                            </tr>
                          ))}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* CATEGORIES TAB */}
            <TabsContent value="categories" className="mt-0 space-y-6 outline-none">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-6 rounded-2xl lg:rounded-3xl shadow-sm gap-4">
                <div><h3 className="text-xl font-black text-[#1a1f36]">Categories</h3><p className="text-xs font-medium text-[#7a869a]">Group products for better navigation</p></div>
                <Button onClick={() => toast.info("Category creation coming soon!")} className="gradient-purple rounded-xl lg:rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest">New Category</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(c => (
                  <Card key={c.id} className="border-none shadow-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8 group hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Layers className="w-5 h-5 lg:w-6 lg:h-6" /></div>
                      <Badge className="bg-primary/10 text-primary border-none rounded-lg text-[10px]">{c.productCount} Items</Badge>
                    </div>
                    <h4 className="text-lg lg:text-xl font-black text-[#1a1f36] mb-2">{c.name}</h4>
                    <p className="text-xs lg:text-sm font-medium text-[#7a869a] mb-6 line-clamp-2">{c.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 rounded-xl h-10 text-[10px] font-bold">Edit</Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteCategory(c.id)} className="h-10 w-10 rounded-xl hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ORDERS TAB */}
            <TabsContent value="orders" className="mt-0 space-y-6 outline-none">
              <Card className="border-none shadow-sm rounded-2xl lg:rounded-3xl overflow-hidden p-6 lg:p-8">
                <CardTitle className="mb-6 flex justify-between items-center text-lg lg:text-xl font-black">All Orders <Button size="sm" variant="outline" className="rounded-xl px-4"><Filter className="w-3.5 h-3.5 mr-2" /> <span className="hidden sm:inline">Filter</span></Button></CardTitle>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left min-w-[700px]">
                    <thead className="text-[10px] font-black uppercase text-[#a3acb9] tracking-widest"><tr className="h-10 border-b border-[#eaedf3]">
                      <th className="pb-4">Order ID</th><th className="pb-4">Customer</th><th className="pb-4">Status</th><th className="pb-4">Total</th><th className="pb-4">Action</th>
                    </tr></thead>
                    <tbody className="divide-y divide-[#eaedf3]">
                      {orders.map(o => (
                        <tr key={o.id} className="h-16 lg:h-20 hover:bg-secondary/10 transition-colors">
                          <td className="font-bold text-[10px] lg:text-xs uppercase">#{o.id.slice(-6)}</td>
                          <td><p className="font-bold text-xs lg:text-sm">{o.customerName}</p><p className="text-[9px] lg:text-[10px] text-muted-foreground">{o.date}</p></td>
                          <td><Badge className={`${o.status === "Delivered" ? "bg-green-500" : o.status === "Processing" ? "bg-blue-500" : o.status === "Cancelled" ? "bg-destructive" : "bg-orange-500"} text-white border-none rounded-lg px-2 py-0.5 lg:py-1 text-[9px] lg:text-[10px] font-black uppercase`}>{o.status}</Badge></td>
                          <td className="font-black text-xs lg:text-sm">₹{o.totalAmount}</td>
                          <td>
                            <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value as any)} className="bg-secondary/50 rounded-lg p-1.5 lg:p-2 text-[10px] lg:text-xs font-bold outline-none border-none">
                              {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* CUSTOMERS TAB */}
            <TabsContent value="customers" className="mt-0 space-y-6 outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map(u => (
                  <Card key={u.id} className="border-none shadow-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-center group hover:scale-[1.02] transition-all">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-secondary mx-auto mb-4 lg:mb-6 flex items-center justify-center font-black text-2xl lg:text-3xl text-primary border-4 border-white shadow-md">{u.name.charAt(0)}</div>
                    <h4 className="text-lg lg:text-xl font-black text-[#1a1f36] mb-1">{u.name}</h4>
                    <p className="text-[10px] lg:text-xs font-bold text-[#a3acb9] mb-6 italic truncate">{u.email}</p>
                    <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
                      <div className="bg-secondary/50 p-2.5 lg:p-3 rounded-xl lg:rounded-2xl"><p className="text-[9px] lg:text-[10px] font-black text-primary mb-1 uppercase tracking-widest">Orders</p><p className="font-black text-sm">{u.totalOrders}</p></div>
                      <div className="bg-secondary/50 p-2.5 lg:p-3 rounded-xl lg:rounded-2xl"><p className="text-[9px] lg:text-[10px] font-black text-primary mb-1 uppercase tracking-widest">Joined</p><p className="font-black text-[10px] lg:text-xs">{u.joinedDate.split('-')[1]}/{u.joinedDate.split('-')[0].slice(-2)}</p></div>
                    </div>
                    <Button variant="outline" className="w-full rounded-xl lg:rounded-2xl h-11 lg:h-12 text-xs font-black uppercase tracking-tight hover:bg-primary hover:text-white transition-all">View Profile</Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* MARKETING TAB */}
            <TabsContent value="offers" className="mt-0 space-y-6 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {offers.map(offer => (
                  <Card key={offer.id} className={`border-none shadow-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8 relative overflow-hidden transition-all hover:shadow-lg ${offer.active ? "bg-white" : "bg-[#f4f7fa] opacity-60"}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3.5 lg:p-4 rounded-xl lg:rounded-2xl ${offer.active ? "gradient-purple shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"} text-white`}><Tag className="w-5 h-5 lg:w-6 lg:h-6" /></div>
                      <Badge className={`${offer.active ? "bg-green-500" : "bg-muted"} text-white border-none rounded-lg font-black uppercase text-[9px] lg:text-[10px]`}>{offer.active ? "Active" : "Disabled"}</Badge>
                    </div>
                    <h4 className="text-lg lg:text-xl font-black text-[#1a1f36] mb-2">{offer.title}</h4>
                    <p className="text-xs lg:text-sm font-medium text-[#7a869a] mb-6 line-clamp-2">{offer.description}</p>
                    <div className="flex items-end justify-between">
                      <div className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-secondary/50 border border-dashed border-primary/20"><p className="text-[9px] lg:text-[10px] font-black text-primary uppercase tracking-widest mb-1">Discount</p><p className="text-3xl lg:text-4xl font-black text-primary tracking-tighter">{offer.discount}% <span className="text-xs lg:text-sm font-bold opacity-60 tracking-normal">OFF</span></p></div>
                      <Button variant="ghost" size="icon" onClick={() => deleteOffer(offer.id)} className="h-11 h-11 lg:h-12 lg:w-12 rounded-xl lg:rounded-2xl hover:bg-destructive/10 text-destructive"><Trash2 className="w-5 h-5 lg:w-6 lg:h-6" /></Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reviews Tab Content */}
            <TabsContent value="reviews" className="mt-0 space-y-4 outline-none">
              <div className="grid grid-cols-1 gap-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="border-none shadow-sm rounded-2xl lg:rounded-3xl overflow-hidden group">
                    <CardContent className="p-5 lg:p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-primary/5 flex items-center justify-center">
                            <Users className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-black text-sm lg:text-base text-[#1a1f36]">{review.name}</span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-2.5 h-2.5 lg:w-3 lg:h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-[9px] lg:text-[10px] font-bold text-[#a3acb9] uppercase tracking-widest">{review.date} • ID: {review.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteReview(review.id)} className="h-8 w-8 lg:h-9 lg:w-9 rounded-lg lg:rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="mt-3 lg:mt-4 text-[#4f566b] font-medium leading-relaxed text-xs lg:text-sm">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Product Editor Modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 lg:p-6 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-2xl lg:max-w-3xl rounded-3xl lg:rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in flex flex-col my-8 max-h-[90vh]">
            <div className="p-6 lg:p-10 border-b border-[#eaedf3] flex justify-between items-center bg-[#fcfdfe] shrink-0">
              <div>
                <h3 className="text-xl lg:text-3xl font-black text-[#1a1f36] tracking-tight">{editingProduct ? "Revise Listing" : "Market Entry"}</h3>
                <p className="text-[#a3acb9] font-medium text-[10px] lg:text-sm italic hidden sm:block">Update specifications for the product catalogue.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowProductForm(false)} className="rounded-full h-10 w-10 lg:h-12 lg:w-12 transition-all hover:bg-secondary"><X className="w-5 h-5 lg:w-8 lg:h-8" /></Button>
            </div>
            <form className="p-6 lg:p-10 space-y-6 lg:space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
                <div className="space-y-2"><label className="text-[9px] lg:text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1">Product Title</label><Input required value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} className="rounded-xl lg:rounded-2xl border-[#eaedf3] h-11 lg:h-14 font-bold text-[#1a1f36] text-sm" placeholder="e.g., iPhone 16 Pro Max" /></div>
                <div className="space-y-2"><label className="text-[9px] lg:text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1">Brand</label><Input required value={formData.brand || ""} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="rounded-xl lg:rounded-2xl border-[#eaedf3] h-11 lg:h-14 font-bold text-[#1a1f36] text-sm" placeholder="e.g., Apple" /></div>
                <div className="space-y-2"><label className="text-[9px] lg:text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1">Sale Price</label><Input required type="number" value={formData.price || ""} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="rounded-xl lg:rounded-2xl border-[#eaedf3] h-11 lg:h-14 font-black text-sm" placeholder="Current Price" /></div>
                <div className="space-y-2"><label className="text-[9px] lg:text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1">Category</label>
                  <select
                    required
                    value={formData.category || ""}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl lg:rounded-2xl border-[#eaedf3] h-11 lg:h-14 font-bold text-[#1a1f36] text-sm px-4 bg-white border outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="space-y-2"><label className="text-[9px] lg:text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1">Catalog Price</label><Input required type="number" value={formData.originalPrice || ""} onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })} className="rounded-xl lg:rounded-2xl border-[#eaedf3] h-11 lg:h-14 font-bold text-muted-foreground text-sm" placeholder="Was Price" /></div>
                <div className="space-y-2 md:col-span-2"><label className="text-[9px] lg:text-[10px] font-black uppercase text-[#7a869a] tracking-widest ml-1">Description</label><textarea required rows={4} value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-xl lg:rounded-2xl border-[#eaedf3] p-4 text-xs lg:text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none hover:border-primary/30 transition-all border shadow-sm" placeholder="Craft a compelling story for this product..." /></div>
              </div>
            </form>
            <div className="p-6 lg:p-10 bg-[#f8f9fc] border-t border-[#eaedf3] flex flex-col sm:flex-row gap-4 lg:gap-6 shrink-0">
              <Button variant="ghost" onClick={() => setShowProductForm(false)} className="order-2 sm:order-1 flex-1 h-12 lg:h-14 rounded-xl lg:rounded-2xl font-black uppercase text-[10px] tracking-widest">Abandon Draft</Button>
              <Button onClick={(e) => {
                e.preventDefault();
                const id = editingProduct ? editingProduct.id : `p-${Date.now()}`;
                const pData = { ...formData, id, rating: formData.rating || 4.5, reviewCount: formData.reviewCount || 0, images: [], featured: !!formData.featured, specifications: formData.specifications || [], category: formData.category || "General" } as Product;
                editingProduct ? updateProduct(pData) : addProduct(pData);
                toast.success(editingProduct ? "Listing updated" : "Product launched successfully!");
                setShowProductForm(false);
              }} className="order-1 sm:order-2 flex-1 h-12 lg:h-14 rounded-xl lg:rounded-2xl gradient-purple font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/30">Commit Changes</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eaedf3; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a3acb9; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
