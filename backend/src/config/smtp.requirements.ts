/**
 * ---------------------------------------------------------------------------
 * SMTP — required for email/password sign-up verification
 * ---------------------------------------------------------------------------
 *
 * Without SMTP, verification codes are only printed in server logs; in
 * development the API may also return `devCode` (not for production).
 *
 * Set these in `backend/.env` (all three are required to enable sending):
 *
 *   SMTP_HOST   — e.g. smtp.gmail.com, smtp.sendgrid.net
 *   SMTP_USER   — SMTP username (SendGrid: literal "apikey")
 *   SMTP_PASS   — password or app-specific / API password
 *
 * Strongly recommended:
 *
 *   EMAIL_FROM  — Sender shown to users; must be allowed by your provider
 *                 e.g. "Hiring Assistant <noreply@yourdomain.com>"
 *
 * Optional:
 *
 *   SMTP_PORT   — default 587 (use 465 with SMTP_SECURE=true if your host requires it)
 *   SMTP_SECURE — "true" for TLS on port 465; default false (STARTTLS on 587)
 *
 * After changing `.env`, restart the backend.
 * ---------------------------------------------------------------------------
 */

export const SMTP_REQUIRED_ENV_NAMES = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"] as const;

export type SmtpRequiredEnvName = (typeof SMTP_REQUIRED_ENV_NAMES)[number];
