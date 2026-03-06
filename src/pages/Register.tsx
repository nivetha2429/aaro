import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Mail, Lock, User, Phone } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { registerSchema, type RegisterFormData } from "@/lib/schemas";

const Register = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated, loading: authLoading } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || "/api";

    const { register: reg, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    useEffect(() => {
        if (!authLoading && isAuthenticated) navigate("/", { replace: true });
    }, [isAuthenticated, authLoading, navigate]);

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
                login(result.token, result.user);
                toast.success("Account created successfully!");
                navigate("/");
            } else {
                toast.error(result.message || "Registration failed");
            }
        } catch {
            toast.error("Connection failed. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 pb-24 md:pb-12 animate-fade-in">
            <PageMeta title="Register" description="Create your Aaro Systems account and start shopping." />
            <div className="bg-card rounded-2xl p-8 shadow-soft w-full max-w-sm border border-border">
                <div className="w-14 h-14 rounded-xl gradient-dark mx-auto flex items-center justify-center mb-6 shadow-lg shadow-slate-900/20">
                    <UserPlus className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground text-center mb-2">Create Account</h2>
                <p className="text-muted-foreground text-center text-sm mb-8">Join AARO Systems today</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <div className="relative">
                            <label htmlFor="register-name" className="sr-only">Full Name</label>
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="register-name"
                                type="text"
                                placeholder="Full Name"
                                {...reg("name")}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                            />
                        </div>
                        {errors.name && <p className="text-xs text-destructive mt-1 ml-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <div className="relative">
                            <label htmlFor="register-email" className="sr-only">Email address</label>
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="register-email"
                                type="email"
                                placeholder="Email address"
                                {...reg("email")}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                            />
                        </div>
                        {errors.email && <p className="text-xs text-destructive mt-1 ml-1">{errors.email.message}</p>}
                    </div>
                    <div>
                        <div className="relative">
                            <label htmlFor="register-phone" className="sr-only">Phone Number</label>
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="register-phone"
                                type="tel"
                                placeholder="Phone Number"
                                {...reg("phone")}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                            />
                        </div>
                        {errors.phone && <p className="text-xs text-destructive mt-1 ml-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                        <div className="relative">
                            <label htmlFor="register-password" className="sr-only">Password</label>
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="register-password"
                                type="password"
                                placeholder="Create Password (min 6 chars)"
                                {...reg("password")}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                            />
                        </div>
                        {errors.password && <p className="text-xs text-destructive mt-1 ml-1">{errors.password.message}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full gradient-dark text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/10 disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>
                </form>

                <p className="text-sm text-center mt-6 text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
