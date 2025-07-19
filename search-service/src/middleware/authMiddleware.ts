import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { AuthenticatedRequest } from "../types/express";

export const authenticateRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // const userId = req.headers["x-user-id"];
  const userIdHeader = req.headers["x-user-id"];
  const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;
  if (!userId) {
    logger.warn(`Access attempted witout user ID`);
    res.status(401).json({
      success: false,
      message: "Authentication required! Please login to continue",
    });

    return;
  }

  (req as AuthenticatedRequest).user = { userId };
  next();
};
