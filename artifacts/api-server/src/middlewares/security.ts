import type { NextFunction, Request, Response } from "express";

type Bucket = { count: number; resetAt: number; blockedUntil: number };

const loginBuckets = new Map<string, Bucket>();
const mutationBuckets = new Map<string, Bucket>();

function getIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function enforceLimit(
  buckets: Map<string, Bucket>,
  key: string,
  limit: number,
  windowMs: number,
  blockMs = 0,
): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs, blockedUntil: 0 });
    return true;
  }
  if (current.blockedUntil > now) return false;
  current.count += 1;
  if (current.count > limit) {
    current.blockedUntil = now + blockMs;
    return false;
  }
  return true;
}

export function loginRateLimit(req: Request, res: Response, next: NextFunction): void {
  const identifier = typeof req.body?.identifier === "string" ? req.body.identifier.trim().toLowerCase() : "unknown";
  const allowed = enforceLimit(loginBuckets, `${getIp(req)}:${identifier}`, 5, 15 * 60 * 1000, 15 * 60 * 1000);
  if (!allowed) {
    res.status(429).json({ message: "Too many login attempts. Try again later." });
    return;
  }
  next();
}

export function mutationRateLimit(req: Request, res: Response, next: NextFunction): void {
  const allowed = enforceLimit(mutationBuckets, getIp(req), 120, 60 * 1000);
  if (!allowed) {
    res.status(429).json({ message: "Too many requests. Try again shortly." });
    return;
  }
  next();
}

export function csrfGuard(req: Request, res: Response, next: NextFunction): void {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }
  const origin = req.get("origin");
  const referer = req.get("referer");
  const source = origin || referer;
  if (source) {
    try {
      const sourceUrl = new URL(source);
      if (sourceUrl.host !== req.get("host")) {
        res.status(403).json({ message: "Request origin is not allowed." });
        return;
      }
    } catch {
      res.status(403).json({ message: "Request origin is not allowed." });
      return;
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.authUser?.active) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }
  next();
}

export function requireRole(...roles: Array<"SUPER_ADMIN" | "TEAM_MEMBER">) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.authUser?.active) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }
    if (!roles.includes(req.authUser.role)) {
      res.status(403).json({ message: "You do not have access to this resource." });
      return;
    }
    next();
  };
}