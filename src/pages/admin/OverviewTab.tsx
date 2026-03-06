import { Package, Layers, Tag, TrendingUp, Plus } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";

interface OverviewTabProps {
  onQuickAction: (tab: string, action?: string) => void;
}

const OverviewTab = ({ onQuickAction }: OverviewTabProps) => {
  const { products, categories, offers } = useData();

  const stats = [
    { label: "Total Products", val: products.length, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Categories", val: categories.length, icon: Layers, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Active Offers", val: offers.filter(o => o.active).length, icon: Tag, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Catalog Value", val: "₹0", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl group hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 md:p-6 lg:p-6">
              <div className={`w-10 h-10 md:w-14 md:h-14 shrink-0 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-3 md:mb-5 transition-transform group-hover:scale-110`}>
                <s.icon className="w-5 h-5 md:w-7 md:h-7" />
              </div>
              <p className="text-[10px] md:text-xs font-black text-[#a3acb9] uppercase tracking-widest mb-0.5 md:mb-1">{s.label}</p>
              <h4 className="text-lg md:text-3xl lg:text-2xl font-black text-[#1a1f36]">{s.val}</h4>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-none shadow-sm rounded-3xl p-4 sm:p-6">
        <CardTitle className="mb-3 sm:mb-4 font-black text-[#1a1f36] text-base sm:text-lg">Quick Actions</CardTitle>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onQuickAction("products", "add")} className="gradient-dark text-white rounded-xl font-black text-xs"><Plus className="w-4 h-4 mr-2" />Add Product</Button>
          <Button onClick={() => onQuickAction("categories", "add-category")} className="gradient-purple text-white rounded-xl font-black text-xs"><Plus className="w-4 h-4 mr-2" />Add Category</Button>
          <Button onClick={() => onQuickAction("offers", "add-offer")} variant="outline" className="rounded-xl font-black text-xs"><Plus className="w-4 h-4 mr-2" />New Offer</Button>
        </div>
      </Card>
    </div>
  );
};

export default OverviewTab;
