import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: { id: string }; // only userId
}

export const validToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn("Access attempt without valid token");
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRETE!, (err, decoded) => {
    if (err) {
      logger.warn("Invalid token");
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Extract userId from JWT payload
    const payload = decoded as {
      userId?: string;
      id?: string;
      [key: string]: any;
    };
    const userId = payload.userId ?? payload.id;

    if (!userId) {
      logger.warn("Token payload does not contain userId");
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.user = { id: userId };
    next();
  });
};
