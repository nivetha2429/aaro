import { useState, useEffect } from "react";
import { Package, Layers, Tag, ShoppingBag, Plus } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "/api";

interface OverviewTabProps {
  onQuickAction: (tab: string, action?: string) => void;
}

const OverviewTab = ({ onQuickAction }: OverviewTabProps) => {
  const { products, categories, offers } = useData();
  const { token } = useAuth();
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/admin?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrderCount(data.total || 0);
        }
      } catch {
        // silently fail — non-critical
      }
    };
    if (token) fetchOrderCount();
  }, [token]);

  const stats = [
    { label: "Total Products", val: products.length, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Categories", val: categories.length, icon: Layers, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Active Offers", val: offers.filter(o => o.active).length, icon: Tag, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Total Orders", val: orderCount, icon: ShoppingBag, color: "text-green-500", bg: "bg-green-50" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3">
        {stats.map((s, i) => (
          <Card key={i} className="border-none shadow-sm rounded-lg sm:rounded-2xl group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-2.5 sm:p-3 md:p-4">
              <div className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-2 md:mb-3 transition-transform group-hover:scale-110`}>
                <s.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <p className="text-[9px] md:text-[11px] font-bold text-[#a3acb9] uppercase tracking-wider mb-0.5">{s.label}</p>
              <h4 className="text-base md:text-xl font-black text-[#1a1f36]">{s.val}</h4>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-none shadow-sm rounded-lg sm:rounded-2xl p-2.5 sm:p-4">
        <CardTitle className="mb-2 sm:mb-3 font-bold text-[#1a1f36] text-sm sm:text-base">Quick Actions</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onQuickAction("orders")} className="gradient-dark text-white rounded-lg font-bold text-[11px] h-8"><ShoppingBag className="w-3.5 h-3.5 mr-1.5" />View Orders</Button>
          <Button onClick={() => onQuickAction("products", "add")} className="gradient-purple text-white rounded-lg font-bold text-[11px] h-8"><Plus className="w-3.5 h-3.5 mr-1.5" />Add Product</Button>
          <Button onClick={() => onQuickAction("categories", "add-category")} variant="outline" className="rounded-lg font-bold text-[11px] h-8"><Plus className="w-3.5 h-3.5 mr-1.5" />Add Category</Button>
          <Button onClick={() => onQuickAction("offers", "add-offer")} variant="outline" className="rounded-lg font-bold text-[11px] h-8"><Plus className="w-3.5 h-3.5 mr-1.5" />New Offer</Button>
        </div>
      </Card>
    </div>
  );
};

export default OverviewTab;
