import React, { createContext, useContext, useState, useEffect } from "react";

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
            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.error("Failed to restore auth session", e);
            localStorage.removeItem("aaro_token");
            localStorage.removeItem("aaro_user");
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("aaro_token", newToken);
        localStorage.setItem("aaro_user", JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("aaro_token");
        localStorage.removeItem("aaro_user");
        localStorage.removeItem("aaro_admin");
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem("aaro_user", JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                updateUser,
                isAuthenticated: !!token,
                isAdmin: user?.role === "admin",
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
