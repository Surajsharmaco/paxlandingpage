import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  doublePrecision,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  customType,
} from "drizzle-orm/pg-core";

const binary = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const attendanceRoleEnum = pgEnum("attendance_role", [
  "SUPER_ADMIN",
  "TEAM_MEMBER",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "PRESENT",
  "LATE",
  "FLAGGED",
  "REJECTED",
  "CORRECTED",
]);

export const riskLevelEnum = pgEnum("attendance_risk_level", [
  "LOW",
  "MEDIUM",
  "HIGH",
]);

export const attendanceUsers = pgTable(
  "attendance_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeId: text("employee_id").notNull(),
    email: text("email"),
    name: text("name").notNull(),
    role: attendanceRoleEnum("role").notNull().default("TEAM_MEMBER"),
    passwordHash: text("password_hash").notNull(),
    active: boolean("active").notNull().default(true),
    minimumWorkMinutes: integer("minimum_work_minutes").notNull().default(60),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("attendance_users_employee_id_idx").on(table.employeeId),
    uniqueIndex("attendance_users_email_idx").on(table.email),
    index("attendance_users_role_active_idx").on(table.role, table.active),
  ],
);

export const attendanceSessions = pgTable(
  "attendance_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => attendanceUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (table) => [
    uniqueIndex("attendance_sessions_token_hash_idx").on(table.tokenHash),
    index("attendance_sessions_user_expires_idx").on(table.userId, table.expiresAt),
  ],
);

export const attendanceSettings = pgTable("attendance_settings", {
  id: integer("id").primaryKey().default(1),
  clinicLatitude: doublePrecision("clinic_latitude").notNull().default(0),
  clinicLongitude: doublePrecision("clinic_longitude").notNull().default(0),
  geofenceRadiusM: integer("geofence_radius_m").notNull().default(150),
  maxGpsAccuracyM: integer("max_gps_accuracy_m").notNull().default(100),
  lateAfterMinutes: integer("late_after_minutes").notNull().default(15),
  retentionDays: integer("retention_days").notNull().default(365),
  privacyNoticeVersion: text("privacy_notice_version").notNull().default("2026-01"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  updatedBy: uuid("updated_by").references(() => attendanceUsers.id, { onDelete: "set null" }),
});

export const attendanceChallenges = pgTable(
  "attendance_challenges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => attendanceUsers.id, { onDelete: "cascade" }),
    nonceHash: text("nonce_hash").notNull(),
    purpose: text("purpose").notNull().default("CHECK_IN"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("attendance_challenges_nonce_hash_idx").on(table.nonceHash),
    index("attendance_challenges_user_expires_idx").on(table.userId, table.expiresAt),
  ],
);

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => attendanceUsers.id, { onDelete: "restrict" }),
    workDate: date("work_date").notNull(),
    checkInAt: timestamp("check_in_at", { withTimezone: true }).notNull(),
    checkOutAt: timestamp("check_out_at", { withTimezone: true }),
    status: attendanceStatusEnum("status").notNull().default("PRESENT"),
    riskLevel: riskLevelEnum("risk_level").notNull().default("LOW"),
    riskSignals: jsonb("risk_signals").$type<string[]>().notNull().default([]),
    idempotencyKey: text("idempotency_key").notNull(),
    checkoutIdempotencyKey: text("checkout_idempotency_key"),
    correctionReason: text("correction_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("attendance_records_user_date_idx").on(table.userId, table.workDate),
    uniqueIndex("attendance_records_user_idempotency_idx").on(table.userId, table.idempotencyKey),
    uniqueIndex("attendance_records_user_checkout_idempotency_idx").on(table.userId, table.checkoutIdempotencyKey),
    index("attendance_records_date_status_idx").on(table.workDate, table.status),
    index("attendance_records_user_date_desc_idx").on(table.userId, table.workDate),
  ],
);

export const attendanceEvidence = pgTable(
  "attendance_evidence",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attendanceId: uuid("attendance_id").notNull().references(() => attendanceRecords.id, { onDelete: "cascade" }),
    facePhoto: binary("face_photo").notNull(),
    workplacePhoto: binary("workplace_photo").notNull(),
    contentType: text("content_type").notNull(),
    facePhotoHash: text("face_photo_hash").notNull(),
    workplacePhotoHash: text("workplace_photo_hash").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    accuracyM: doublePrecision("accuracy_m").notNull(),
    distanceM: doublePrecision("distance_m").notNull(),
    captureMethod: text("capture_method").notNull(),
    consentVersion: text("consent_version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("attendance_evidence_attendance_id_idx").on(table.attendanceId),
    index("attendance_evidence_captured_at_idx").on(table.capturedAt),
  ],
);

export const attendanceCheckoutEvidence = pgTable(
  "attendance_checkout_evidence",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attendanceId: uuid("attendance_id").notNull().references(() => attendanceRecords.id, { onDelete: "cascade" }),
    facePhoto: binary("face_photo").notNull(),
    workplacePhoto: binary("workplace_photo").notNull(),
    contentType: text("content_type").notNull(),
    facePhotoHash: text("face_photo_hash").notNull(),
    workplacePhotoHash: text("workplace_photo_hash").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    accuracyM: doublePrecision("accuracy_m").notNull(),
    distanceM: doublePrecision("distance_m").notNull(),
    captureMethod: text("capture_method").notNull(),
    consentVersion: text("consent_version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("attendance_checkout_evidence_attendance_id_idx").on(table.attendanceId),
    index("attendance_checkout_evidence_captured_at_idx").on(table.capturedAt),
  ],
);

export const attendanceAuditLog = pgTable(
  "attendance_audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => attendanceUsers.id, { onDelete: "set null" }),
    attendanceId: uuid("attendance_id").references(() => attendanceRecords.id, { onDelete: "set null" }),
    targetUserId: uuid("target_user_id").references(() => attendanceUsers.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    reason: text("reason"),
    beforeState: jsonb("before_state").$type<Record<string, unknown> | null>(),
    afterState: jsonb("after_state").$type<Record<string, unknown> | null>(),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("attendance_audit_created_at_idx").on(table.createdAt),
    index("attendance_audit_attendance_idx").on(table.attendanceId),
    index("attendance_audit_target_idx").on(table.targetUserId),
  ],
);

export type AttendanceUser = typeof attendanceUsers.$inferSelect;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type AttendanceSettings = typeof attendanceSettings.$inferSelect;