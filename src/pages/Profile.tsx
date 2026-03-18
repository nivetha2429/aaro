import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { User, Mail, Phone, Package, ShoppingBag, Edit2, Check, X, Loader2, LayoutDashboard, Shield, Eye, EyeOff, Upload, Trash2, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/lib/schemas";
import PageMeta from "@/components/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const Profile = () => {
    const { user, token, updateUser, login, isAdmin } = useAuth();
    const { contactSettings, updateContactSettings } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Logo upload — auto-saves on upload, replaces previous
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (logoInputRef.current) logoInputRef.current.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
        if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2MB");

        setLogoUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            const uploadRes = await fetch(`${API_URL}/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!uploadRes.ok) throw new Error((await uploadRes.json()).message || "Upload failed");
            const { url } = await uploadRes.json();

            await updateContactSettings({ ...contactSettings, logoUrl: url });
            toast.success("Logo updated! It now shows across the site.");
        } catch (err: any) {
            toast.error(err.message || "Failed to upload logo");
        } finally {
            setLogoUploading(false);
        }
    };

    const handleLogoDelete = async () => {
        setLogoUploading(true);
        try {
            await updateContactSettings({ ...contactSettings, logoUrl: "" });
            toast.success("Logo removed.");
        } catch (err: any) {
            toast.error(err.message || "Failed to remove logo");
        } finally {
            setLogoUploading(false);
        }
    };

    // Login & Security state (admin only)
    const [emailForm, setEmailForm] = useState({ currentPassword: "", newEmail: "", confirmEmail: "" });
    const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [emailLoading, setEmailLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [showPass, setShowPass] = useState<Record<string, boolean>>({});
    const togglePass = (key: string) => setShowPass(p => ({ ...p, [key]: !p[key] }));

    const handleEmailUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailForm.currentPassword) return toast.error("Enter current password");
        if (!emailForm.newEmail) return toast.error("Enter new email");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) return toast.error("Invalid email format");
        if (emailForm.newEmail !== emailForm.confirmEmail) return toast.error("Emails do not match");
        setEmailLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/admin/update-email`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(emailForm),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                if (data.user && data.token) login(data.token, data.user);
                setEmailForm({ currentPassword: "", newEmail: "", confirmEmail: "" });
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setEmailLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passForm.currentPassword) return toast.error("Enter current password");
        if (passForm.newPassword.length < 8) return toast.error("Password must be at least 8 characters");
        if (passForm.newPassword !== passForm.confirmPassword) return toast.error("Passwords do not match");
        setPassLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/admin/update-password`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(passForm),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setPassLoading(false);
        }
    };

    const SecureInput = ({ label, name, type = "text", value, onChange, placeholder }: {
        label: string; name: string; type?: string; value: string;
        onChange: (v: string) => void; placeholder?: string;
    }) => {
        const isPassword = type === "password";
        const visible = showPass[name];
        return (
            <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">{label}</label>
                <div className="relative">
                    <input
                        type={isPassword && !visible ? "password" : "text"}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {isPassword && (
                        <button type="button" onClick={() => togglePass(name)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user?.name || "", email: user?.email || "", phone: user?.phone || "" },
    });

    const formValues = watch();

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
                                <p className="text-xs text-muted-foreground">Upload a logo image. It will replace the current logo across the entire site (header, footer, loading screen).</p>
                                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />

                                {contactSettings.logoUrl ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-48 h-20 rounded-xl border border-border bg-secondary/30 flex items-center justify-center p-2">
                                            <img src={contactSettings.logoUrl} alt="Site Logo" className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => logoInputRef.current?.click()}
                                                disabled={logoUploading}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-50"
                                            >
                                                {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                                {logoUploading ? "Uploading..." : "Replace"}
                                            </button>
                                            <button
                                                onClick={handleLogoDelete}
                                                disabled={logoUploading}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 disabled:opacity-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => logoInputRef.current?.click()}
                                        disabled={logoUploading}
                                        className="w-full h-28 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {logoUploading ? (
                                            <><Loader2 className="w-6 h-6 text-primary animate-spin" /><span className="text-xs font-bold text-primary">Uploading...</span></>
                                        ) : (
                                            <><Upload className="w-6 h-6 text-muted-foreground" /><span className="text-xs font-bold text-muted-foreground">Click to upload logo</span><span className="text-[10px] text-muted-foreground/60">PNG or JPG, max 2MB</span></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Login & Security — Admin Only */}
                    {isAdmin && (
                        <div className="mt-6 bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
                            <div className="px-6 py-4 bg-secondary/50 border-b border-border flex items-center gap-2">
                                <Shield className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Login & Security</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Change Email */}
                                <form onSubmit={handleEmailUpdate} className="space-y-3">
                                    <p className="text-sm font-bold text-foreground">Change Email</p>
                                    <div className="text-xs text-muted-foreground">Current: <span className="font-medium text-foreground">{user?.email}</span></div>
                                    <SecureInput label="Current Password" name="ep" type="password" value={emailForm.currentPassword} onChange={v => setEmailForm(p => ({ ...p, currentPassword: v }))} placeholder="Enter current password" />
                                    <SecureInput label="New Email" name="ne" value={emailForm.newEmail} onChange={v => setEmailForm(p => ({ ...p, newEmail: v }))} placeholder="Enter new email" />
                                    <SecureInput label="Confirm Email" name="ce" value={emailForm.confirmEmail} onChange={v => setEmailForm(p => ({ ...p, confirmEmail: v }))} placeholder="Confirm new email" />
                                    <button type="submit" disabled={emailLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-50">
                                        {emailLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Email
                                    </button>
                                </form>

                                <div className="border-t border-border" />

                                {/* Change Password */}
                                <form onSubmit={handlePasswordUpdate} className="space-y-3">
                                    <p className="text-sm font-bold text-foreground">Change Password</p>
                                    <SecureInput label="Current Password" name="cp" type="password" value={passForm.currentPassword} onChange={v => setPassForm(p => ({ ...p, currentPassword: v }))} placeholder="Enter current password" />
                                    <SecureInput label="New Password" name="np" type="password" value={passForm.newPassword} onChange={v => setPassForm(p => ({ ...p, newPassword: v }))} placeholder="Min 8 characters" />
                                    <SecureInput label="Confirm Password" name="cfp" type="password" value={passForm.confirmPassword} onChange={v => setPassForm(p => ({ ...p, confirmPassword: v }))} placeholder="Re-enter new password" />
                                    <button type="submit" disabled={passLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-50">
                                        {passLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Password
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
