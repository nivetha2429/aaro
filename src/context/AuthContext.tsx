import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { isJwtExpired } from "@/lib/auth";

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: "customer" | "admin";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const savedToken = localStorage.getItem("aaro_token");
            const savedUser = localStorage.getItem("aaro_user");
            if (savedToken && savedUser && !isJwtExpired(savedToken)) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } else if (savedToken) {
                localStorage.removeItem("aaro_token");
                localStorage.removeItem("aaro_user");
            }
        } catch (e) {
            console.error("Failed to restore auth session", e);
            localStorage.removeItem("aaro_token");
            localStorage.removeItem("aaro_user");
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback((newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("aaro_token", newToken);
        localStorage.setItem("aaro_user", JSON.stringify(newUser));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("aaro_token");
        localStorage.removeItem("aaro_user");
        localStorage.removeItem("aaro_admin");
        localStorage.removeItem("aaro_cart");
        localStorage.removeItem("aaro_recently_viewed");
    }, []);

    const updateUser = useCallback((updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem("aaro_user", JSON.stringify(updatedUser));
    }, []);

    const value = useMemo(() => ({
        user, token, loading, login, logout, updateUser,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin",
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
