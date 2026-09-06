import { createHash, randomBytes } from "node:crypto";
import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  attendanceAuditLog,
  attendanceChallenges,
  attendanceCheckoutEvidence,
  attendanceEvidence,
  attendanceRecords,
  attendanceSettings,
  attendanceUsers,
  db,
} from "@workspace/db";
import { hashPassword } from "../lib/auth";
import { mutationRateLimit, requireRole } from "../middlewares/security";

const router: IRouter = Router();
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_PATTERN = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=_-]+)$/;

const settingsSchema = z.object({
  clinicLatitude: z.number().finite().min(-90).max(90),
  clinicLongitude: z.number().finite().min(-180).max(180),
  geofenceRadiusM: z.number().int().min(25).max(5000),
  maxGpsAccuracyM: z.number().int().min(10).max(1000),
  lateAfterMinutes: z.number().int().min(0).max(720),
  retentionDays: z.number().int().min(30).max(3650),
  privacyNoticeVersion: z.string().trim().min(1).max(40),
});

function todayInClinicTimezone(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.CLINIC_TIMEZONE || "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parsePage(value: unknown, fallback: number, max: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

function parseIsoDate(value: unknown): string | undefined {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  return value;
}

function parseMonth(value: unknown): { month: string; dates: string[] } | null {
  if (typeof value !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return null;
  const [year, month] = value.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dates = Array.from({ length: daysInMonth }, (_, index) => `${value}-${String(index + 1).padStart(2, "0")}`);
  return { month: value, dates };
}

function workedMinutes(checkInAt: Date, checkOutAt: Date | null, now = new Date()): number {
  const end = checkOutAt ?? now;
  return Math.max(0, Math.round((end.getTime() - checkInAt.getTime()) / 60000));
}

function parseUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function routeParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function distanceMeters(latitude: number, longitude: number, targetLatitude: number, targetLongitude: number): number {
  const earthRadius = 6371000;
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const deltaLatitude = toRadians(targetLatitude - latitude);
  const deltaLongitude = toRadians(targetLongitude - longitude);
  const a = Math.sin(deltaLatitude / 2) ** 2 + Math.cos(toRadians(latitude)) * Math.cos(toRadians(targetLatitude)) * Math.sin(deltaLongitude / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getSettings() {
  const [existing] = await db.select().from(attendanceSettings).where(eq(attendanceSettings.id, 1)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(attendanceSettings).values({
    id: 1,
    clinicLatitude: Number(process.env.CLINIC_LATITUDE || 0),
    clinicLongitude: Number(process.env.CLINIC_LONGITUDE || 0),
    geofenceRadiusM: Number(process.env.GEOFENCE_RADIUS_M || 150),
    maxGpsAccuracyM: Number(process.env.MAX_GPS_ACCURACY_M || 100),
    lateAfterMinutes: Number(process.env.LATE_AFTER_MINUTES || 15),
    retentionDays: Number(process.env.ATTENDANCE_RETENTION_DAYS || 365),
    privacyNoticeVersion: process.env.PRIVACY_NOTICE_VERSION || "2026-01",
  }).returning();
  return created;
}

function decodePhoto(value: unknown): { buffer: Buffer; contentType: string; hash: string } | null {
  if (typeof value !== "string") return null;
  const match = PHOTO_PATTERN.exec(value);
  if (!match) return null;
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0 || buffer.length > MAX_PHOTO_BYTES) return null;
  return {
    buffer,
    contentType: match[1],
    hash: createHash("sha256").update(buffer).digest("hex"),
  };
}

function safeRecord(record: typeof attendanceRecords.$inferSelect) {
  return {
    id: record.id,
    userId: record.userId,
    workDate: record.workDate,
    checkInAt: record.checkInAt,
    checkOutAt: record.checkOutAt,
    status: record.status,
    riskLevel: record.riskLevel,
    riskSignals: record.riskSignals,
    correctionReason: record.correctionReason,
  };
}

async function writeAudit(values: {
  actorUserId: string | null;
  attendanceId?: string | null;
  targetUserId?: string | null;
  action: string;
  reason?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  ipAddress?: string;
}) {
  await db.insert(attendanceAuditLog).values(values);
}

const attendancePayloadSchema = z.object({
  nonce: z.string().min(20).max(200),
  idempotencyKey: z.string().trim().min(8).max(120),
  latitude: z.coerce.number().finite().min(-90).max(90),
  longitude: z.coerce.number().finite().min(-180).max(180),
  accuracyM: z.coerce.number().finite().positive().max(10000),
  consent: z.coerce.boolean(),
  consentVersion: z.string().trim().min(1).max(40),
  captureMethod: z.literal("camera"),
  facePhoto: z.string().min(20),
  workplacePhoto: z.string().min(20),
  integritySignals: z.string().optional(),
});

router.get("/attendance/settings/public", requireRole("TEAM_MEMBER", "SUPER_ADMIN"), async (_req, res, next) => {
  try {
    const settings = await getSettings();
    res.json({
      privacyNoticeVersion: settings.privacyNoticeVersion,
      maxGpsAccuracyM: settings.maxGpsAccuracyM,
      geofenceRadiusM: settings.geofenceRadiusM,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/attendance/session", requireRole("TEAM_MEMBER"), mutationRateLimit, async (req, res, next) => {
  try {
    if (!req.authUser) return;
    const settings = await getSettings();
    const nonce = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await db.insert(attendanceChallenges).values({
      userId: req.authUser.id,
      nonceHash: createHash("sha256").update(nonce).digest("hex"),
      purpose: "CHECK_IN",
      expiresAt,
    });
    res.json({
      nonce,
      expiresAt,
      serverTime: new Date(),
      privacyNoticeVersion: settings.privacyNoticeVersion,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/attendance/checkout/session", requireRole("TEAM_MEMBER"), mutationRateLimit, async (req, res, next) => {
  try {
    if (!req.authUser) return;
    const [record] = await db.select({ checkOutAt: attendanceRecords.checkOutAt }).from(attendanceRecords).where(and(
      eq(attendanceRecords.userId, req.authUser.id),
      eq(attendanceRecords.workDate, todayInClinicTimezone()),
    )).limit(1);
    if (!record) {
      res.status(404).json({ message: "Check in before starting check-out." });
      return;
    }
    if (record.checkOutAt) {
      res.status(409).json({ message: "Attendance is already checked out for today." });
      return;
    }
    const settings = await getSettings();
    const nonce = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await db.insert(attendanceChallenges).values({
      userId: req.authUser.id,
      nonceHash: createHash("sha256").update(nonce).digest("hex"),
      purpose: "CHECK_OUT",
      expiresAt,
    });
    res.json({ nonce, expiresAt, serverTime: new Date(), privacyNoticeVersion: settings.privacyNoticeVersion });
  } catch (error) {
    next(error);
  }
});

router.post("/attendance/finalize", requireRole("TEAM_MEMBER"), mutationRateLimit, async (req, res, next) => {
  try {
    if (!req.authUser) return;
    const parsed = attendancePayloadSchema.safeParse(req.body);
    if (!parsed.success || !parsed.data.consent) {
      res.status(400).json({ message: "Consent, live camera photos and location are required." });
      return;
    }
    const face = decodePhoto(parsed.data.facePhoto);
    const workplace = decodePhoto(parsed.data.workplacePhoto);
    if (!face || !workplace || face.contentType !== workplace.contentType) {
      res.status(400).json({ message: "Use valid JPEG, PNG or WebP camera captures under 5 MB each." });
      return;
    }
    const settings = await getSettings();
    if (parsed.data.accuracyM > settings.maxGpsAccuracyM) {
      res.status(422).json({ message: `Location accuracy must be ${settings.maxGpsAccuracyM}m or better.` });
      return;
    }
    const distanceM = distanceMeters(parsed.data.latitude, parsed.data.longitude, settings.clinicLatitude, settings.clinicLongitude);
    const riskSignals: string[] = [];
    if (parsed.data.accuracyM > settings.maxGpsAccuracyM * 0.7) riskSignals.push("gps_accuracy_near_limit");
    if (parsed.data.integritySignals) riskSignals.push("client_signals_recorded");
    const riskLevel: "LOW" | "MEDIUM" = riskSignals.length >= 2 ? "MEDIUM" : "LOW";
    const now = new Date();
    const workDate = todayInClinicTimezone();
    const nonceHash = createHash("sha256").update(parsed.data.nonce).digest("hex");
    const result = await db.transaction(async (tx) => {
      const [existingByIdempotency] = await tx.select().from(attendanceRecords).where(and(
        eq(attendanceRecords.userId, req.authUser!.id),
        eq(attendanceRecords.idempotencyKey, parsed.data.idempotencyKey),
      )).limit(1);
      if (existingByIdempotency) return existingByIdempotency;

      const [challenge] = await tx.select().from(attendanceChallenges).where(and(
        eq(attendanceChallenges.userId, req.authUser!.id),
        eq(attendanceChallenges.nonceHash, nonceHash),
        eq(attendanceChallenges.purpose, "CHECK_IN"),
        isNull(attendanceChallenges.consumedAt),
        gte(attendanceChallenges.expiresAt, now),
      )).limit(1);
      if (!challenge) throw new Error("INVALID_ATTENDANCE_NONCE");

      const [existingToday] = await tx.select().from(attendanceRecords).where(and(
        eq(attendanceRecords.userId, req.authUser!.id),
        eq(attendanceRecords.workDate, workDate),
      )).limit(1);
      if (existingToday) throw new Error("ALREADY_CHECKED_IN");

      const [record] = await tx.insert(attendanceRecords).values({
        userId: req.authUser!.id,
        workDate,
        checkInAt: now,
        status: riskLevel === "MEDIUM" ? "FLAGGED" : "PRESENT",
        riskLevel,
        riskSignals,
        idempotencyKey: parsed.data.idempotencyKey,
      }).returning();
      await tx.insert(attendanceEvidence).values({
        attendanceId: record.id,
        facePhoto: face.buffer,
        workplacePhoto: workplace.buffer,
        contentType: face.contentType,
        facePhotoHash: face.hash,
        workplacePhotoHash: workplace.hash,
        capturedAt: now,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        accuracyM: parsed.data.accuracyM,
        distanceM,
        captureMethod: parsed.data.captureMethod,
        consentVersion: parsed.data.consentVersion,
      });
      await tx.update(attendanceChallenges).set({ consumedAt: now }).where(eq(attendanceChallenges.id, challenge.id));
      await tx.insert(attendanceAuditLog).values({
        actorUserId: req.authUser!.id,
        targetUserId: req.authUser!.id,
        attendanceId: record.id,
        action: "ATTENDANCE_CHECK_IN",
        afterState: safeRecord(record),
        ipAddress: req.ip,
      });
      return record;
    });
    res.status(201).json({ record: safeRecord(result) });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ATTENDANCE_NONCE") {
      res.status(409).json({ message: "This attendance session expired or was already used." });
      return;
    }
    if (error instanceof Error && error.message === "ALREADY_CHECKED_IN") {
      res.status(409).json({ message: "Attendance is already recorded for today." });
      return;
    }
    next(error);
  }
});

router.post("/attendance/checkout", requireRole("TEAM_MEMBER"), mutationRateLimit, async (req, res, next) => {
  try {
    if (!req.authUser) return;
    const parsed = attendancePayloadSchema.safeParse(req.body);
    if (!parsed.success || !parsed.data.consent) {
      res.status(400).json({ message: "Consent, live camera photos and location are required for check-out." });
      return;
    }
    const face = decodePhoto(parsed.data.facePhoto);
    const workplace = decodePhoto(parsed.data.workplacePhoto);
    if (!face || !workplace || face.contentType !== workplace.contentType) {
      res.status(400).json({ message: "Use valid JPEG, PNG or WebP camera captures under 5 MB each." });
      return;
    }
    const settings = await getSettings();
    if (parsed.data.accuracyM > settings.maxGpsAccuracyM) {
      res.status(422).json({ message: `Location accuracy must be ${settings.maxGpsAccuracyM}m or better.` });
      return;
    }
    const distanceM = distanceMeters(parsed.data.latitude, parsed.data.longitude, settings.clinicLatitude, settings.clinicLongitude);
    const riskSignals: string[] = [];
    if (parsed.data.accuracyM > settings.maxGpsAccuracyM * 0.7) riskSignals.push("gps_accuracy_near_limit");
    if (parsed.data.integritySignals) riskSignals.push("client_signals_recorded");
    const now = new Date();
    const nonceHash = createHash("sha256").update(parsed.data.nonce).digest("hex");
    const result = await db.transaction(async (tx) => {
      const [existingByIdempotency] = await tx.select().from(attendanceRecords).where(and(
        eq(attendanceRecords.userId, req.authUser!.id),
        eq(attendanceRecords.checkoutIdempotencyKey, parsed.data.idempotencyKey),
      )).limit(1);
      if (existingByIdempotency) return existingByIdempotency;

      const [record] = await tx.select().from(attendanceRecords).where(and(
        eq(attendanceRecords.userId, req.authUser!.id),
        eq(attendanceRecords.workDate, todayInClinicTimezone()),
      )).limit(1);
      if (!record) throw new Error("NO_ATTENDANCE_TODAY");
      if (record.checkOutAt) throw new Error("ALREADY_CHECKED_OUT");

      const [challenge] = await tx.select().from(attendanceChallenges).where(and(
        eq(attendanceChallenges.userId, req.authUser!.id),
        eq(attendanceChallenges.nonceHash, nonceHash),
        eq(attendanceChallenges.purpose, "CHECK_OUT"),
        isNull(attendanceChallenges.consumedAt),
        gte(attendanceChallenges.expiresAt, now),
      )).limit(1);
      if (!challenge) throw new Error("INVALID_ATTENDANCE_NONCE");

      const [updated] = await tx.update(attendanceRecords).set({
        checkOutAt: now,
        checkoutIdempotencyKey: parsed.data.idempotencyKey,
        updatedAt: now,
      }).where(and(eq(attendanceRecords.id, record.id), isNull(attendanceRecords.checkOutAt))).returning();
      if (!updated) throw new Error("ALREADY_CHECKED_OUT");
      const finalRecord = updated;
      await tx.insert(attendanceCheckoutEvidence).values({
        attendanceId: record.id,
        facePhoto: face.buffer,
        workplacePhoto: workplace.buffer,
        contentType: face.contentType,
        facePhotoHash: face.hash,
        workplacePhotoHash: workplace.hash,
        capturedAt: now,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        accuracyM: parsed.data.accuracyM,
        distanceM,
        captureMethod: parsed.data.captureMethod,
        consentVersion: parsed.data.consentVersion,
      });
      await tx.update(attendanceChallenges).set({ consumedAt: now }).where(eq(attendanceChallenges.id, challenge.id));
      await tx.insert(attendanceAuditLog).values({
        actorUserId: req.authUser!.id,
        targetUserId: req.authUser!.id,
        attendanceId: record.id,
        action: "ATTENDANCE_CHECK_OUT",
        beforeState: safeRecord(record),
        afterState: safeRecord(finalRecord),
        ipAddress: req.ip,
      });
      return finalRecord;
    });
    res.json({ record: safeRecord(result) });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ATTENDANCE_TODAY") {
      res.status(404).json({ message: "No attendance record was found for today." });
      return;
    }
    if (error instanceof Error && error.message === "ALREADY_CHECKED_OUT") {
      res.status(409).json({ message: "Attendance is already checked out for today." });
      return;
    }
    if (error instanceof Error && error.message === "INVALID_ATTENDANCE_NONCE") {
      res.status(409).json({ message: "This check-out session expired or was already used." });
      return;
    }
    next(error);
  }
});

router.get("/attendance/me", requireRole("TEAM_MEMBER"), async (req, res, next) => {
  try {
    if (!req.authUser) return;
    const [today] = await db.select().from(attendanceRecords).where(and(eq(attendanceRecords.userId, req.authUser.id), eq(attendanceRecords.workDate, todayInClinicTimezone()))).limit(1);
    res.json({ today: today ? safeRecord(today) : null, serverTime: new Date() });
  } catch (error) {
    next(error);
  }
});

router.get("/attendance/me/history", requireRole("TEAM_MEMBER"), async (req, res, next) => {
  try {
    if (!req.authUser) return;
    const page = parsePage(req.query.page, 1, 10000);
    const pageSize = Math.min(parsePage(req.query.pageSize, 20, 100), 100);
    const records = await db.select().from(attendanceRecords).where(eq(attendanceRecords.userId, req.authUser.id)).orderBy(desc(attendanceRecords.workDate)).limit(pageSize).offset((page - 1) * pageSize);
    res.json({ records: records.map(safeRecord), page, pageSize });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/summary", requireRole("SUPER_ADMIN"), async (_req, res, next) => {
  try {
    const date = todayInClinicTimezone();
    const [employees] = await db.select({ count: sql<number>`count(*)` }).from(attendanceUsers).where(and(eq(attendanceUsers.role, "TEAM_MEMBER"), eq(attendanceUsers.active, true)));
    const [present] = await db.select({ count: sql<number>`count(*)` }).from(attendanceRecords).where(and(eq(attendanceRecords.workDate, date), or(eq(attendanceRecords.status, "PRESENT"), eq(attendanceRecords.status, "LATE"), eq(attendanceRecords.status, "FLAGGED"), eq(attendanceRecords.status, "CORRECTED"))));
    const [flagged] = await db.select({ count: sql<number>`count(*)` }).from(attendanceRecords).where(and(eq(attendanceRecords.workDate, date), eq(attendanceRecords.status, "FLAGGED")));
      const activeEmployees = Number(employees?.count ?? 0);
      const presentToday = Number(present?.count ?? 0);
      res.json({
        date,
        activeEmployees,
        presentToday,
        attendancePercent: activeEmployees > 0 ? Math.round((presentToday / activeEmployees) * 100) : 0,
        flaggedToday: Number(flagged?.count ?? 0),
      });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/employees", requireRole("SUPER_ADMIN"), async (req, res, next) => {
  try {
    const page = parsePage(req.query.page, 1, 10000);
    const pageSize = Math.min(parsePage(req.query.pageSize, 20, 100), 100);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const condition = search ? or(ilike(attendanceUsers.name, `%${search}%`), ilike(attendanceUsers.employeeId, `%${search}%`), ilike(attendanceUsers.email, `%${search}%`)) : undefined;
    const employees = await db.select({
      id: attendanceUsers.id,
      employeeId: attendanceUsers.employeeId,
      email: attendanceUsers.email,
      name: attendanceUsers.name,
      role: attendanceUsers.role,
      active: attendanceUsers.active,
      minimumWorkMinutes: attendanceUsers.minimumWorkMinutes,
      lastLoginAt: attendanceUsers.lastLoginAt,
      createdAt: attendanceUsers.createdAt,
    }).from(attendanceUsers).where(condition).orderBy(asc(attendanceUsers.name)).limit(pageSize).offset((page - 1) * pageSize);
    res.json({ employees, page, pageSize });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/employees/:id/attendance", requireRole("SUPER_ADMIN"), async (req, res, next) => {
  try {
    const employeeId = routeParam(req.params.id);
    const parsedMonth = parseMonth(req.query.month);
    if (!parseUuid(employeeId) || !parsedMonth) {
      res.status(400).json({ message: "A valid employee and month are required." });
      return;
    }
    const [employee] = await db.select({
      id: attendanceUsers.id,
      employeeId: attendanceUsers.employeeId,
      email: attendanceUsers.email,
      name: attendanceUsers.name,
      active: attendanceUsers.active,
      minimumWorkMinutes: attendanceUsers.minimumWorkMinutes,
    }).from(attendanceUsers).where(and(eq(attendanceUsers.id, employeeId), eq(attendanceUsers.role, "TEAM_MEMBER"))).limit(1);
    if (!employee) {
      res.status(404).json({ message: "Employee not found." });
      return;
    }

    const firstDate = parsedMonth.dates[0];
    const lastDate = parsedMonth.dates[parsedMonth.dates.length - 1];
    const rows = await db.select({
      record: attendanceRecords,
      checkInEvidenceId: attendanceEvidence.id,
      checkInLatitude: attendanceEvidence.latitude,
      checkInLongitude: attendanceEvidence.longitude,
      checkInAccuracyM: attendanceEvidence.accuracyM,
      checkInCapturedAt: attendanceEvidence.capturedAt,
      checkoutEvidenceId: attendanceCheckoutEvidence.id,
      checkoutLatitude: attendanceCheckoutEvidence.latitude,
      checkoutLongitude: attendanceCheckoutEvidence.longitude,
      checkoutAccuracyM: attendanceCheckoutEvidence.accuracyM,
      checkoutCapturedAt: attendanceCheckoutEvidence.capturedAt,
    }).from(attendanceRecords)
      .leftJoin(attendanceEvidence, eq(attendanceEvidence.attendanceId, attendanceRecords.id))
      .leftJoin(attendanceCheckoutEvidence, eq(attendanceCheckoutEvidence.attendanceId, attendanceRecords.id))
      .where(and(eq(attendanceRecords.userId, employeeId), gte(attendanceRecords.workDate, firstDate), lte(attendanceRecords.workDate, lastDate)));

    const now = new Date();
    const today = todayInClinicTimezone();
    const targetMinutes = employee.minimumWorkMinutes;
    const recordsByDate = new Map(rows.map((row) => [row.record.workDate, {
      record: row.record,
      hasCheckInEvidence: Boolean(row.checkInEvidenceId),
      checkInLocation: row.checkInEvidenceId ? {
        latitude: row.checkInLatitude,
        longitude: row.checkInLongitude,
        accuracyM: row.checkInAccuracyM,
        capturedAt: row.checkInCapturedAt,
      } : null,
      hasCheckoutEvidence: Boolean(row.checkoutEvidenceId),
      checkoutLocation: row.checkoutEvidenceId ? {
        latitude: row.checkoutLatitude,
        longitude: row.checkoutLongitude,
        accuracyM: row.checkoutAccuracyM,
        capturedAt: row.checkoutCapturedAt,
      } : null,
    }]));
    const days = parsedMonth.dates.map((workDate) => {
      const entry = recordsByDate.get(workDate);
      const record = entry?.record;
      const minutes = record ? workedMinutes(record.checkInAt, record.checkOutAt, now) : 0;
      let state: "MET" | "BELOW_TARGET" | "MISSED" | "IN_PROGRESS" | "TODAY" | "FUTURE" | "RECORDED";
      if (workDate > today) state = "FUTURE";
      else if (!record) state = workDate === today ? "TODAY" : "MISSED";
      else if (!record.checkOutAt) state = workDate === today ? "IN_PROGRESS" : "BELOW_TARGET";
      else if (targetMinutes > 0 && minutes >= targetMinutes) state = "MET";
      else if (targetMinutes > 0) state = "BELOW_TARGET";
      else state = "RECORDED";
      return {
        date: workDate,
        state,
        checkInAt: record?.checkInAt ?? null,
        checkOutAt: record?.checkOutAt ?? null,
        workedMinutes: minutes,
        status: record?.status ?? null,
        riskLevel: record?.riskLevel ?? null,
        recordId: record?.id ?? null,
        hasCheckInEvidence: entry?.hasCheckInEvidence ?? false,
        hasCheckoutEvidence: entry?.hasCheckoutEvidence ?? false,
        checkInLocation: entry?.checkInLocation ?? null,
        checkoutLocation: entry?.checkoutLocation ?? null,
      };
    });
    const daysMet = days.filter((day) => day.state === "MET").length;
    const daysBelowTarget = days.filter((day) => day.state === "BELOW_TARGET").length;
    const daysMissed = days.filter((day) => day.state === "MISSED").length;
    const eligibleDays = daysMet + daysBelowTarget + daysMissed;
    const totalWorkedMinutes = days.reduce((total, day) => total + day.workedMinutes, 0);
    res.json({
      month: parsedMonth.month,
      employee,
      targetMinutes,
      targetHours: Math.round((targetMinutes * eligibleDays / 60) * 100) / 100,
      summary: {
        daysMet,
        daysBelowTarget,
        daysMissed,
        eligibleDays,
        totalWorkedMinutes,
        completionPercentage: targetMinutes > 0 && eligibleDays > 0 ? Math.round((daysMet / eligibleDays) * 100) : 0,
      },
      days,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/employees", requireRole("SUPER_ADMIN"), mutationRateLimit, async (req, res, next) => {
  try {
    if (!req.authUser) return;
    const parsed = z.object({
      employeeId: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9_-]+$/),
      email: z.string().trim().email().max(160).optional().or(z.literal("")),
      name: z.string().trim().min(2).max(120),
      password: z.string().min(12).max(200),
      minimumWorkMinutes: z.coerce.number().int().min(0).max(1440).optional(),
    }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Enter a name, employee ID and password of at least 12 characters." });
      return;
    }
    const [created] = await db.insert(attendanceUsers).values({
      employeeId: parsed.data.employeeId.toLowerCase(),
      email: parsed.data.email ? parsed.data.email.toLowerCase() : null,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
      role: "TEAM_MEMBER",
        minimumWorkMinutes: parsed.data.minimumWorkMinutes ?? 60,
    }).returning();
    await writeAudit({ actorUserId: req.authUser.id, targetUserId: created.id, action: "EMPLOYEE_CREATED", afterState: { id: created.id, employeeId: created.employeeId, name: created.name }, ipAddress: req.ip });
     res.status(201).json({ employee: { id: created.id, employeeId: created.employeeId, email: created.email, name: created.name, role: created.role, active: created.active, minimumWorkMinutes: created.minimumWorkMinutes } });
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) {
      res.status(409).json({ message: "Employee ID or email is already in use." });
      return;
    }
    next(error);
  }
});

router.patch("/admin/employees/:id", requireRole("SUPER_ADMIN"), mutationRateLimit, async (req, res, next) => {
  try {
    const employeeId = routeParam(req.params.id);
    if (!req.authUser || !parseUuid(employeeId)) {
      res.status(400).json({ message: "Invalid employee." });
      return;
    }
    const parsed = z.object({ name: z.string().trim().min(2).max(120).optional(), email: z.string().trim().email().max(160).optional().or(z.literal("")), active: z.boolean().optional(), minimumWorkMinutes: z.coerce.number().int().min(0).max(1440).optional() }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid employee update." });
      return;
    }
    const [before] = await db.select().from(attendanceUsers).where(eq(attendanceUsers.id, employeeId)).limit(1);
    if (!before || before.role !== "TEAM_MEMBER") {
      res.status(404).json({ message: "Employee not found." });
      return;
    }
    const [updated] = await db.update(attendanceUsers).set({
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.email !== undefined ? { email: parsed.data.email ? parsed.data.email.toLowerCase() : null } : {}),
      ...(parsed.data.active !== undefined ? { active: parsed.data.active } : {}),
      ...(parsed.data.minimumWorkMinutes !== undefined ? { minimumWorkMinutes: parsed.data.minimumWorkMinutes } : {}),
      updatedAt: new Date(),
    }).where(eq(attendanceUsers.id, before.id)).returning();
    await writeAudit({ actorUserId: req.authUser.id, targetUserId: before.id, action: "EMPLOYEE_UPDATED", beforeState: { name: before.name, email: before.email, active: before.active }, afterState: { name: updated.name, email: updated.email, active: updated.active }, ipAddress: req.ip });
    res.json({ employee: { id: updated.id, employeeId: updated.employeeId, email: updated.email, name: updated.name, role: updated.role, active: updated.active, minimumWorkMinutes: updated.minimumWorkMinutes } });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/employees/:id/reset-password", requireRole("SUPER_ADMIN"), mutationRateLimit, async (req, res, next) => {
  try {
    const employeeId = routeParam(req.params.id);
    if (!req.authUser || !parseUuid(employeeId)) {
      res.status(400).json({ message: "Invalid employee." });
      return;
    }
    const password = z.string().min(12).max(200).safeParse(req.body?.password);
    if (!password.success) {
      res.status(400).json({ message: "Password must be at least 12 characters." });
      return;
    }
    const [updated] = await db.update(attendanceUsers).set({ passwordHash: await hashPassword(password.data), updatedAt: new Date() }).where(and(eq(attendanceUsers.id, employeeId), eq(attendanceUsers.role, "TEAM_MEMBER"))).returning({ id: attendanceUsers.id });
    if (!updated) {
      res.status(404).json({ message: "Employee not found." });
      return;
    }
    await writeAudit({ actorUserId: req.authUser.id, targetUserId: updated.id, action: "EMPLOYEE_PASSWORD_RESET", ipAddress: req.ip });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/attendance", requireRole("SUPER_ADMIN"), async (req, res, next) => {
  try {
    const page = parsePage(req.query.page, 1, 10000);
    const pageSize = Math.min(parsePage(req.query.pageSize, 30, 100), 100);
    const from = parseIsoDate(req.query.from) || "2000-01-01";
    const to = parseIsoDate(req.query.to) || "2999-12-31";
    const employeeId = typeof req.query.employeeId === "string" && parseUuid(req.query.employeeId) ? req.query.employeeId : undefined;
    const conditions = [gte(attendanceRecords.workDate, from), lte(attendanceRecords.workDate, to)];
    if (employeeId) conditions.push(eq(attendanceRecords.userId, employeeId));
    const rows = await db.select({
      record: attendanceRecords,
      employee: { name: attendanceUsers.name, employeeId: attendanceUsers.employeeId },
    }).from(attendanceRecords).innerJoin(attendanceUsers, eq(attendanceRecords.userId, attendanceUsers.id)).where(and(...conditions)).orderBy(desc(attendanceRecords.workDate), desc(attendanceRecords.checkInAt)).limit(pageSize).offset((page - 1) * pageSize);
    res.json({ records: rows.map((row) => ({ ...safeRecord(row.record), employeeName: row.employee.name, employeeId: row.employee.employeeId })), page, pageSize, from, to });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/attendance/:id", requireRole("SUPER_ADMIN"), async (req, res, next) => {
  try {
    const recordId = routeParam(req.params.id);
    if (!parseUuid(recordId)) {
      res.status(400).json({ message: "Invalid attendance record." });
      return;
    }
    const [row] = await db.select({
      record: attendanceRecords,
      employee: { name: attendanceUsers.name, employeeId: attendanceUsers.employeeId },
      evidence: {
        id: attendanceEvidence.id,
        contentType: attendanceEvidence.contentType,
        capturedAt: attendanceEvidence.capturedAt,
        latitude: attendanceEvidence.latitude,
        longitude: attendanceEvidence.longitude,
        accuracyM: attendanceEvidence.accuracyM,
        distanceM: attendanceEvidence.distanceM,
        facePhotoHash: attendanceEvidence.facePhotoHash,
        workplacePhotoHash: attendanceEvidence.workplacePhotoHash,
      },
      checkoutEvidence: {
        id: attendanceCheckoutEvidence.id,
        contentType: attendanceCheckoutEvidence.contentType,
        capturedAt: attendanceCheckoutEvidence.capturedAt,
        latitude: attendanceCheckoutEvidence.latitude,
        longitude: attendanceCheckoutEvidence.longitude,
        accuracyM: attendanceCheckoutEvidence.accuracyM,
        distanceM: attendanceCheckoutEvidence.distanceM,
        facePhotoHash: attendanceCheckoutEvidence.facePhotoHash,
        workplacePhotoHash: attendanceCheckoutEvidence.workplacePhotoHash,
      },
    }).from(attendanceRecords).innerJoin(attendanceUsers, eq(attendanceRecords.userId, attendanceUsers.id)).leftJoin(attendanceEvidence, eq(attendanceEvidence.attendanceId, attendanceRecords.id)).leftJoin(attendanceCheckoutEvidence, eq(attendanceCheckoutEvidence.attendanceId, attendanceRecords.id)).where(eq(attendanceRecords.id, recordId)).limit(1);
    if (!row) {
      res.status(404).json({ message: "Attendance record not found." });
      return;
    }
    const audit = await db.select().from(attendanceAuditLog).where(eq(attendanceAuditLog.attendanceId, recordId)).orderBy(desc(attendanceAuditLog.createdAt));
    res.json({ record: { ...safeRecord(row.record), employeeName: row.employee.name, employeeId: row.employee.employeeId }, evidence: row.evidence, checkoutEvidence: row.checkoutEvidence, audit });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/attendance/:id/evidence/:kind", requireRole("SUPER_ADMIN"), async (req, res, next) => {
  try {
    const recordId = routeParam(req.params.id);
    const kind = routeParam(req.params.kind);
    if (!parseUuid(recordId) || !["face", "workplace", "checkout-face", "checkout-workplace"].includes(kind)) {
      res.status(400).json({ message: "Invalid evidence request." });
      return;
    }
    const [evidence] = kind.startsWith("checkout-")
      ? await db.select().from(attendanceCheckoutEvidence).where(eq(attendanceCheckoutEvidence.attendanceId, recordId)).limit(1)
      : await db.select().from(attendanceEvidence).where(eq(attendanceEvidence.attendanceId, recordId)).limit(1);
    if (!evidence) {
      res.status(404).json({ message: "Evidence not found." });
      return;
    }
    const buffer = kind === "face" ? evidence.facePhoto : kind === "workplace" ? evidence.workplacePhoto : kind === "checkout-face" ? evidence.facePhoto : evidence.workplacePhoto;
    res.setHeader("Cache-Control", "private, no-store");
    res.type(evidence.contentType);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

router.post("/admin/attendance/:id/correction", requireRole("SUPER_ADMIN"), mutationRateLimit, async (req, res, next) => {
  try {
    const recordId = routeParam(req.params.id);
    if (!req.authUser || !parseUuid(recordId)) {
      res.status(400).json({ message: "Invalid attendance record." });
      return;
    }
    const parsed = z.object({
      checkInAt: z.string().datetime().optional(),
      checkOutAt: z.string().datetime().nullable().optional(),
      status: z.enum(["PRESENT", "LATE", "FLAGGED", "REJECTED", "CORRECTED"]).optional(),
      reason: z.string().trim().min(5).max(500),
    }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "A correction reason and valid values are required." });
      return;
    }
    const updated = await db.transaction(async (tx) => {
      const [before] = await tx.select().from(attendanceRecords).where(eq(attendanceRecords.id, recordId)).limit(1);
      if (!before) throw new Error("ATTENDANCE_RECORD_NOT_FOUND");
      const [next] = await tx.update(attendanceRecords).set({
        ...(parsed.data.checkInAt ? { checkInAt: new Date(parsed.data.checkInAt) } : {}),
        ...(parsed.data.checkOutAt !== undefined ? { checkOutAt: parsed.data.checkOutAt ? new Date(parsed.data.checkOutAt) : null } : {}),
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        correctionReason: parsed.data.reason,
        updatedAt: new Date(),
      }).where(eq(attendanceRecords.id, before.id)).returning();
      await tx.insert(attendanceAuditLog).values({
        actorUserId: req.authUser!.id,
        targetUserId: before.userId,
        attendanceId: before.id,
        action: "ATTENDANCE_CORRECTED",
        reason: parsed.data.reason,
        beforeState: safeRecord(before),
        afterState: next ? safeRecord(next) : null,
        ipAddress: req.ip,
      });
      return next ?? null;
    });
    res.json({ record: updated ? safeRecord(updated) : null });
  } catch (error) {
    if (error instanceof Error && error.message === "ATTENDANCE_RECORD_NOT_FOUND") {
      res.status(404).json({ message: "Attendance record not found." });
      return;
    }
    next(error);
  }
});

router.get("/admin/reports/export.csv", requireRole("SUPER_ADMIN"), async (req, res, next) => {
  try {
    const from = parseIsoDate(req.query.from) || "2000-01-01";
    const to = parseIsoDate(req.query.to) || "2999-12-31";
    const rows = await db.select({
      employeeId: attendanceUsers.employeeId,
      employeeName: attendanceUsers.name,
      workDate: attendanceRecords.workDate,
      checkInAt: attendanceRecords.checkInAt,
      checkOutAt: attendanceRecords.checkOutAt,
      status: attendanceRecords.status,
      riskLevel: attendanceRecords.riskLevel,
    }).from(attendanceRecords).innerJoin(attendanceUsers, eq(attendanceRecords.userId, attendanceUsers.id)).where(and(gte(attendanceRecords.workDate, from), lte(attendanceRecords.workDate, to))).orderBy(desc(attendanceRecords.workDate), asc(attendanceUsers.employeeId));
    const escapeCsv = (value: unknown) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
    const csv = [
      ["Employee ID", "Employee name", "Work date", "Check in", "Check out", "Status", "Risk"].map(escapeCsv).join(","),
      ...rows.map((row) => [row.employeeId, row.employeeName, row.workDate, row.checkInAt?.toISOString(), row.checkOutAt?.toISOString(), row.status, row.riskLevel].map(escapeCsv).join(",")),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="attendance-${from}-${to}.csv"`);
    res.send(`\ufeff${csv}`);
  } catch (error) {
    next(error);
  }
});

router.get("/admin/settings", requireRole("SUPER_ADMIN"), async (_req, res, next) => {
  try {
    res.json({ settings: await getSettings() });
  } catch (error) {
    next(error);
  }
});

router.put("/admin/settings", requireRole("SUPER_ADMIN"), mutationRateLimit, async (req, res, next) => {
  try {
    if (!req.authUser) return;
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Check location evidence and retention values." });
      return;
    }
    const before = await getSettings();
    const [settings] = await db.update(attendanceSettings).set({ ...parsed.data, updatedAt: new Date(), updatedBy: req.authUser.id }).where(eq(attendanceSettings.id, 1)).returning();
    await writeAudit({ actorUserId: req.authUser.id, action: "ATTENDANCE_SETTINGS_UPDATED", reason: "Admin settings update", beforeState: before, afterState: settings, ipAddress: req.ip });
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/audit", requireRole("SUPER_ADMIN"), async (req, res, next) => {
  try {
    const page = parsePage(req.query.page, 1, 10000);
    const pageSize = Math.min(parsePage(req.query.pageSize, 50, 100), 100);
    const audit = await db.select().from(attendanceAuditLog).orderBy(desc(attendanceAuditLog.createdAt)).limit(pageSize).offset((page - 1) * pageSize);
    res.json({ audit, page, pageSize });
  } catch (error) {
    next(error);
  }
});

export default router;