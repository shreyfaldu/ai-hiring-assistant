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

## 2. Create Database Schema

```bash
psql "$DATABASE_URL" -f sql/schema.sql
```

## 3. Run Backend

```bash
npm run dev
```

API base URL: `http://localhost:5000/api`

## Google OAuth Setup

In Google Cloud Console:

1. Create an OAuth consent screen.
2. Add OAuth Client ID (Web application).
3. Add authorized redirect URI:
   - `http://localhost:5000/api/auth/google/callback`
4. Add authorized JavaScript origin:
   - `http://localhost:3000`

Update `.env` with client ID/secret.

## Endpoints

Auth:
- `POST /api/auth/signup`
- `POST /api/auth/login`
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
