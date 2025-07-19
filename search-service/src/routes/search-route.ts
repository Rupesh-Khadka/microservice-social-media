import express, { Router } from "express";
import { authenticateRequest } from "../middleware/authMiddleware";
import { searchPostController } from "../controller/search-controller";

const router: Router = express.Router();

router.use(authenticateRequest);

router.get("/posts", searchPostController);

export default router;
