import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

import errorHandler from "./middleware/errorHandler";

import logger from "../src/utils/logger";
import router from "./routes/user-service";

const app = express();

const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  logger.warn(`REDIS_URL is not defined ${redisUrl}`);
  throw new Error("REDIS_URL is not defined");
}
const redisClient = new Redis(redisUrl);

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Received body, ${req.body}`);
  next();
});

//DDOS protection & Rate Limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req: Request, res: Response, next: NextFunction) => {
  rateLimiter
    .consume(req.ip as string)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate Limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
});

//IP based rate limiting for sensitive points

const sensitiveEndPointsLmit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP :${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args: Parameters<typeof redisClient.call>): Promise<any> =>
      redisClient.call(...args) as Promise<any>,
  }),
});

// Implement sensitive endpoint to routes
app.use("/api/auth/register", sensitiveEndPointsLmit);

//Routes
app.use("/api/auth", router);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`User service runnning on port ${PORT}`);
});

//unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
