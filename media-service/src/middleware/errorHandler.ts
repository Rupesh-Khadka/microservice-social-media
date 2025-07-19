import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

const errorHandler = (
  err: { stack?: string; status?: number; message?: string },
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error.",
  });
};

export default errorHandler;
