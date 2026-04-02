import { Router } from "express";
import { processAIController } from "../controllers/ai.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/process", authMiddleware, asyncHandler(processAIController));

export default router;
