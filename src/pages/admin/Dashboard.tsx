import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Package, Smartphone, LogOut, LayoutDashboard, Menu, Bell, Layers, Star, Tag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import OverviewTab from "./OverviewTab";
import ProductsTab from "./ProductsTab";
import CategoriesTab from "./CategoriesTab";
import FeaturedTab from "./FeaturedTab";
import OffersTab from "./OffersTab";

const SIDEBAR_ITEMS = [
  { id: "overview", icon: LayoutDashboard, label: "Overview" },
  { id: "products", icon: Package, label: "Inventory" },
  { id: "categories", icon: Layers, label: "Categories & Brands" },
  { id: "featured", icon: Star, label: "Featured" },
  { id: "offers", icon: Tag, label: "Offers" },
];

const AdminDashboard = () => {
  const { user, logout: authLogout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeTab, setActiveTab] = useState("overview");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("aaro_token")) navigate("/login");
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  const handleLogout = () => { authLogout(); navigate("/"); toast.info("Logged out."); };

  const handleQuickAction = (tab: string, action?: string) => {
    setActiveTab(tab);
    if (action) setPendingAction(action);
  };

  const clearPendingAction = () => setPendingAction(null);

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex overflow-hidden font-sans">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 xl:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#eaedf3] transform transition-transform duration-300 ease-in-out xl:relative xl:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-dark flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-[#1a1f36]">AARO<span className="text-primary italic">Admin</span></span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="xl:hidden p-2 text-[#a3acb9] hover:text-primary"><X className="w-6 h-6" /></button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
            {SIDEBAR_ITEMS.map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); if (window.innerWidth < 1280) setIsSidebarOpen(false); }}
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
        <header className="h-14 xl:h-20 bg-white border-b border-[#eaedf3] px-3 sm:px-4 xl:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`xl:hidden p-2 text-[#a3acb9] hover:bg-secondary rounded-xl ${isSidebarOpen ? 'hidden' : 'block'}`}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-base sm:text-xl font-black text-[#1a1f36] capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-[#a3acb9] hover:text-primary">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 border-l border-[#eaedf3] pl-4 relative">
              {isProfileOpen && <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />}
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
                <button onClick={() => { setIsProfileOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/5 transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-[#f8f9fc]">
          <div className="space-y-6 animate-fade-in mb-10">
            {activeTab === "overview" && <OverviewTab onQuickAction={handleQuickAction} />}
            {activeTab === "products" && <ProductsTab pendingAction={pendingAction} onActionHandled={clearPendingAction} />}
            {activeTab === "categories" && <CategoriesTab pendingAction={pendingAction} onActionHandled={clearPendingAction} />}
            {activeTab === "featured" && <FeaturedTab />}
            {activeTab === "offers" && <OffersTab pendingAction={pendingAction} onActionHandled={clearPendingAction} />}
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eaedf3; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
