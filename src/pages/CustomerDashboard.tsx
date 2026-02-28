import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, User, Settings, ArrowRight, Package, Heart, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useEffect, useState } from "react";

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const { fetchMyOrders } = useData();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            // In a real app we'd fetch actual orders from DB
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    }, [user]);

    if (!user) return null;

    const stats = [
        { label: "Total Orders", value: "0", icon: ShoppingBag, color: "bg-blue-500" },
        { label: "Wishlist Items", value: "0", icon: Heart, color: "bg-pink-500" },
        { label: "Account Status", value: "Active", icon: User, color: "bg-green-500" },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl gradient-dark flex items-center justify-center text-3xl text-white shadow-2xl shadow-primary/20">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Welcome, {user.name}!</h1>
                        <p className="text-muted-foreground font-medium">Customer Dashboard · {user.email}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => logout()} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary text-foreground font-bold hover:bg-destructive hover:text-white transition-all">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-card p-6 rounded-[2rem] flex items-center gap-5 border border-white/60 shadow-xl shadow-primary/5">
                        <div className={`w-14 h-14 rounded-2xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                            <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-black text-foreground">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Links */}
                <div className="glass-card rounded-[2.5rem] p-8 border border-white/60 shadow-2xl shadow-primary/10">
                    <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-3">
                        <Package className="w-6 h-6 text-primary" /> My Account
                    </h3>
                    <div className="space-y-4">
                        <Link to="/my-orders" className="flex items-center justify-between p-5 rounded-2xl bg-white/60 border border-white hover:border-primary/30 hover:shadow-lg transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-black text-foreground">Order History</p>
                                    <p className="text-xs text-muted-foreground">View your past orders</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link to="/profile" className="flex items-center justify-between p-5 rounded-2xl bg-white/60 border border-white hover:border-primary/30 hover:shadow-lg transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="font-black text-foreground">My Profile</p>
                                    <p className="text-xs text-muted-foreground">Manage your personal info</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Promotion / Offers */}
                <div className="gradient-purple rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-3xl font-black mb-4">Exclusive Member Benefits!</h3>
                            <p className="text-white/80 font-medium mb-6">Enjoy special discounts and priority support as a premium AARO member.</p>
                        </div>
                        <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-2xl font-black hover:scale-105 transition-transform w-fit shadow-xl">
                            Shop Now <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                    <Sparkles className="absolute -top-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
                </div>
            </div>
        </div>
    );
};

const Sparkles = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);

export default CustomerDashboard;
