import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, type LoginFormData } from "@/lib/schemas";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated, loading: authLoading } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || "/api";

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        if (!authLoading && isAuthenticated) navigate("/", { replace: true });
    }, [isAuthenticated, authLoading, navigate]);

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
                login(result.token, result.user);
                toast.success("Welcome back!");
                if (result.user.role === "superadmin") navigate("/superadmin");
                else if (result.user.role === "admin") navigate("/admin/dashboard");
                else navigate("/");
            } else {
                toast.error(result.message || "Invalid credentials");
            }
        } catch {
            toast.error("Connection failed. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-8 pb-24 lg:pb-8 animate-fade-in">
            <PageMeta title="Login" description="Log in to your Aaro Groups account." robots="noindex, nofollow" />
            <div className="bg-card rounded-2xl p-5 sm:p-8 shadow-soft w-full max-w-sm border border-border">
                <div className="w-14 h-14 rounded-xl gradient-dark mx-auto flex items-center justify-center mb-6 shadow-lg shadow-slate-900/20">
                    <LogIn className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground text-center mb-2">User Login</h2>
                <p className="text-muted-foreground text-center text-sm mb-8">Access your orders and account</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <div className="relative">
                            <label htmlFor="login-email" className="sr-only">Email address</label>
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="login-email"
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
                            <label htmlFor="login-password" className="sr-only">Password</label>
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                {...register("password")}
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
                        {errors.password && <p className="text-xs text-destructive mt-1 ml-1">{errors.password.message}</p>}
                    </div>
                    <div className="text-right">
                        <Link to="/forgot-password" className="text-xs text-primary font-semibold hover:underline">
                            Forgot Password?
                        </Link>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full gradient-dark text-white py-3 min-h-[44px] rounded-xl font-bold text-sm hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/10 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-sm text-center mt-6 text-muted-foreground">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
