import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import Redis from "ioredis";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

import logger from "../src/utils/logger";
import errorHandler from "./middleware/errorHandler";
import mediaRoutes from "../src/routes/media-routes";
import { connectToRabbitMq, consumeEvent } from "./utils/rabbitmq";
import { handlePostDelete } from "./eventHandlers/mediaEventHandler";

const app = express();

const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Received body, ${req.body}`);
  next();
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
  // store: new RedisStore({
  //   sendCommand: (...args: Parameters<typeof redisClient.call>): Promise<any> =>
  //     redisClient.call(...args) as Promise<any>,
  // }),
});

// Implement sensitive endpoint to routes
app.use("/api/upload", sensitiveEndPointsLmit);

//Routes
app.use("/api", mediaRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMq();

    //Consume all the events
    await consumeEvent("post-delete", handlePostDelete   );

    app.listen(PORT, () => {
      logger.info(`Media service runnning on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to connect to server`, error);
    process.exit(1);
  }
}

startServer();

//unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
