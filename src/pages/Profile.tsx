import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { User, Mail, Phone, Package, ShoppingBag, Edit2, Check, X, Loader2, LayoutDashboard, Save, Image, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/lib/schemas";
import { ImageUpload } from "@/components/ImageUpload";
import fallbackLogo from "@/assets/logo.png";
import PageMeta from "@/components/PageMeta";

const Profile = () => {
    const { user, token, updateUser, isAdmin } = useAuth();
    const { contactSettings, updateContactSettings } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState(contactSettings.logoUrl || "");
    const [logoSaving, setLogoSaving] = useState(false);

    const handleLogoSave = async () => {
        setLogoSaving(true);
        try {
            await updateContactSettings({ ...contactSettings, logoUrl });
            toast.success("Logo updated!");
        } catch (err: any) {
            toast.error(err.message || "Failed to save logo");
        } finally {
            setLogoSaving(false);
        }
    };

    const handleLogoDelete = async () => {
        setLogoSaving(true);
        try {
            await updateContactSettings({ ...contactSettings, logoUrl: "" });
            setLogoUrl("");
            toast.success("Logo removed! Default logo restored.");
        } catch (err: any) {
            toast.error(err.message || "Failed to remove logo");
        } finally {
            setLogoSaving(false);
        }
    };

    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user?.name || "", email: user?.email || "", phone: user?.phone || "" },
    });

    const formValues = watch();

    const API_URL = import.meta.env.VITE_API_URL || "/api";

    useEffect(() => {
        if (user) {
            reset({ name: user.name, email: user.email, phone: user.phone || "" });
        }
    }, [user, reset]);

    if (!user) return null;

    const onSubmit = async (formData: ProfileFormData) => {
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
        { label: "Full Name", key: "name" as const, icon: User, type: "text" },
        { label: "Email Address", key: "email" as const, icon: Mail, type: "email" },
        { label: "Phone Number", key: "phone" as const, icon: Phone, type: "tel" },
    ];

    return (
        <div className="w-full section-px py-4 sm:py-6 pb-24 lg:pb-6 max-w-4xl animate-fade-in text-black">
            <PageMeta title="My Profile" description="Manage your Aaro Groups profile." robots="noindex, nofollow" />
            <div className="flex flex-col lg:flex-row gap-fluid">
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
                        {isAdmin ? (
                            <Link to="/admin/dashboard" className="flex items-center gap-3 w-full p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group">
                                <LayoutDashboard className="w-5 h-5 text-primary" />
                                <span className="text-sm font-semibold">Admin Panel</span>
                            </Link>
                        ) : (
                            <Link to="/my-orders" className="flex items-center gap-3 w-full p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group">
                                <Package className="w-5 h-5 text-primary" />
                                <span className="text-sm font-semibold">View My Orders</span>
                            </Link>
                        )}
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
                                        type="submit"
                                        form="profile-form"
                                        disabled={loading}
                                        className="flex items-center gap-1.5 text-xs font-bold text-green-500 hover:text-green-400 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            reset({ name: user.name, email: user.email, phone: user.phone || "" });
                                        }}
                                        disabled={loading}
                                        className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-3.5 h-3.5" /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                        <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="divide-y divide-border">
                            {details.map((item, i) => (
                                <div key={i} className="px-6 py-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor={`profile-${item.key}`} className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</label>
                                            {isEditing ? (
                                                <div>
                                                    <input
                                                        id={`profile-${item.key}`}
                                                        type={item.type}
                                                        {...register(item.key)}
                                                        className={`w-full mt-1 bg-secondary/50 border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${errors[item.key] ? "border-destructive" : "border-border"}`}
                                                    />
                                                    {errors[item.key] && <p className="text-xs text-destructive mt-1 ml-1">{errors[item.key]?.message}</p>}
                                                </div>
                                            ) : (
                                                <p className="text-sm font-semibold text-black">{formValues[item.key] || "Not provided"}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </form>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[11px] font-bold text-primary">!</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed text-black/70">
                            Your account details are used to pre-fill your order information for a faster checkout experience. Keep them updated to ensure smooth deliveries.
                        </p>
                    </div>

                    {/* Site Logo — Admin Only */}
                    {isAdmin && (
                        <div className="mt-6 bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
                            <div className="px-6 py-4 bg-secondary/50 border-b border-border flex items-center gap-2">
                                <Image className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Site Logo</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-xs text-muted-foreground">Upload your brand logo. It will appear in the navbar and footer.</p>
                                <div className="w-full max-w-[200px] h-20 rounded-xl border border-border bg-secondary/30 flex items-center justify-center p-3">
                                    <img
                                        src={logoUrl || fallbackLogo}
                                        alt="Current Logo"
                                        className="max-h-full max-w-full object-contain"
                                        onError={(e) => { (e.target as HTMLImageElement).src = fallbackLogo; }}
                                    />
                                </div>
                                <ImageUpload value={logoUrl} onChange={setLogoUrl} label="Upload New Logo" accept="image/*" maxSizeMB={2} />
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleLogoSave}
                                        disabled={logoSaving}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-colors disabled:opacity-50"
                                    >
                                        {logoSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                        {logoSaving ? "Saving..." : "Save Logo"}
                                    </button>
                                    {logoUrl && (
                                        <button
                                            onClick={handleLogoDelete}
                                            disabled={logoSaving}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
