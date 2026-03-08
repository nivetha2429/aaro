import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET not configured");
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Re-check role from DB — revoked admins are blocked even with a valid token
export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select("role").lean();
        if (user?.role === "admin") return next();
        return res.status(403).json({ message: "Forbidden - Admin access required" });
    } catch {
        return res.status(500).json({ message: "Authorization check failed" });
    }
};
