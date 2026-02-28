import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Package, Truck, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const MyOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { token, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) fetchOrders();
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setOrders(data);
            } else {
                toast.error("Failed to load orders");
            }
        } catch (err) {
            toast.error("Connection error");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Pending": return <Clock className="w-4 h-4 text-orange-500" />;
            case "Processing": return <Package className="w-4 h-4 text-blue-500" />;
            case "Shipped": return <Truck className="w-4 h-4 text-primary" />;
            case "Delivered": return <CheckCircle className="w-4 h-4 text-green-500" />;
            default: return null;
        }
    };

    if (loading) return <div className="container mx-auto p-12 text-center animate-pulse text-muted-foreground">Loading your orders...</div>;

    return (
        <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-4xl animate-fade-in">
            <h1 className="text-3xl font-bold mb-8 text-foreground">My Orders</h1>

            {orders.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground mb-4 font-medium">You haven't placed any orders yet.</p>
                    <a href="/shop" className="gradient-purple text-primary-foreground px-6 py-2.5 rounded-xl font-medium">Start Shopping</a>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:shadow-lg transition-shadow">
                            <div className="p-6 bg-secondary/30 flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Order ID</p>
                                    <p className="text-sm font-mono text-foreground">#{order._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Placed on</p>
                                    <p className="text-sm text-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-border">
                                    {getStatusIcon(order.status)}
                                    <span className="text-sm font-bold text-foreground">{order.status}</span>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                    {order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 border-b border-border/50 pb-3 last:border-0">
                                            {/* Product Image */}
                                            <div className="w-16 h-16 rounded-xl bg-secondary/50 border border-border flex items-center justify-center shrink-0 overflow-hidden">
                                                {item.product?.images?.[0] ? (
                                                    <img
                                                        src={item.product.images[0]}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-contain p-1"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = "none";
                                                            e.currentTarget.parentElement!.innerHTML = item.product?.category === "phone" ? "📱" : "💻";
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-2xl">{item.product?.category === "phone" ? "📱" : "💻"}</span>
                                                )}
                                            </div>
                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{item.product?.name}</p>
                                                {(item.ram || item.storage || item.color) && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {[item.ram, item.storage, item.color].filter(Boolean).join(" / ")}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="text-sm font-black text-primary shrink-0">
                                                ₹{((item.price ?? item.product?.price ?? 0) * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-muted-foreground text-sm font-medium">Total Amount</span>
                                    <span className="text-xl font-bold text-primary">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
