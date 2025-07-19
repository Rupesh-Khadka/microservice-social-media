import logger from "../utils/logger";
import { prisma } from "../utils/prisma";
import { deleteMediaFromS3 } from "../utils/s3";

export const handlePostDelete = async (event: any) => {
  const { postId, mediaIds } = event;
  if (!postId && !mediaIds) {
    logger(`PostID or MediaIds is missing`);
  }
  try {
    const mediaToDelete = await prisma.media.findMany({
      where: {
        publicId: {
          in: mediaIds,
        },
      },
    });

    for (const media of mediaToDelete) {
      try {
        await deleteMediaFromS3(media.s3Key);
        logger.info(
          `Deleted media ${media.s3Key} associated with post ${postId}`
        );
      } catch (err) {
        logger.error(`Failed to delete ${media.s3Key} from S3`, err);
      }
    }

    // Delete all from DB at once
    await prisma.media.deleteMany({
      where: {
        publicId: {
          in: mediaToDelete.map((media) => media.publicId),
        },
      },
    });

    logger.info(`Processed deletion of media for post id ${postId}`);
  } catch (error) {
    logger.error(`Error occured while media deletion`, error);
  }
};
