# AI Hiring Assistant

Monorepo containing:
- frontend: Next.js (App Router, TypeScript, Tailwind CSS)
- backend: Express + PostgreSQL + AWS S3 + Google Gemini

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:
- `backend/.env`
- `frontend/.env.local`

Use the sample files in each app. For **email/password sign-up**, configure **SMTP** in `backend/.env` (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`) — see `backend/src/config/smtp.requirements.ts` and **SMTP** in `backend/README.md`.

3. Create database schema:

```bash
psql "$DATABASE_URL" -f backend/sql/schema.sql
```

4. Run development servers:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`.
Backend runs on `http://localhost:8000` by default (see `PORT` in `backend/.env`).

See `backend/README.md` for OAuth and Gemini setup details.
