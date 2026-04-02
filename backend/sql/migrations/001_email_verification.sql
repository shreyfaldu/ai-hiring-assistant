-- Run once on existing databases (before this column existed in schema.sql).
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMPTZ;

-- Existing accounts keep access (treat as already verified).
UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE AND verification_code IS NULL;
