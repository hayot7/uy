import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "No token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user = decoded;
        next();
    } catch {
        res.status(401).json({ msg: "Invalid token" });
    }
};

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface AuthRequest extends Request {
  userId?: string;
  jwtPayload?: any;
}

export const authEnhanced = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const r = req as AuthRequest;
    r.userId = decoded?.id ?? decoded?.userId;
    r.jwtPayload = decoded;
    next();
  } catch (err) {
    console.error("authEnhanced token error:", err);
    return res.status(401).json({ msg: "Invalid token" });
  }
};