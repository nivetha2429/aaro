import { useState } from "react";
import { Trash2, Plus, X, Package, Star, Search } from "lucide-react";
import { useData } from "@/context/DataContext";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const FeaturedTab = () => {
  const { products, updateProduct } = useData();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const featured = products.filter(p => p.featured);
  const available = products.filter(p => !p.featured && (p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())));

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-4 rounded-lg sm:rounded-2xl shadow-sm">
          <div><h3 className="text-sm sm:text-base font-bold text-[#1a1f36]">Featured Products</h3><p className="text-[10px] sm:text-xs text-[#7a869a]">Manage frontpage featured products</p></div>
          <Button onClick={() => setShowModal(true)} className="gradient-dark rounded-2xl h-8 sm:h-9 px-3 sm:px-5 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider text-white shadow-lg w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />Add Featured
          </Button>
        </div>

        <Card className="border-none shadow-sm rounded-lg sm:rounded-3xl p-3 sm:p-6 bg-transparent">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-primary flex items-center gap-2 text-sm"><Star className="w-5 h-5 fill-primary" /> Currently Featured</h4>
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">{featured.length} Items</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {featured.map(p => (
              <div key={p.id} className="flex flex-col p-2 sm:p-4 rounded-lg sm:rounded-3xl bg-white shadow-sm hover:shadow-md transition-all border border-[#eaedf3] group relative overflow-hidden">
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button onClick={() => updateProduct({ ...p, featured: false })} variant="default" size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 bg-destructive hover:bg-destructive/90 text-white shadow-lg rounded-xl">
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl bg-[#f8f9fc] border border-[#eaedf3] flex items-center justify-center p-1 sm:p-2 mt-1 sm:mt-2 mb-2 sm:mb-4 shrink-0 overflow-hidden">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" loading="lazy" /> : <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#a3acb9]" />}
                </div>
                <div className="text-center">
                  <p className="text-[11px] sm:text-sm font-bold text-[#1a1f36] line-clamp-1 mb-1">{p.name}</p>
                  <Badge variant="outline" className="text-[8px] sm:text-[9px] text-[#7a869a] uppercase font-black">{p.brand}</Badge>
                </div>
              </div>
            ))}
            {featured.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-[#eaedf3]">
                <Star className="w-12 h-12 text-[#eaedf3] mx-auto mb-4" />
                <p className="text-sm font-bold text-[#1a1f36] mb-1">No featured products yet.</p>
                <p className="text-xs text-[#7a869a]">Click "Add Featured" to highlight items on your frontpage.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ADD FEATURED MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#eaedf3]">
              <div>
                <h3 className="text-base font-bold text-[#1a1f36]">Select Product to Feature</h3>
                <p className="text-xs text-[#7a869a]">Search and choose from all category products</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-[#a3acb9] hover:text-primary transition-colors bg-[#f8f9fc] rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 border-b border-[#eaedf3] bg-[#f8f9fc]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#a3acb9]" />
                <Input placeholder="Search all products by name or brand..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full h-12 pl-10 rounded-2xl border-none shadow-sm text-sm font-bold bg-white focus-visible:ring-2 focus-visible:ring-primary/20" />
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-white">
              {available.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border border-[#eaedf3] hover:border-primary/30 hover:bg-[#f8f9fc] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 border border-[#eaedf3] p-1 shadow-sm">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" loading="lazy" /> : <Package className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1f36] line-clamp-1">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[9px] uppercase font-black tracking-widest">{p.category}</Badge>
                        <span className="text-[10px] text-[#7a869a] font-bold">{p.brand}</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => { updateProduct({ ...p, featured: true }); toast.success(`${p.name} featured!`); }}
                    variant="outline" size="sm"
                    className="h-9 px-4 text-xs font-black shrink-0 text-primary border-primary/20 hover:bg-primary hover:text-white rounded-xl uppercase tracking-widest transition-all">
                    Feature
                  </Button>
                </div>
              ))}
              {available.length === 0 && (
                <div className="py-16 text-center">
                  <Package className="w-12 h-12 text-[#eaedf3] mx-auto mb-4" />
                  <p className="text-sm font-bold text-[#7a869a]">No matching products found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeaturedTab;
