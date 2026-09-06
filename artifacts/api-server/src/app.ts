import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./lib/auth";
import { csrfGuard } from "./middlewares/security";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    try {
      const requestOrigin = new URL(origin);
      const allowedHosts = new Set([
        "punaraxistherapy.in",
        "www.punaraxistherapy.in",
        process.env.REPLIT_DEV_DOMAIN,
      ].filter(Boolean));
      callback(null, allowedHosts.has(requestOrigin.host));
    } catch {
      callback(new Error("Invalid request origin"));
    }
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(csrfGuard);
app.use(authMiddleware);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(self), geolocation=(self), microphone=()");
  res.setHeader("Content-Security-Policy", "default-src 'self'; connect-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  if (process.env.NODE_ENV === "production") res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

app.use("/api", router);

app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  req.log.error({ err: error }, "Unhandled API error");
  if (res.headersSent) return;
  res.status(500).json({ message: "An unexpected server error occurred." });
});

export default app;
