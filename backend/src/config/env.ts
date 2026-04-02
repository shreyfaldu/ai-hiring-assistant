import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Monorepo root often runs `npm run dev -w backend` with cwd = repo root; load backend/.env reliably.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function envTruthy(name: string): boolean {
  const v = process.env[name];
  if (!v) return false;
  return ["true", "1", "yes"].includes(v.trim().toLowerCase());
}

const dbSkip = envTruthy("DB_SKIP");

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  /** In-memory demo data; skips real Postgres (Google login works without a DB). */
  DB_SKIP: dbSkip,
  DATABASE_URL: dbSkip
    ? (process.env.DATABASE_URL ?? "postgresql://127.0.0.1:5432/db_skip_unused")
    : requireEnv("DATABASE_URL"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: requireEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: requireEnv("GOOGLE_CALLBACK_URL"),
  AWS_REGION: requireEnv("AWS_REGION"),
  AWS_S3_BUCKET: requireEnv("AWS_S3_BUCKET"),
  AWS_ACCESS_KEY_ID: requireEnv("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: requireEnv("AWS_SECRET_ACCESS_KEY"),
  GEMINI_API_KEY: requireEnv("GEMINI_API_KEY"),
  /** Gemini API model id (e.g. gemini-2.5-flash). Override if Google renames endpoints. */
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  /**
   * SMTP: all of SMTP_HOST + SMTP_USER + SMTP_PASS must be set to send verification mail.
   * @see smtp.requirements.ts
   */
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_SECURE: envTruthy("SMTP_SECURE"),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@localhost"
};
