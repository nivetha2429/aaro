import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    useEffect(() => {
        if (isAuthenticated) navigate("/shop", { replace: true });
    }, [isAuthenticated, navigate]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password || !form.phone) return toast.error("Please fill in all required fields including phone number");

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await response.json();
            if (response.ok) {
                login(data.token, data.user);
                toast.success("Account created successfully!");
                navigate("/shop");
            } else {
                toast.error(data.message || "Registration failed");
            }
        } catch (err) {
            // Demo Fallback
            if (form.name && form.email && form.password.length >= 6) {
                const dummyUser = {
                    id: "u-" + Date.now(),
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    role: "customer" as const
                };
                login("demo-token", dummyUser);
                toast.success("Account created (Demo Mode)");
                navigate("/shop");
            } else {
                toast.error("Connection failed. Is the server running?");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
            <div className="bg-card rounded-2xl p-8 shadow-soft w-full max-w-sm border border-border">
                <div className="w-14 h-14 rounded-xl gradient-purple mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                    <UserPlus className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground text-center mb-2">Create Account</h2>
                <p className="text-muted-foreground text-center text-sm mb-8">Join AARO Systems today</p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            required
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="password"
                            placeholder="Create Password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full gradient-purple text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
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
