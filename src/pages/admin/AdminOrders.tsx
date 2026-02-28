import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Filter, Package } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterYear, setFilterYear] = useState<string>("all");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const { token, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAdmin) fetchAllOrders();
    }, [isAdmin]);

    const fetchAllOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setOrders(data);
            } else {
                toast.error("Access denied");
            }
        } catch {
            toast.error("Connection error");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (response.ok) {
                toast.success(`Order ${newStatus}`);
                setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch {
            toast.error("Update failed");
        }
    };

    const availableYears = [...new Set(orders.map(o => new Date(o.createdAt).getFullYear().toString()))].sort((a, b) => Number(b) - Number(a));

    const filteredOrders = orders.filter(order => {
        if (filterYear !== "all" && new Date(order.createdAt).getFullYear().toString() !== filterYear) return false;
        if (filterCategory !== "all" && !order.items.some((i: any) => i.product?.category === filterCategory)) return false;
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Delivered": return "bg-green-500/10 text-green-600 border border-green-500/20";
            case "Shipped": return "bg-blue-500/10 text-blue-600 border border-blue-500/20";
            case "Processing": return "bg-orange-500/10 text-orange-600 border border-orange-500/20";
            case "Cancelled": return "bg-red-500/10 text-red-600 border border-red-500/20";
            default: return "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20";
        }
    };

    if (!isAdmin) return <div className="p-12 text-center text-red-500 font-bold">Unauthorized Access</div>;
    if (loading) return <div className="p-12 text-center animate-pulse text-muted-foreground">Fetching all orders...</div>;

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-xl bg-secondary hover:bg-border transition-colors border border-border"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-foreground">Order Management</h1>
                        <p className="text-xs text-muted-foreground">
                            {filteredOrders.length} of {orders.length} orders
                            {(filterYear !== "all" || filterCategory !== "all") ? " (filtered)" : ""}
                        </p>
                    </div>
                </div>
                <button onClick={fetchAllOrders} className="p-2.5 rounded-xl bg-secondary hover:bg-border transition-colors border border-border">
                    <RefreshCw className="w-4 h-4 text-foreground" />
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Filter className="w-3.5 h-3.5" /> Filter:
                </div>
                <select
                    value={filterYear}
                    onChange={e => setFilterYear(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-border bg-secondary text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                >
                    <option value="all">All Years</option>
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-border bg-secondary text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                >
                    <option value="all">All Categories</option>
                    <option value="phone">Phones</option>
                    <option value="laptop">Laptops</option>
                </select>
                {(filterYear !== "all" || filterCategory !== "all") && (
                    <button
                        onClick={() => { setFilterYear("all"); setFilterCategory("all"); }}
                        className="h-9 px-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs font-bold hover:bg-destructive/10 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-card border border-border rounded-3xl">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="font-bold text-muted-foreground">No orders match the selected filters</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-soft">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-secondary/50 text-xs uppercase tracking-tighter font-bold text-muted-foreground border-b border-border">
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Order Items</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-foreground">{order.userId?.name || "Deleted User"}</p>
                                            <p className="text-xs text-muted-foreground">{order.userId?.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.items.map((item: any, i: number) => (
                                                <p key={i} className="text-xs text-muted-foreground">
                                                    {item.product?.name || "—"} ×{item.quantity}
                                                </p>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-primary">₹{order.totalAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                                className="bg-secondary text-xs font-bold rounded-lg border border-border p-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
