import "dotenv/config";

import { Request, Response, NextFunction } from "express";
import express from "express";
import cors from "cors";
import Redis from "ioredis";
import logger from "./utils/logger";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import proxy from "express-http-proxy";
import { RequestOptions } from "http";
import errorHandler from "./middleware/errorHandler";
import { validToken } from "./middleware/authMiddleware";
import { AuthenticatedRequest } from "./types/express";

const app = express();

const PORT = process.env.PORT || 3000;

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  logger.warn(`REDIS_URL is not defined ${redisUrl}`);
  throw new Error("REDIS_URL is not defined");
}

const redisClient = new Redis(redisUrl);

app.use(helmet());
app.use(cors());
app.use(express.json());

//rate limiting
const rateLimiteOptions = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

app.use(rateLimiteOptions);

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Received body, ${req.body}`);
  next();
});

const proxyOption = {
  proxyReqPathResolver: (req: Request) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err: Error, res: Response, next: NextFunction) => {
    logger.error(`Proxy error ${err.message}`);
    res.status(500).json({
      message: "Internal Server Error!",
      error: err.message,
    });
  },
};

//Setting up proxy for our User service
app.use(
  "/v1/auth",
  proxy(process.env.USER_SERVICE_URL!, {
    ...proxyOption,
    proxyReqOptDecorator(proxyReqOpts: RequestOptions, srcReq: Request) {
      proxyReqOpts.headers = {
        ...(proxyReqOpts.headers || {}),
        ["Content-Type"]: "application/json",
      };
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from User service : ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

//Setting up proxy for our Post service
app.use(
  "/v1/posts",
  validToken,
  proxy(process.env.POST_SERVICE_URL!, {
    ...proxyOption,
    proxyReqPathResolver: (req) =>
      req.originalUrl.replace(/^\/v1\/posts/, "/api"),
    proxyReqOptDecorator(
      proxyReqOpts: RequestOptions,
      srcReq: AuthenticatedRequest
    ) {
      proxyReqOpts.headers = {
        ...(proxyReqOpts.headers || {}),
        "Content-Type": "application/json",
        "x-user-id": srcReq.user?.id,
      };
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Post service : ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

//Setting up proxy for our Media service
app.use(
  "/v1/media",
  validToken,
  proxy(process.env.MEDIA_SERVICE_URL!, {
    ...proxyOption,
    proxyReqPathResolver: (req) =>
      req.originalUrl.replace(/^\/v1\/media/, "/api"),

    proxyReqOptDecorator(
      proxyReqOpts: RequestOptions,
      srcReq: AuthenticatedRequest
    ) {
      const headers: Record<string, string> = {
        ...((proxyReqOpts.headers as Record<string, string>) || {}),
        "x-user-id": srcReq.user?.id ?? "",
      };

      const contentType = srcReq.headers["content-type"];
      if (contentType && !contentType.startsWith("multipart/form-data")) {
        headers["Content-Type"] = "application/json";
      }

      proxyReqOpts.headers = headers;
      return proxyReqOpts;
    },

    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Media service : ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
    parseReqBody: false,
  })
);

//Setting up proxy for our search service
app.use(
  "/v1/search",
  validToken,
  proxy(process.env.SEARCH_SERVICE_URL!, {
    ...proxyOption,
    proxyReqPathResolver: (req) =>
      req.originalUrl.replace(/^\/v1\/search/, "/api"),
    proxyReqOptDecorator(
      proxyReqOpts: RequestOptions,
      srcReq: AuthenticatedRequest
    ) {
      proxyReqOpts.headers = {
        ...(proxyReqOpts.headers || {}),
        "Content-Type": "application/json",
        "x-user-id": srcReq.user?.id,
      };
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Search service : ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API GATEWAY is running on ${PORT}`);
  logger.info(`REDIS Url is running on ${process.env.REDIS_URL}`);
  logger.info(`USER SERVICE  is running on ${process.env.USER_SERVICE_URL}`);
  logger.info(`POST SERVICE  is running on ${process.env.POST_SERVICE_URL}`);
  logger.info(`USER SERVICE  is running on ${process.env.MEDIA_SERVICE_URL}`);
  logger.info(
    `SEARCH SERVICE  is running on ${process.env.SEARCH_SERVICE_URL}`
  );
});
