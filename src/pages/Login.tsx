import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    useEffect(() => {
        if (isAuthenticated) navigate("/shop", { replace: true });
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return toast.error("Please fill in all fields");

        // Admin Credentials Bypass for demo/ease of use
        if (email === "admin@aaro.com" && password === "admin123") {
            const adminUser = {
                id: "admin-id",
                name: "Admin User",
                email: "admin@aaro.com",
                role: "admin" as const
            };
            localStorage.setItem("aaro_admin", "true");
            login("demo-admin-token", adminUser);
            toast.success("Welcome back, Admin!");
            navigate("/admin/dashboard", { replace: true });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                if (data.user.role === "admin") {
                    localStorage.setItem("aaro_admin", "true");
                }
                login(data.token, data.user);
                toast.success("Welcome back!");
                navigate(data.user.role === "admin" ? "/admin/dashboard" : "/shop");
            } else {
                toast.error(data.message || "Invalid credentials");
            }
        } catch (err) {
            // Fallback for regular user login in demo mode if backend is down
            if (email.includes("@") && password.length >= 6) {
                const dummyUser = { id: "u-" + Date.now(), name: email.split("@")[0], email, role: "customer" as const };
                login("demo-token", dummyUser);
                toast.success("Login successful (Demo Mode)");
                navigate("/shop");
            } else {
                toast.error("Connection failed. Is the server running?");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
            <div className="bg-card rounded-2xl p-8 shadow-soft w-full max-w-sm border border-border">
                <div className="w-14 h-14 rounded-xl gradient-purple mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                    <LogIn className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground text-center mb-2">User Login</h2>
                <p className="text-muted-foreground text-center text-sm mb-8">Access your orders and account</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full gradient-purple text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
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
