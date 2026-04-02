import { Pool } from "pg";
import { env } from "./env.js";

export const useDemo = env.DB_SKIP;

// Mock stores for demo mode
export const mockUsers = new Map();
export const mockJobs = new Map();
export const mockCandidates = new Map();
export const mockScores = new Map();

let pool: any;

if (useDemo) {
  // Mock pool for demo mode
  pool = {
    query: async (sql: string, params?: any[]) => {
      console.log("[DEMO MODE] Query:", sql.substring(0, 50), "params:", params);
      return { rows: [] };
    }
  };
} else {
  pool = new Pool({
    connectionString: env.DATABASE_URL
  });
}

export { pool };
