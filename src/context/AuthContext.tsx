import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { isJwtExpired } from "@/lib/auth";

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: "customer" | "admin" | "superadmin";
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Token is stored in memory only (not localStorage) for security
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // On mount: try to restore session from refresh cookie (HttpOnly)
    useEffect(() => {
        const restoreSession = async () => {
            // Create timeout to prevent loading state from getting stuck
            let loadingTimeout: ReturnType<typeof setTimeout>;
            try {
                loadingTimeout = setTimeout(() => {
                    setLoading(false);
                }, 10000); // 10 second timeout

                const res = await fetch(`${API_URL}/auth/refresh`, {
                    method: "POST",
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setToken(data.token);
                    setUser(data.user);
                }
            } catch (e) {
                console.error("Failed to restore auth session", e);
            } finally {
                // Clean up old localStorage tokens (migration)
                localStorage.removeItem("aaro_token");
                localStorage.removeItem("aaro_user");
                clearTimeout(loadingTimeout);
                setLoading(false);
            }
        };
        restoreSession();
    }, []);

    // Auto-refresh access token before it expires
    useEffect(() => {
        if (!token) return;

        // Refresh 1 minute before expiry
        let timeout: ReturnType<typeof setTimeout>;
        try {
            const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(atob(base64));
            const expiresIn = payload.exp * 1000 - Date.now() - 60_000; // 1 min before
            if (expiresIn > 0) {
                timeout = setTimeout(async () => {
                    try {
                        const res = await fetch(`${API_URL}/auth/refresh`, {
                            method: "POST",
                            credentials: "include",
                        });
                        if (res.ok) {
                            const data = await res.json();
                            setToken(data.token);
                            setUser(data.user);
                        }
                    } catch {
                        // Silent fail — guardedFetch will catch 401
                    }
                }, expiresIn);
            }
        } catch { /* invalid token format */ }

        return () => clearTimeout(timeout);
    }, [token]);

    const login = useCallback((newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        // No longer store token in localStorage (memory only)
        // Keep user in localStorage for quick UI restore (non-sensitive)
        localStorage.setItem("aaro_user", JSON.stringify(newUser));
    }, []);

    const logout = useCallback(async () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("aaro_token");
        localStorage.removeItem("aaro_user");
        localStorage.removeItem("aaro_admin");
        localStorage.removeItem("aaro_cart");
        localStorage.removeItem("aaro_recently_viewed");
        // Clear refresh cookie on server
        try {
            await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
        } catch { /* silent */ }
    }, []);

    const updateUser = useCallback((updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem("aaro_user", JSON.stringify(updatedUser));
    }, []);

    const value = useMemo(() => ({
        user, token, loading, login, logout, updateUser,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin" || user?.role === "superadmin",
        isSuperAdmin: user?.role === "superadmin",
    }), [user, token, loading, login, logout, updateUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
