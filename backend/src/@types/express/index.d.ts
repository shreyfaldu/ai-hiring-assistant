import { JwtUser } from "../../utils/jwt.js";

declare global {
  namespace Express {
    interface User extends JwtUser {}

    interface Request {
      user?: JwtUser;
    }
  }
}

export {};
