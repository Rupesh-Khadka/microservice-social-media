import { Request, Response } from "express";
import logger from "../utils/logger";
import { prisma } from "../utils/prisma";
import { AuthenticatedRequest } from "../types/express";

export const searchPostController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const authReq = req as AuthenticatedRequest;
  logger.info("Get All Post endpoint hit with body: %o", req.body);

  try {
    const { query } = req.query;
    const cacheKey = `search:${query}`;

    const cacheALLPosts = await authReq.redisClient.get(cacheKey);

    if (cacheALLPosts) {
      return res.json(JSON.parse(cacheALLPosts));
    }

    const results = await prisma.search.findMany({
      where: {
        content: {
          contains: query as string,
          mode: "insensitive",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    if (!results) {
      logger.warn(`No post found on ${query}`);
      return res.status(404).json({
        status: "false",
        message: "Post not found",
      });
    }

    //save your posts in redis cache
    await authReq.redisClient.setex(cacheKey, 3600, JSON.stringify(results));

    res.json(results);
  } catch (error) {
    logger.error("Error getting all posts", error);
    res.status(500).json({
      success: false,
      messgae: "Error getting all posts",
    });
  }
};
