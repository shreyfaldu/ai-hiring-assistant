import { Router } from "express";
import passport from "../config/passport.js";
import { env } from "../config/env.js";
import { login, signup } from "../controllers/auth.controller.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));

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
