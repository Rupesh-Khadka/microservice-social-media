import { Request } from "express";
import Redis from "ioredis";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
  redisClient: Redis;
}
