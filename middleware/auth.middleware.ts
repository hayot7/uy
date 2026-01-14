import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils.ts/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email?: string; role?: string };
    }
  }
}

/**
 * Require authentication middleware.
 * Expects Authorization: Bearer <token>
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: number; email?: string; role?: string }>(token);

    // payload may contain iat/exp as well
    if (!payload || typeof payload !== "object" || !("id" in payload)) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = {
      id: (payload as any).id,
      email: (payload as any).email,
      role: (payload as any).role
    };

    next();
  } catch (err: any) {
    // token invalid or expired
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * Admin-only middleware helper
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
}