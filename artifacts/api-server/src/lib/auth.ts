import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { and, eq, gt, or } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import type { AttendanceUser } from "@workspace/db";
import { attendanceSessions, attendanceUsers, db } from "@workspace/db";
import { logger } from "./logger";

const SESSION_COOKIE = "punar_axis_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

export type AuthUser = Pick<AttendanceUser, "id" | "employeeId" | "email" | "name" | "role" | "active">;

function scryptAsync(password: string, salt: Buffer, keyLength: number, options: { N: number; r: number; p: number; maxmem: number }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey as Buffer);
    });
  });
}

export function publicUser(user: AttendanceUser | AuthUser): AuthUser {
  return {
    id: user.id,
    employeeId: user.employeeId,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  });
  return `scrypt$16384$8$1$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [, nValue, rValue, pValue, saltValue, hashValue] = stored.split("$");
  if (!nValue || !rValue || !pValue || !saltValue || !hashValue) return false;
  try {
    const derivedKey = await scryptAsync(
      password,
      Buffer.from(saltValue, "base64url"),
      Buffer.from(hashValue, "base64url").length,
      {
        N: Number(nValue),
        r: Number(rValue),
        p: Number(pValue),
        maxmem: 32 * 1024 * 1024,
      },
    );
    const expected = Buffer.from(hashValue, "base64url");
    return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
  } catch {
    return false;
  }
}

export function hashToken(token: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be configured for secure sessions.");
  return createHmac("sha256", secret).update(token).digest("hex");
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_MS,
  };
}

export async function createSession(user: AttendanceUser, req: Request, res: Response): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await db.insert(attendanceSessions).values({
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    ipAddress: req.ip,
    userAgent: req.get("user-agent")?.slice(0, 500),
  });
  res.cookie(SESSION_COOKIE, token, cookieOptions());
}

export async function destroySession(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token === "string" && token.length > 0) {
    await db.delete(attendanceSessions).where(eq(attendanceSessions.tokenHash, hashToken(token)));
  }
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
}

export async function getSessionUser(req: Request): Promise<AuthUser | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string" || token.length < 20) return null;
  const [result] = await db
    .select({ session: attendanceSessions, user: attendanceUsers })
    .from(attendanceSessions)
    .innerJoin(attendanceUsers, eq(attendanceSessions.userId, attendanceUsers.id))
    .where(and(eq(attendanceSessions.tokenHash, hashToken(token)), gt(attendanceSessions.expiresAt, new Date())))
    .limit(1);
  if (!result || !result.user.active) return null;
  await db.update(attendanceSessions).set({ lastSeenAt: new Date() }).where(eq(attendanceSessions.id, result.session.id));
  return publicUser(result.user);
}

export async function findLoginUser(identifier: string): Promise<AttendanceUser | null> {
  const normalized = identifier.trim().toLowerCase();
  if (!normalized) return null;
  const [user] = await db
    .select()
    .from(attendanceUsers)
    .where(or(eq(attendanceUsers.employeeId, normalized), eq(attendanceUsers.email, normalized)))
    .limit(1);
  return user ?? null;
}

export async function ensureInitialAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const freshBootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const password = freshBootstrapPassword ?? process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !password) return;
  if (password.length < 12) {
    if (!freshBootstrapPassword || process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_INITIAL_PASSWORD must be at least 12 characters.");
    }
    logger.warn("Development-only admin bootstrap is using a short fresh password; change it immediately after login.");
  }
  const [existingAdmin] = await db
    .select()
    .from(attendanceUsers)
    .where(eq(attendanceUsers.role, "SUPER_ADMIN"))
    .limit(1);
  if (existingAdmin) return;
  const passwordHash = await hashPassword(password);
  await db.insert(attendanceUsers).values({
    employeeId: "ADMIN",
    email,
    name: process.env.ADMIN_NAME?.trim() || "Punar Axis Admin",
    role: "SUPER_ADMIN",
    passwordHash,
  });
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    req.authUser = (await getSessionUser(req)) ?? undefined;
    next();
  } catch (error) {
    next(error);
  }
}