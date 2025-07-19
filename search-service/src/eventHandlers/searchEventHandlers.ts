import { Request } from "express";
import { AuthenticatedRequest } from "../types/express";
import logger from "../utils/logger";
import { prisma } from "../utils/prisma";
import Redis from "ioredis";

async function invalidatePostCache(redisClient: Redis, input: string) {
  const cachedKey = `search:${input}`;
  await redisClient.del(cachedKey);

  const keys = await redisClient.keys("search:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
}

export async function handlePostCreated(event: any, redisClient: Redis) {
  try {
    const newSearchPost = await prisma.search.create({
      data: {
        postId: event.postId,
        userId: event.userId,
        title: event.title || null,
        content: event.content,
        createdAt: event.createdAt,
      },
    });
    await invalidatePostCache(redisClient, event.postId);

    logger.info(
      `Search Post created: ${event.postId} , ${newSearchPost.id.toString()}`
    );
  } catch (e) {
    logger.error(`Error handling post creation event`, e);
  }
}

export async function handlePostDeleted(event: any, redisClient: Redis) {
  try {
    await prisma.search.delete({
      where: {
        postId: event.postId as string,
      },
    });

    await invalidatePostCache(redisClient, event.postId);
    logger.info(`Search Post deleted: ${event.postId}`);
  } catch (e) {
    logger.warn(`Error in Post deletion event`, e);
  }
}
