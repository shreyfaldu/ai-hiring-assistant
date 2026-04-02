import app from "./app.js";
import { env } from "./config/env.js";
import { isSmtpConfigured } from "./services/email.service.js";

app.listen(env.PORT, () => {
  console.log(`Backend running on http://localhost:${env.PORT}`);

  if (!isSmtpConfigured()) {
    if (env.NODE_ENV === "production") {
      console.warn(
        "[SMTP] Production: set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env (see config/smtp.requirements.ts) or email verification will not be delivered."
      );
    } else {
      console.info(
        "[SMTP] Not configured — verification codes only in server logs; dev responses may include devCode. See config/smtp.requirements.ts"
      );
    }
  }
});
