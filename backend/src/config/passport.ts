import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { v4 as uuidv4 } from "uuid";
import { mockUsers, pool, useDemo } from "./db.js";
import { env } from "./env.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("Google account email not available"));
        }

        const name = profile.displayName || email.split("@")[0];
        const picture = profile.photos?.[0]?.value ?? null;
        const googleId = profile.id;

        if (useDemo) {
          const existing = mockUsers.get(email);
          if (existing) {
            const updated = {
              ...existing,
              google_id: existing.google_id ?? googleId,
              profile_picture: existing.profile_picture ?? picture,
              name: existing.name || name
            };
            mockUsers.set(email, updated);

            return done(null, {
              id: updated.id,
              email: updated.email,
              name: updated.name
            });
          }

          const created = {
            id: uuidv4(),
            name,
            email,
            google_id: googleId,
            profile_picture: picture,
            passwordHash: ""
          };
          mockUsers.set(email, created);

          return done(null, {
            id: created.id,
            email: created.email,
            name: created.name
          });
        }

        const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (existing.rows.length > 0) {
          const user = existing.rows[0];
          if (!user.google_id) {
            await pool.query(
              "UPDATE users SET google_id = $1, profile_picture = COALESCE($2, profile_picture), name = COALESCE(name, $3), email_verified = true WHERE id = $4",
              [googleId, picture, name, user.id]
            );
          }

          return done(null, {
            id: user.id,
            email: user.email,
            name: user.name || name
          });
        }

        const created = await pool.query(
          `INSERT INTO users (name, email, google_id, profile_picture, email_verified)
           VALUES ($1, $2, $3, $4, true)
           RETURNING id, name, email`,
          [name, email, googleId, picture]
        );

        const createdUser = created.rows[0];
        if (!createdUser) {
          return done(new Error("Failed to create user from Google profile"));
        }

        return done(null, createdUser);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;
