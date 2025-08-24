import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    isAdmin: boolean;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "tradepilot-secret-key";

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; isAdmin?: boolean };
    
    // Handle special admin token
    if (decoded.userId === 'admin' && decoded.isAdmin) {
      req.user = {
        id: 'admin',
        email: 'admin@tradepilot.com',
        username: 'Administrator',
        isAdmin: true,
      };
      return next();
    }
    
    // Handle regular user tokens
    const user = await storage.getUser(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid or inactive user" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin || false,
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
