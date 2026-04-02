import { Router } from "express";
import passport from "../config/passport.js";
import { env } from "../config/env.js";
import { getMe, login, resendVerification, signup, verifyEmail } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));
router.post("/verify-email", asyncHandler(verifyEmail));
router.post("/resend-verification", asyncHandler(resendVerification));
router.get("/me", authMiddleware, asyncHandler(getMe));

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${env.FRONTEND_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const user = req.user as { id: string; email: string; name: string };
    const token = signToken(user);
    return res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}`);
  }
);

export default router;
