import { Request, Response } from "express";
import logger from "../utils/logger";
import { AuthenticatedRequest } from "../types/express";
import { uploadMediaToS3 } from "../utils/s3";
import { prisma } from "../utils/prisma";

export const uploadMedia = async (req: Request, res: Response) => {
  logger.info(`Starting media upload`);
  console.log(req.file);
  try {
    if (!req.file) {
      logger.error(`No file found. Please add a file & try again!`);
      return res.status(400).json({
        success: false,
        message: "No file found. Please add a file & try again!",
      });
    }
    console.log(req.file);
    const { originalname, mimetype } = req.file;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    logger.info(`File details: name:${originalname}, type:${mimetype}`);
    logger.info(`Uploading to S3 starting....`);

    const s3UploadResult = await uploadMediaToS3(req.file);

    logger.info(`S3 uploaded successfully. Public URL: ${s3UploadResult.url}`);

    const mediaRecord = await prisma.media.create({
      data: {
        originalName: originalname,
        mimeType: mimetype,
        url: s3UploadResult.url,
        s3Key: s3UploadResult.key,
        userId: userId as string,
      },
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded and saved to DB successfully",
      mediaId: mediaRecord.publicId,
      fileName: mediaRecord.s3Key,
      url: mediaRecord.url,
    });
  } catch (error) {
    logger.error("Error uploading media", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllMedia = async (req: Request, res: Response) => {
  try {
    const mediaList = await prisma.media.findMany();

    return res.status(200).json({
      success: true,
      data: mediaList,
    });
  } catch (error) {
    logger.error("Error fetching media", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch media",
    });
  }
};
