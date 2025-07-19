import express, { Router } from "express";

import { authenticateRequest } from "../middleware/authMiddleware";
import {
  createPost,
  deletePost,
  getAllPost,
  getPost,
} from "../controller/post-controller";

const router: Router = express.Router();

//middleware
router.use(authenticateRequest);

router.post("/create-post", createPost);
router.get("/all-posts", getAllPost);
router.get("/:id", getPost);
router.delete("/:id", deletePost);

export default router;
