import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import passport from "./config/passport.js";
import aiRoutes from "./routes/ai.routes.js";
import authRoutes from "./routes/auth.routes.js";
import candidatesRoutes from "./routes/candidates.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

if (env.S3_SKIP) {
  const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");
  app.use(
    "/api/local-uploads",
    express.static(uploadsDir, {
      fallthrough: false,
      setHeaders(res) {
        res.setHeader("Cache-Control", "private, max-age=3600");
      }
    })
  );
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/candidates", candidatesRoutes);

function errorMessageForClient(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Internal Server Error";
  }
  if (err.message) {
    return err.message;
  }
  if (typeof AggregateError !== "undefined" && err instanceof AggregateError && err.errors?.length) {
    return err.errors.map((e) => (e instanceof Error ? e.message : String(e))).join("; ");
  }
  return "Internal Server Error";
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: errorMessageForClient(err) });
});

export default app;
