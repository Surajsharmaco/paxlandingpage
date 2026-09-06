import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { attendanceUsers, db } from "@workspace/db";
import {
  createSession,
  destroySession,
  findLoginUser,
  hashPassword,
  publicUser,
  verifyPassword,
} from "../lib/auth";
import { loginRateLimit, requireAuth } from "../middlewares/security";

const router: IRouter = Router();

const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(160),
  password: z.string().min(1).max(200),
  portal: z.enum(["admin", "team"]),
});

router.post("/auth/login", loginRateLimit, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Enter a valid ID/email and password." });
      return;
    }
    const user = await findLoginUser(parsed.data.identifier);
    const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
    const portalAllowed = user && ((parsed.data.portal === "admin" && user.role === "SUPER_ADMIN") || (parsed.data.portal === "team" && user.role === "TEAM_MEMBER"));
    if (!user || !valid || !portalAllowed || !user.active) {
      req.log.warn({ identifier: parsed.data.identifier.slice(0, 4), portal: parsed.data.portal }, "Rejected login attempt");
      res.status(401).json({ message: "The credentials or portal are not valid." });
      return;
    }

    await db.update(attendanceUsers).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(attendanceUsers.id, user.id));
    await createSession(user, req, res);
    req.log.info({ userId: user.id, role: user.role }, "User logged in");
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get("/auth/me", (req, res) => {
  res.json({ user: req.authUser ?? null });
});

router.post("/auth/logout", async (req, res, next) => {
  try {
    await destroySession(req, res);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/change-password", requireAuth, async (req, res, next) => {
  try {
    const parsed = z.object({
      currentPassword: z.string().min(1).max(200),
      newPassword: z.string().min(12).max(200),
    }).safeParse(req.body);
    if (!parsed.success || !req.authUser) {
      res.status(400).json({ message: "Use a new password with at least 12 characters." });
      return;
    }
    const [user] = await db.select().from(attendanceUsers).where(and(eq(attendanceUsers.id, req.authUser.id), eq(attendanceUsers.active, true))).limit(1);
    if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
      res.status(400).json({ message: "The current password is incorrect." });
      return;
    }
    await db.update(attendanceUsers).set({ passwordHash: await hashPassword(parsed.data.newPassword), updatedAt: new Date() }).where(eq(attendanceUsers.id, user.id));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;