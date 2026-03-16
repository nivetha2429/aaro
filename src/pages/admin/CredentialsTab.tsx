import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const CredentialsTab = () => {
    const { user, token, login } = useAuth();

    const [emailForm, setEmailForm] = useState({ currentPassword: "", newEmail: "", confirmEmail: "" });
    const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [emailLoading, setEmailLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [showPass, setShowPass] = useState<Record<string, boolean>>({});

    const toggle = (key: string) => setShowPass(p => ({ ...p, [key]: !p[key] }));

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

    const Input = ({ label, name, type = "text", value, onChange, placeholder }: {
        label: string; name: string; type?: string; value: string;
        onChange: (v: string) => void; placeholder?: string;
    }) => {
        const isPassword = type === "password";
        const visible = showPass[name];
        return (
            <div>
                <label className="text-xs font-bold text-[#6b7280] block mb-1">{label}</label>
                <div className="relative">
                    <input
                        type={isPassword && !visible ? "password" : "text"}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {isPassword && (
                        <button type="button" onClick={() => toggle(name)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]">
                            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-lg space-y-6">
            <h2 className="text-base font-bold text-[#1a1f36]">Login & Security</h2>

            {/* Change Email */}
            <form onSubmit={handleEmailUpdate} className="bg-white border border-[#e5e7eb] rounded-xl p-4 space-y-3">
                <p className="text-sm font-bold text-[#1a1f36]">Change Email</p>
                <div className="text-xs text-[#6b7280]">Current: <span className="font-medium text-[#1a1f36]">{user?.email}</span></div>
                <Input label="Current Password" name="ep" type="password" value={emailForm.currentPassword} onChange={v => setEmailForm(p => ({ ...p, currentPassword: v }))} placeholder="Enter current password" />
                <Input label="New Email" name="ne" value={emailForm.newEmail} onChange={v => setEmailForm(p => ({ ...p, newEmail: v }))} placeholder="Enter new email" />
                <Input label="Confirm Email" name="ce" value={emailForm.confirmEmail} onChange={v => setEmailForm(p => ({ ...p, confirmEmail: v }))} placeholder="Confirm new email" />
                <button type="submit" disabled={emailLoading} className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5">
                    {emailLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Email
                </button>
            </form>

            {/* Change Password */}
            <form onSubmit={handlePasswordUpdate} className="bg-white border border-[#e5e7eb] rounded-xl p-4 space-y-3">
                <p className="text-sm font-bold text-[#1a1f36]">Change Password</p>
                <Input label="Current Password" name="cp" type="password" value={passForm.currentPassword} onChange={v => setPassForm(p => ({ ...p, currentPassword: v }))} placeholder="Enter current password" />
                <Input label="New Password" name="np" type="password" value={passForm.newPassword} onChange={v => setPassForm(p => ({ ...p, newPassword: v }))} placeholder="Min 8 characters" />
                <Input label="Confirm Password" name="cfp" type="password" value={passForm.confirmPassword} onChange={v => setPassForm(p => ({ ...p, confirmPassword: v }))} placeholder="Re-enter new password" />
                <button type="submit" disabled={passLoading} className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5">
                    {passLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Password
                </button>
            </form>
        </div>
    );
};

export default CredentialsTab;
