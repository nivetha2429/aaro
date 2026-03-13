import { useState, useEffect, useMemo } from "react";
import { ShoppingBag, Search, ChevronLeft, ChevronRight, IndianRupee, Clock, CheckCircle, ArrowUpDown, Calendar, X, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const API_URL = import.meta.env.VITE_API_URL || "/api";

interface OrderItem {
  product?: { name?: string; brand?: string; id?: string };
  name?: string;
  ram?: string;
  storage?: string;
  color?: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  userId?: { name?: string; email?: string; phone?: string } | string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  status: string;
  createdAt: string;
}

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "bg-amber-50", text: "text-amber-700" },
  Processing: { bg: "bg-blue-50", text: "text-blue-700" },
  Shipped: { bg: "bg-purple-50", text: "text-purple-700" },
  Delivered: { bg: "bg-green-50", text: "text-green-700" },
  Cancelled: { bg: "bg-red-50", text: "text-red-700" },
};

type SortField = "date" | "price" | "status";
type SortDir = "asc" | "desc";
type DateRange = "" | "today" | "week" | "month" | "year";

const OrdersTab = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const limit = 10;

  // Sort & Filter state
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [dateRange, setDateRange] = useState<DateRange>("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`${API_URL}/orders/admin?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_URL}/orders/admin/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getCustomerInfo = (order: Order) => {
    if (typeof order.userId === "object" && order.userId) {
      return { name: order.userId.name || "Unknown", email: order.userId.email || "", phone: order.userId.phone || "" };
    }
    return { name: "Unknown", email: "", phone: "" };
  };

  const getItemSummary = (items: OrderItem[]) => {
    return items.map(i => {
      const name = i.product?.name || i.name || "Item";
      return `${name} ×${i.quantity}`;
    }).join(", ");
  };

  const getDateRangeStart = (range: DateRange): Date | null => {
    if (!range) return null;
    const now = new Date();
    switch (range) {
      case "today": return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case "week": { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
      case "month": { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
      case "year": { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
      default: return null;
    }
  };

  const processedOrders = useMemo(() => {
    let result = [...orders];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o => {
        const customer = getCustomerInfo(o);
        return (
          o._id.toLowerCase().includes(q) ||
          customer.name.toLowerCase().includes(q) ||
          customer.email.toLowerCase().includes(q) ||
          customer.phone.includes(q) ||
          o.shippingAddress.toLowerCase().includes(q)
        );
      });
    }

    const rangeStart = getDateRangeStart(dateRange);
    if (rangeStart) result = result.filter(o => new Date(o.createdAt) >= rangeStart);

    const min = priceMin ? parseFloat(priceMin) : null;
    const max = priceMax ? parseFloat(priceMax) : null;
    if (min !== null) result = result.filter(o => o.totalAmount >= min);
    if (max !== null) result = result.filter(o => o.totalAmount <= max);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "date": cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
        case "price": cmp = a.totalAmount - b.totalAmount; break;
        case "status": cmp = STATUSES.indexOf(a.status as any) - STATUSES.indexOf(b.status as any); break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [orders, search, dateRange, priceMin, priceMax, sortField, sortDir]);

  // Stats
  const totalRevenue = orders.reduce((sum, o) => o.status !== "Cancelled" ? sum + o.totalAmount : sum, 0);
  const pendingCount = orders.filter(o => o.status === "Pending").length;
  const deliveredCount = orders.filter(o => o.status === "Delivered").length;

  const activeFilterCount = [statusFilter, dateRange, priceMin, priceMax].filter(Boolean).length;
  const hasCustomSort = sortField !== "date" || sortDir !== "desc";

  const clearAll = () => {
    setStatusFilter("");
    setDateRange("");
    setPriceMin("");
    setPriceMax("");
    setSortField("date");
    setSortDir("desc");
    setSearch("");
    setPage(1);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-4 rounded-lg sm:rounded-2xl shadow-sm">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#1a1f36]">Orders Management</h3>
          <p className="text-[10px] sm:text-xs text-[#7a869a]">Track and manage all customer orders</p>
        </div>
        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 text-xs">
          {total} Total Orders
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: "Total Orders", value: total, color: "text-primary", icon: ShoppingBag },
          { label: "Pending", value: pendingCount, color: "text-amber-500", icon: Clock },
          { label: "Delivered", value: deliveredCount, color: "text-green-500", icon: CheckCircle },
          { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, color: "text-blue-500", icon: IndianRupee },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-[#eaedf3]">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <p className="text-[10px] text-[#7a869a] font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className={`text-lg sm:text-xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-[#eaedf3] shadow-sm overflow-hidden">
        {/* Search + Status row */}
        <div className="flex flex-col sm:flex-row gap-2 p-3 sm:p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9]" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by customer, order ID, or address..."
              className="pl-10 h-9 rounded-xl border-[#eaedf3] text-xs"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-xl border border-[#eaedf3] px-3 text-xs bg-white text-[#1a1f36] font-medium min-w-[130px]"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Date + Price + Sort row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
          {/* Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#a3acb9] shrink-0" />
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as DateRange)}
              className="h-8 rounded-lg border border-[#eaedf3] px-2.5 text-[11px] font-medium bg-white text-[#1a1f36] min-w-[110px]"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <IndianRupee className="w-3.5 h-3.5 text-[#a3acb9] shrink-0" />
            <input
              type="number"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
              placeholder="Min"
              className="w-20 h-8 rounded-lg border border-[#eaedf3] px-2.5 text-[11px] font-medium text-[#1a1f36] focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
            <span className="text-[10px] text-[#c4c9d4]">–</span>
            <input
              type="number"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              placeholder="Max"
              className="w-20 h-8 rounded-lg border border-[#eaedf3] px-2.5 text-[11px] font-medium text-[#1a1f36] focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#a3acb9] shrink-0" />
            <select
              value={`${sortField}-${sortDir}`}
              onChange={e => {
                const [f, d] = e.target.value.split("-") as [SortField, SortDir];
                setSortField(f);
                setSortDir(d);
              }}
              className="h-8 rounded-lg border border-[#eaedf3] px-2.5 text-[11px] font-medium bg-white text-[#1a1f36] min-w-[130px]"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="status-asc">Status: Pending First</option>
              <option value="status-desc">Status: Delivered First</option>
            </select>
          </div>

          {/* Clear */}
          {(activeFilterCount > 0 || hasCustomSort) && (
            <button onClick={clearAll} className="text-[10px] font-bold text-destructive hover:underline flex items-center gap-0.5 shrink-0 ml-auto">
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {/* Results bar */}
        {!loading && (activeFilterCount > 0 || hasCustomSort || search) && (
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#f8f9fc] border-t border-[#eaedf3]">
            <Filter className="w-3 h-3 text-[#a3acb9]" />
            <span className="text-[10px] font-bold text-[#7a869a]">
              {processedOrders.length} result{processedOrders.length !== 1 ? "s" : ""} found
            </span>
          </div>
        )}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#7a869a]">Loading orders...</p>
        </div>
      ) : processedOrders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#eaedf3]">
          <ShoppingBag className="w-12 h-12 text-[#eaedf3] mx-auto mb-4" />
          <p className="text-sm font-bold text-[#1a1f36] mb-1">No orders found</p>
          <p className="text-xs text-[#7a869a]">
            {activeFilterCount > 0 || search ? "Try adjusting your filters or search." : "Orders will appear here when customers place them."}
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {processedOrders.map(order => {
            const customer = getCustomerInfo(order);
            const style = STATUS_STYLES[order.status] || STATUS_STYLES.Pending;
            return (
              <div key={order._id} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#eaedf3] hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShoppingBag className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-bold text-[#1a1f36] truncate">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className="text-[10px] text-[#7a869a]">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${style.bg} ${style.text}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-[10px] text-[#7a869a] font-bold uppercase tracking-wider mb-0.5">Customer</p>
                    <p className="text-xs font-bold text-[#1a1f36]">{customer.name}</p>
                    {customer.phone && <p className="text-[10px] text-[#7a869a]">{customer.phone}</p>}
                    {customer.email && <p className="text-[10px] text-[#7a869a] truncate">{customer.email}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] text-[#7a869a] font-bold uppercase tracking-wider mb-0.5">Items</p>
                    <p className="text-xs text-[#4f566b] line-clamp-2">{getItemSummary(order.items)}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-[10px] text-[#7a869a] font-bold uppercase tracking-wider mb-0.5">Delivery Address</p>
                  <p className="text-xs text-[#4f566b] line-clamp-1">{order.shippingAddress}</p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#eaedf3]">
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm sm:text-base font-black text-primary">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order._id, e.target.value)}
                    disabled={updatingId === order._id}
                    className={`h-8 rounded-lg border border-[#eaedf3] px-2 text-[11px] font-bold bg-white ${style.text} disabled:opacity-50`}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-[#eaedf3] px-4 py-3 shadow-sm">
          <p className="text-[10px] font-bold text-[#7a869a]">
            Page {page} of {pages} · {total} orders
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="w-7 h-7 rounded-lg border border-[#eaedf3] flex items-center justify-center text-[10px] font-bold text-[#7a869a] hover:text-primary hover:border-primary/30 disabled:opacity-30 transition-all"
            >
              1
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 rounded-lg border border-[#eaedf3] flex items-center justify-center text-[#7a869a] hover:text-primary hover:border-primary/30 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              let p: number;
              if (pages <= 5) {
                p = i + 1;
              } else if (page <= 3) {
                p = i + 1;
              } else if (page >= pages - 2) {
                p = pages - 4 + i;
              } else {
                p = page - 2 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${page === p ? "bg-primary text-white shadow-sm" : "border border-[#eaedf3] text-[#4f566b] hover:border-primary/30 hover:text-primary"}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="w-7 h-7 rounded-lg border border-[#eaedf3] flex items-center justify-center text-[#7a869a] hover:text-primary hover:border-primary/30 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(pages)}
              disabled={page === pages}
              className="w-7 h-7 rounded-lg border border-[#eaedf3] flex items-center justify-center text-[10px] font-bold text-[#7a869a] hover:text-primary hover:border-primary/30 disabled:opacity-30 transition-all"
            >
              {pages}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
