import { Router } from "express";
import { scoreCandidate } from "../controllers/candidates.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/:id/score", authMiddleware, asyncHandler(scoreCandidate));

export default router;
