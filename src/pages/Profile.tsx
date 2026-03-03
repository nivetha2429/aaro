import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, Package, ShoppingBag, Edit2, Check, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
    const { user, token, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || ""
    });

    const API_URL = import.meta.env.VITE_API_URL || "/api";

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone || ""
            });
        }
    }, [user]);

    if (!user) return null;

    const handleSave = async () => {
        if (!formData.name || !formData.email || !formData.phone) {
            return toast.error("Please fill in all fields");
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                updateUser(data.user);
                setIsEditing(false);
                toast.success("Profile updated successfully!");
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const details = [
        { label: "Full Name", value: formData.name, key: "name", icon: User, type: "text" },
        { label: "Email Address", value: formData.email, key: "email", icon: Mail, type: "email" },
        { label: "Phone Number", value: formData.phone, key: "phone", icon: Phone, type: "tel" },
    ];

    return (
        <div className="container mx-auto px-4 py-12 pb-24 md:pb-12 max-w-4xl animate-fade-in text-black">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar/Welcome */}
                <div className="lg:w-1/3 text-center lg:text-left">
                    <div className="w-24 h-24 rounded-2xl gradient-purple mx-auto lg:mx-0 flex items-center justify-center mb-6 shadow-xl shadow-primary/20 transition-transform hover:scale-105">
                        <span className="text-3xl font-bold text-primary-foreground">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-black mb-2">Hello, {user.name.split(' ')[0]}!</h1>
                    <p className="text-sm text-muted-foreground mb-8">Manage your account details and preferences.</p>

                    <div className="space-y-3">
                        <Link to="/my-orders" className="flex items-center gap-3 w-full p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group">
                            <Package className="w-5 h-5 text-primary" />
                            <span className="text-sm font-semibold">View My Orders</span>
                        </Link>
                        <Link to="/shop" className="flex items-center gap-3 w-full p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                            <span className="text-sm font-semibold">Continue Shopping</span>
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
                        <div className="px-6 py-4 bg-secondary/50 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Account Details</h3>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                                >
                                    <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                                </button>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex items-center gap-1.5 text-xs font-bold text-green-500 hover:text-green-400 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({ name: user.name, email: user.email, phone: user.phone || "" });
                                        }}
                                        disabled={loading}
                                        className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-3.5 h-3.5" /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="divide-y divide-border">
                            {details.map((item, i) => (
                                <div key={i} className="px-6 py-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
                                            {isEditing ? (
                                                <input
                                                    type={item.type}
                                                    value={item.value}
                                                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                                                    className="w-full mt-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                                />
                                            ) : (
                                                <p className="text-sm font-semibold text-black">{item.value || "Not provided"}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-primary">!</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed text-black/70">
                            Your account details are used to pre-fill your order information for a faster checkout experience. Keep them updated to ensure smooth deliveries.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
