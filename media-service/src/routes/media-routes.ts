import express, { NextFunction, Request, Response, Router } from "express";

import { authenticateRequest } from "../middleware/authMiddleware";
import multer from "multer";
import logger from "../utils/logger";
import { error } from "console";
import { getAllMedia, uploadMedia } from "../controller/media-controller";

const router: Router = express.Router();

//middleware
router.use(authenticateRequest);

//multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("file");

router.post(
  "/upload",
  (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        logger.error(`Multer Error while uploading`, err);
        return res.status(400).json({
          message: "Multer Error while uploading",
          error: err.message,
          stack: err.stack,
        });
      } else if (err) {
        logger.error(`Unknown error occured while uploading`, err);
        return res.status(500).json({
          message: "Unknown error occured while uploading",
          error: err.message,
          stack: err.stack,
        });
      }

      if (!req.file) {
        logger.error(`No file found. Please add a file & try again!`);
        return res.status(400).json({
          message: "No file found. Please add a file & try again!",
        });
      }

      next();
    });
  },
  uploadMedia
);

router.get("/get", getAllMedia);

export default router;
