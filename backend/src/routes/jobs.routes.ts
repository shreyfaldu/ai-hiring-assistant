import { Router } from "express";
import multer from "multer";
import { applyToJob, getJobCandidates } from "../controllers/candidates.controller.js";
import { createJob, getJobById, getJobResume, markJobPosted } from "../controllers/jobs.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.post("/", authMiddleware, asyncHandler(createJob));
router.get("/:id/resume", authMiddleware, asyncHandler(getJobResume));
router.post("/:id/posted", authMiddleware, asyncHandler(markJobPosted));
router.get("/:id", asyncHandler(getJobById));
router.post("/:id/apply", upload.single("resume"), asyncHandler(applyToJob));
router.get("/:id/candidates", authMiddleware, asyncHandler(getJobCandidates));

export default router;
