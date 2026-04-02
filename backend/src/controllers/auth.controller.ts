import bcrypt from "bcrypt";
import { randomInt } from "node:crypto";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env.js";
import { pool, useDemo, mockUsers } from "../config/db.js";
import { isSmtpConfigured, sendVerificationEmail } from "../services/email.service.js";
import { signToken } from "../utils/jwt.js";

const VERIFY_TTL_MS = 15 * 60 * 1000;

function mockUserById(id: string) {
  for (const u of mockUsers.values()) {
    if ((u as { id: string }).id === id) {
      return u as { id: string; name: string; email: string; passwordHash?: string; profile_picture?: string | null };
    }
  }
  return null;
}

export async function signup(req: Request, res: Response) {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  if (useDemo) {
    if (mockUsers.has(email)) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    mockUsers.set(email, { id: userId, name, email, passwordHash });

    const user = { id: userId, name, email };
    const token = signToken(user);
    return res.status(201).json({ token, user, email_verified: true });
  }

  const existing = await pool.query("SELECT id, email_verified FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const code = String(randomInt(100_000, 1_000_000));
  const expiresAt = new Date(Date.now() + VERIFY_TTL_MS);

  await pool.query(
    `INSERT INTO users (name, email, password_hash, email_verified, verification_code, verification_code_expires_at)
     VALUES ($1, $2, $3, false, $4, $5)`,
    [name, email, passwordHash, code, expiresAt]
  );

  await sendVerificationEmail(email, code, name);

  const payload: {
    message: string;
    email: string;
    devCode?: string;
  } = {
    message: "We sent a verification code to your email. Enter it below to activate your account.",
    email
  };

  if (env.NODE_ENV === "development" && !isSmtpConfigured()) {
    payload.devCode = code;
  }

  return res.status(201).json(payload);
}

export async function verifyEmail(req: Request, res: Response) {
  const { email, code } = req.body as { email?: string; code?: string };

  if (!email || !code) {
    return res.status(400).json({ message: "Email and verification code are required" });
  }

  if (useDemo) {
    return res.status(400).json({ message: "Demo mode uses instant signup — no code needed." });
  }

  const result = await pool.query(
    `SELECT id, name, email, email_verified, verification_code, verification_code_expires_at
     FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "No account found for this email" });
  }

  const user = result.rows[0];
  if (user.email_verified) {
    const token = signToken({ id: user.id, email: user.email, name: user.name });
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
      message: "Email already verified. You are signed in."
    });
  }

  if (user.verification_code !== code.trim()) {
    return res.status(400).json({ message: "Invalid verification code" });
  }

  if (!user.verification_code_expires_at || new Date(user.verification_code_expires_at) < new Date()) {
    return res.status(400).json({ message: "Verification code has expired. Request a new one." });
  }

  await pool.query(
    `UPDATE users SET email_verified = true, verification_code = NULL, verification_code_expires_at = NULL WHERE id = $1`,
    [user.id]
  );

  const token = signToken({ id: user.id, email: user.email, name: user.name });

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
    message: "Email verified. Welcome!"
  });
}

export async function resendVerification(req: Request, res: Response) {
  const { email } = req.body as { email?: string };

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (useDemo) {
    return res.status(400).json({ message: "Not available in demo mode." });
  }

  const result = await pool.query(
    `SELECT id, name, email_verified FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "No account found for this email" });
  }

  const row = result.rows[0];
  if (row.email_verified) {
    return res.status(400).json({ message: "This email is already verified. Try logging in." });
  }

  const code = String(randomInt(100_000, 1_000_000));
  const expiresAt = new Date(Date.now() + VERIFY_TTL_MS);

  await pool.query(
    `UPDATE users SET verification_code = $1, verification_code_expires_at = $2 WHERE id = $3`,
    [code, expiresAt, row.id]
  );

  await sendVerificationEmail(email, code, row.name);

  const payload: { message: string; devCode?: string } = {
    message: "A new verification code has been sent."
  };
  if (env.NODE_ENV === "development" && !isSmtpConfigured()) {
    payload.devCode = code;
  }

  return res.json(payload);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (useDemo) {
    const mockUser = mockUsers.get(email);
    if (!mockUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, (mockUser as { passwordHash: string }).passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const u = mockUser as { id: string; email: string; name: string };
    const token = signToken({
      id: u.id,
      email: u.email,
      name: u.name
    });

    return res.json({
      token,
      user: { id: u.id, name: u.name, email: u.email },
      email_verified: true
    });
  }

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = result.rows[0];
  if (!user.password_hash) {
    return res.status(401).json({ message: "Use Google login for this account" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!user.email_verified) {
    return res.status(403).json({
      message: "Please verify your email before logging in.",
      code: "EMAIL_NOT_VERIFIED",
      email: user.email
    });
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name
  });

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
    email_verified: true
  });
}

export async function getMe(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (useDemo) {
    const u = mockUserById(userId);
    if (!u) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        profile_picture: u.profile_picture ?? null,
        email_verified: true
      }
    });
  }

  const result = await pool.query(
    `SELECT id, name, email, profile_picture, email_verified FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const row = result.rows[0];
  return res.json({
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      profile_picture: row.profile_picture,
      email_verified: row.email_verified
    }
  });
}
