import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Package, Smartphone, LogOut, LayoutDashboard, Menu, Bell, Layers, Star, Tag, Image, ShoppingBag, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import OverviewTab from "./OverviewTab";
import ProductsTab from "./ProductsTab";
import CategoriesTab from "./CategoriesTab";
import FeaturedTab from "./FeaturedTab";
import OffersTab from "./OffersTab";
import BannersTab from "./BannersTab";
import OrdersTab from "./OrdersTab";
import UsersTab from "./UsersTab";

const SIDEBAR_ITEMS = [
  { id: "overview", icon: LayoutDashboard, label: "Overview" },
  { id: "orders", icon: ShoppingBag, label: "Orders" },
  { id: "products", icon: Package, label: "Inventory" },
  { id: "categories", icon: Layers, label: "Categories & Brands" },
  { id: "featured", icon: Star, label: "Featured" },
  { id: "offers", icon: Tag, label: "Popup Offer" },
  { id: "banners", icon: Image, label: "Banners" },
  { id: "users", icon: Users, label: "Users" },
];

const AdminDashboard = () => {
  const { user, logout: authLogout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem("aaro_admin_tab") || "overview");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("aaro_token")) navigate("/login");
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  useEffect(() => {
    sessionStorage.setItem("aaro_admin_tab", activeTab);
  }, [activeTab]);

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
      <aside className={`fixed inset-y-0 left-0 z-50 w-[75vw] max-w-60 bg-white border-r border-[#eaedf3] transform transition-transform duration-300 ease-in-out xl:relative xl:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-dark flex items-center justify-center shadow-md">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-black text-[#1a1f36]">AARO<span className="text-primary italic">Admin</span></span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="xl:hidden p-1.5 text-[#a3acb9] hover:text-primary"><X className="w-5 h-5" /></button>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto pr-1">
            {SIDEBAR_ITEMS.map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); if (window.innerWidth < 1280) setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === item.id ? "bg-primary text-white shadow-md shadow-primary/25" : "text-[#4f566b] hover:bg-[#f4f7fa]"}`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/5 transition-colors border-t border-[#eaedf3] pt-4">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-12 xl:h-14 bg-white border-b border-[#eaedf3] px-3 sm:px-4 xl:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className={`xl:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#a3acb9] hover:bg-secondary rounded-xl ${isSidebarOpen ? 'hidden' : 'block'}`}>
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-[#1a1f36] capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-1.5 text-[#a3acb9] hover:text-primary">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full border border-white" />
            </button>
            <div className="flex items-center gap-2 border-l border-[#eaedf3] pl-3 relative">
              {isProfileOpen && <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />}
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center font-bold text-primary text-[10px] relative z-50">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </button>
              <div className={`absolute right-4 top-full mt-1 w-44 bg-white border border-[#eaedf3] rounded-xl shadow-xl py-1.5 transition-all transform origin-top-right z-50 ${isProfileOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
                <div className="px-3 py-1.5 border-b border-[#eaedf3] mb-1">
                  <p className="text-[11px] font-bold text-[#1a1f36] truncate">{user?.name}</p>
                  <p className="text-[9px] text-[#7a869a] truncate">{user?.email}</p>
                </div>
                <Link to="/" className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-[#4f566b] hover:bg-[#f8f9fc]" onClick={() => setIsProfileOpen(false)}>
                  <Smartphone className="w-3.5 h-3.5 text-primary" /> View Store
                </Link>
                <button onClick={() => { setIsProfileOpen(false); handleLogout(); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-destructive hover:bg-destructive/5 transition-colors">
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-5 lg:p-6 bg-[#f8f9fc]">
          <div className="space-y-4 animate-fade-in mb-6">
            {activeTab === "overview" && <OverviewTab onQuickAction={handleQuickAction} />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "products" && <ProductsTab pendingAction={pendingAction} onActionHandled={clearPendingAction} />}
            {activeTab === "categories" && <CategoriesTab pendingAction={pendingAction} onActionHandled={clearPendingAction} />}
            {activeTab === "featured" && <FeaturedTab />}
            {activeTab === "offers" && <OffersTab />}
            {activeTab === "banners" && <BannersTab />}
            {activeTab === "users" && <UsersTab />}
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
