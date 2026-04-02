# Backend Setup

## 1. Environment Variables

Copy and update variables:

```bash
cp .env.example .env
```

Required integrations:
- PostgreSQL connection string in `DATABASE_URL`
- Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- AWS S3 credentials and bucket
- Gemini API key (`GEMINI_API_KEY`)

For **email/password sign-up**, you must configure **SMTP** (see below) or verification codes will not be emailed.

## SMTP (verification emails)

**Requirement:** In `backend/.env`, set **all three** — `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` — plus a sensible `EMAIL_FROM`. Documented in code: `src/config/smtp.requirements.ts`.

**Steps:**

1. Pick a provider (Gmail with an [App Password](https://myaccount.google.com/apppasswords), [SendGrid](https://sendgrid.com/) SMTP, [Resend](https://resend.com/) SMTP, etc.).
2. Copy `backend/.env.example` values into `backend/.env` and fill in real credentials.
3. Use port **587** with `SMTP_SECURE=false`, or port **465** with `SMTP_SECURE=true`, depending on the provider.
4. Set `EMAIL_FROM` to an address your provider allows (verified domain for transactional services).
5. Restart the backend. On startup you should **not** see `[SMTP] Not configured` in development, or the production warning.

API base URL in this repo defaults to port **8000** when using root `npm run dev`; adjust Google OAuth redirect URIs accordingly.

## 2. Create Database Schema

```bash
psql "$DATABASE_URL" -f sql/schema.sql
```

## 3. Run Backend

```bash
npm run dev
```

API base URL: `http://localhost:8000/api` (or your `PORT` in `.env`)

## Google OAuth Setup

In Google Cloud Console:

1. Create an OAuth consent screen.
2. Add OAuth Client ID (Web application).
3. Add authorized redirect URI:
   - `http://localhost:8000/api/auth/google/callback` (match `PORT` and `GOOGLE_CALLBACK_URL` in `.env`)
4. Add authorized JavaScript origin:
   - `http://localhost:3000`

Update `.env` with client ID/secret.

## Endpoints

Auth:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `GET /api/auth/me` (Bearer token)
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

Jobs:
- `POST /api/jobs`
- `GET /api/jobs/:id`

AI:
- `POST /api/ai/process`

Candidates:
- `POST /api/jobs/:id/apply`
- `GET /api/jobs/:id/candidates`
- `POST /api/candidates/:id/score`

## Notes

- Auth-protected endpoints require header:

```http
Authorization: Bearer <JWT>
```

- Resume upload uses in-memory `multer` and stores files to S3.
- Resume parsing and candidate scoring use Gemini with strict JSON parsing when required.
