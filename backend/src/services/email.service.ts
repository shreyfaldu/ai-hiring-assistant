/**
 * Verification emails — env requirements are documented in `config/smtp.requirements.ts`.
 */
import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export function isSmtpConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

export async function sendVerificationEmail(to: string, code: string, name: string): Promise<void> {
  const subject = "Your verification code — Hiring Assistant";
  const text = `Hi ${name},\n\nYour verification code is: ${code}\n\nIt expires in 15 minutes.\n\nIf you did not sign up, ignore this email.`;

  if (!isSmtpConfigured()) {
    console.info(`[email] SMTP not configured. Verification code for ${to}: ${code}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text
  });
}
