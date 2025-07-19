import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import logger from "../utils/logger";
import { AuthenticatedRequest } from "../types/express";
import { validatePost } from "../utils/validation";
import { publishEvent } from "../utils/rabbitmq";

// Revalidate redis on any update
async function invalidatePostCache(req: AuthenticatedRequest, input: string) {
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);

  const keys = await req.redisClient.keys("posts:*");
  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
}

export const createPost = async (req: Request, res: Response): Promise<any> => {
  const authReq = req as AuthenticatedRequest;
  logger.info("Create post endpoint hit with body: %o", req.body);
  try {
    const { error } = validatePost(req.body);

    if (error) {
      logger.warn("validation error", error.issues[0].message);
      return res.status(400).json({
        success: false,
        message: error.issues[0].message,
      });
    }

    const { content, mediaIds, title } = req.body;

    const userId = authReq.user?.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const newlyCreatedPost = await prisma.post.create({
      data: {
        user: userId,
        title: title || null,
        content,
        mediaIds: mediaIds || [],
      },
    });

    await publishEvent("post-created", {
      postId: newlyCreatedPost.id.toString(),
      userId: newlyCreatedPost.user.toString(),
      title: newlyCreatedPost.title || null,
      content: newlyCreatedPost.content,
      createdAt: newlyCreatedPost.createdAt,
    });
    await invalidatePostCache(authReq, newlyCreatedPost.id.toString());
    logger.info("Post created successfully", newlyCreatedPost);

    res.status(201).json({
      success: true,
      data: newlyCreatedPost,
    });
  } catch (error) {
    logger.error("Error creating post", error);
    res.status(500).json({
      success: false,
      messgae: "Error creating post",
    });
  }
};

export const getAllPost = async (req: Request, res: Response): Promise<any> => {
  const authReq = req as AuthenticatedRequest;
  logger.info("Get All Post endpoint hit with body: %o", req.body);

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;

    // //  const redisClient = req.redisClient;
    // type RequestWithRedis = Request & { redisClient?: Redis };
    // const redisClient = (req as RequestWithRedis).redisClient;

    // if (!redisClient) {
    //   logger.warn("Redis client not available on request");
    //   return res
    //     .status(500)
    //     .json({ success: false, message: "Redis client unavailable" });
    // }

    const cacheALLPosts = await authReq.redisClient.get(cacheKey);

    if (cacheALLPosts) {
      return res.json(JSON.parse(cacheALLPosts));
    }

    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip: startIndex,
      take: limit,
    });

    const totalPost = await prisma.post.count();

    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPost / limit),
      totalPost: totalPost,
    };

    //save your posts in redis cache
    await authReq.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.json(result);
  } catch (error) {
    logger.error("Error getting all posts", error);
    res.status(500).json({
      success: false,
      messgae: "Error getting all posts",
    });
  }
};

export const getPost = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  logger.info("Get Post endpoint hit with body: %o", req.body);
  try {
    const postId = req.params.id;
    const cacheKey = `post:${postId}`;

    const cachePost = await authReq.redisClient.get(cacheKey);

    if (cachePost) {
      return res.json(JSON.parse(cachePost));
    }

    const postById = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!postById) {
      logger.warn(`No post found on ${postId}`);
      return res.status(404).json({
        status: "false",
        message: "Post not found",
      });
    }

    await authReq.redisClient.setex(cacheKey, 3600, JSON.stringify(postById));
    res.json(postById);
  } catch (error) {
    logger.error("Error getting post", error);
    res.status(500).json({
      success: false,
      messgae: "Error getting post by ID",
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  logger.info("Delete Post endpoint hit with body: %o", req.body);
  try {
    const deletePostId = req.params.id;
    const userId = authReq.user?.userId;

    const post = await prisma.post.findUnique({
      where: {
        id: deletePostId,
      },
    });

    if (!post) {
      logger.warn(`Post is not found on ${deletePostId}`);
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await prisma.post.delete({
      where: {
        id: deletePostId,
        user: userId,
      },
    });

    //publish post delete method
    await publishEvent("post-delete", {
      postId: post.id.toString(),
      userId: authReq.user?.userId,
      mediaIds: post.mediaIds,
    });

    await invalidatePostCache(authReq, deletePostId);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting post", error);
    res.status(500).json({
      success: false,
      messgae: "Error deleting post ",
    });
  }
};
