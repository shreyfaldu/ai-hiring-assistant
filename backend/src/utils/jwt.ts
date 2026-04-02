import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtUser = {
  id: string;
  email: string;
  name: string;
};

export function signToken(user: JwtUser): string {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtUser {
  return jwt.verify(token, env.JWT_SECRET) as JwtUser;
}
