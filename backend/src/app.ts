import cors from "cors";
import express from "express";
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
