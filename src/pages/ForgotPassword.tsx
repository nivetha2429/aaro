import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/schemas";

const ForgotPassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || "/api";

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    useEffect(() => {
        if (!authLoading && isAuthenticated) navigate("/", { replace: true });
    }, [isAuthenticated, authLoading, navigate]);

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: data.email,
                    phone: data.phone,
                    newPassword: data.newPassword,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success("Password reset successfully!");
                navigate("/login");
            } else {
                toast.error(result.message || "Failed to reset password");
            }
        } catch {
            toast.error("Connection failed. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-8 pb-24 lg:pb-8 animate-fade-in">
            <PageMeta title="Forgot Password" description="Reset your Aaro Systems account password." />
            <div className="bg-card rounded-2xl p-8 shadow-soft w-full max-w-sm border border-border">
                <div className="w-14 h-14 rounded-xl gradient-dark mx-auto flex items-center justify-center mb-6 shadow-lg shadow-slate-900/20">
                    <KeyRound className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground text-center mb-2">Reset Password</h2>
                <p className="text-muted-foreground text-center text-sm mb-8">
                    Verify your identity and set a new password
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <div className="relative">
                            <label htmlFor="forgot-email" className="sr-only">Email address</label>
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="forgot-email"
                                type="email"
                                placeholder="Email address"
                                {...register("email")}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                            />
                        </div>
                        {errors.email && <p className="text-xs text-destructive mt-1 ml-1">{errors.email.message}</p>}
                    </div>
                    <div>
                        <div className="relative">
                            <label htmlFor="forgot-phone" className="sr-only">Phone number</label>
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="forgot-phone"
                                type="tel"
                                placeholder="Phone number"
                                maxLength={10}
                                inputMode="numeric"
                                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10); }}
                                {...register("phone")}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                            />
                        </div>
                        {errors.phone && <p className="text-xs text-destructive mt-1 ml-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                        <div className="relative">
                            <label htmlFor="forgot-new-password" className="sr-only">New password</label>
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="forgot-new-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="New password"
                                {...register("newPassword")}
                                className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                            />
                            <button
                                type="button"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.newPassword && <p className="text-xs text-destructive mt-1 ml-1">{errors.newPassword.message}</p>}
                    </div>
                    <div>
                        <div className="relative">
                            <label htmlFor="forgot-confirm-password" className="sr-only">Confirm password</label>
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="forgot-confirm-password"
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm new password"
                                {...register("confirmPassword")}
                                className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                            />
                            <button
                                type="button"
                                aria-label={showConfirm ? "Hide password" : "Show password"}
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-destructive mt-1 ml-1">{errors.confirmPassword.message}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full gradient-dark text-white py-3 min-h-[44px] rounded-xl font-bold text-sm hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/10 disabled:opacity-50"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <p className="text-sm text-center mt-6 text-muted-foreground">
                    Remember your password?{" "}
                    <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
