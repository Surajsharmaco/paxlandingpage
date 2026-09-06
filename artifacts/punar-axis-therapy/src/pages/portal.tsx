import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Check,
  Clock3,
  Download,
  FileText,
  LayoutDashboard,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { EmployeeAttendanceCalendar } from "../components/employee-attendance-calendar";
import { LocationMapLink } from "../components/location-map-link";

type User = {
  id: string;
  employeeId: string;
  email?: string | null;
  name: string;
  role: "SUPER_ADMIN" | "TEAM_MEMBER";
  active: boolean;
  minimumWorkMinutes?: number;
};

type RecordItem = {
  id: string;
  userId: string;
  employeeId?: string;
  employeeName?: string;
  workDate: string;
  checkInAt: string;
  checkOutAt?: string | null;
  status: string;
  riskLevel: string;
  riskSignals: string[];
  correctionReason?: string | null;
};

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  if (!response.ok) {
    throw new Error(typeof payload === "object" && payload && "message" in payload ? String(payload.message) : `Request failed (${response.status})`);
  }
  return payload as T;
}

function formatTime(value?: string | null) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
}

function formatDate(value?: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) : "—";
}

function StatusPill({ value }: { value: string }) {
  const tone = value === "LOW" || value === "PRESENT" ? "good" : value === "MEDIUM" || value === "FLAGGED" ? "warn" : "neutral";
  return <span className={`portal-pill portal-pill--${tone}`}>{value.replaceAll("_", " ")}</span>;
}

function PortalLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="portal-logo" aria-label="Return to Punar Axis Therapy">
      <Leaf className="h-5 w-5" />
      {!compact && <span>Punar Axis <b>Therapy</b></span>}
    </Link>
  );
}

function PortalError({ message, onClose }: { message: string; onClose?: () => void }) {
  return <div className="portal-alert" role="alert"><AlertTriangle className="h-4 w-4 shrink-0" /><span>{message}</span>{onClose && <button onClick={onClose} aria-label="Dismiss"><X className="h-4 w-4" /></button>}</div>;
}

function LoginCard({ portal, onLogin }: { portal: "admin" | "team"; onLogin?: (user: User) => void }) {
  const [, navigate] = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = portal === "admin";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api<{ user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify({ identifier, password, portal }) });
      onLogin?.(result.user);
      navigate(isAdmin ? "/admin/dashboard" : "/team");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to log in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="portal-login">
      <div className="portal-login__glow" />
      <div className="portal-login__card">
        <PortalLogo />
        <div className="portal-kicker">{isAdmin ? "Secure administration" : "Team workspace"}</div>
        <h1>{isAdmin ? "Welcome back." : "Good to see you."}</h1>
        <p>{isAdmin ? "Manage attendance and your care team from one calm workspace." : "Check in from wherever your work takes you with location and camera evidence."}</p>
        {error && <PortalError message={error} />}
        <form onSubmit={submit} className="portal-form">
          <label>{isAdmin ? "Admin email or ID" : "Employee ID or email"}<input autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          <button className="portal-button portal-button--primary" disabled={busy}>{busy ? "Checking…" : "Log in"}<ArrowLeft className="h-4 w-4 rotate-180" /></button>
        </form>
        <div className="portal-login-switch">
          {isAdmin ? <>Team member? <Link href="/team/login">Use team login</Link></> : <>Admin? <Link href="/admin/login">Use admin login</Link></>}
        </div>
        <Link href="/" className="portal-back"><ArrowLeft className="h-4 w-4" /> Back to public website</Link>
      </div>
    </main>
  );
}

function useCurrentUser(portal: "admin" | "team") {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<{ user: User | null }>("/api/auth/me").then((data) => {
      if (data.user?.role === (portal === "admin" ? "SUPER_ADMIN" : "TEAM_MEMBER")) setUser(data.user);
      else if (data.user) void api("/api/auth/logout", { method: "POST" });
    }).catch(() => undefined).finally(() => setLoading(false));
  }, [portal]);
  const logout = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
    navigate(portal === "admin" ? "/admin/login" : "/team/login");
  }, [navigate, portal]);
  return { user, setUser, loading, logout };
}

function AdminShell({ user, onLogout, children }: { user: User; onLogout: () => void; children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    ["/admin/dashboard", "Overview", LayoutDashboard],
    ["/admin/team", "Team", Users],
    ["/admin/attendance", "Attendance", Clock3],
    ["/admin/reports", "Reports", FileText],
    ["/admin/settings", "Settings", Settings],
  ] as const;
  return (
    <div className="portal-app">
      <aside className={`portal-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <PortalLogo />
        <div className="portal-sidebar__label">Workspace</div>
        <nav>{links.map(([href, label, Icon]) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={location === href ? "is-active" : ""}><Icon className="h-4 w-4" />{label}</Link>)}</nav>
        <div className="portal-sidebar__footer"><div className="portal-avatar">{user.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><b>{user.name}</b><span>Super Admin</span></div><button onClick={onLogout} aria-label="Log out"><LogOut className="h-4 w-4" /></button></div>
      </aside>
      {mobileOpen && <button className="portal-overlay" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <div className="portal-main">
        <header className="portal-topbar"><button className="portal-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button><div><div className="portal-kicker">Punar Axis Therapy</div><span className="portal-topbar__title">Attendance workspace</span></div><ShieldCheck className="h-5 w-5 text-[#b87912]" /></header>
        <main className="portal-content">{children}</main>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: ReactNode }) {
  return <div className="portal-heading"><div><div className="portal-kicker">{eyebrow}</div><h1>{title}</h1><p>{copy}</p></div>{action}</div>;
}

function StatCard({ label, value, note, tone = "green" }: { label: string; value: string | number; note: string; tone?: string }) {
  return <article className={`portal-stat portal-stat--${tone}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function AdminDashboard() {
  const [summary, setSummary] = useState<{ date: string; activeEmployees: number; presentToday: number; attendancePercent: number; flaggedToday: number } | null>(null);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshInFlight = useRef(false);
  const load = useCallback(async (silent = false) => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    if (!silent) setIsRefreshing(true);
    try {
      const [nextSummary, nextRecords] = await Promise.all([api<typeof summary>("/api/admin/summary"), api<{ records: RecordItem[] }>("/api/admin/attendance?pageSize=8")]);
      setSummary(nextSummary);
      setRecords(nextRecords.records);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load dashboard.");
    } finally {
      refreshInFlight.current = false;
      if (!silent) setIsRefreshing(false);
    }
  }, []);
  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(true), 15000);
    return () => window.clearInterval(interval);
  }, [load]);
  return <><PageHeading eyebrow={`Today · ${summary?.date || "loading"}`} title="A clear view of your team." copy="Review attendance, follow up on risk signals and keep your clinic day moving. This view refreshes automatically." action={<button className="portal-button portal-button--secondary" onClick={() => void load()} disabled={isRefreshing}><RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />{isRefreshing ? "Refreshing…" : "Refresh"}</button>} /><div className="portal-stat-grid"><StatCard label="Attendance in" value={summary ? `${summary.attendancePercent}%` : "—"} note={summary ? `${summary.presentToday} of ${summary.activeEmployees} checked in` : "Today’s check-ins"} tone="gold" /><StatCard label="Active team" value={summary?.activeEmployees ?? "—"} note="Team members" /><StatCard label="Present today" value={summary?.presentToday ?? "—"} note="Checked in" /><StatCard label="Needs review" value={summary?.flaggedToday ?? "—"} note="Flagged records" tone="rose" /></div>{error && <PortalError message={error} />}<section className="portal-card"><div className="portal-card__head"><div><div className="portal-kicker">Recent records</div><h2>Latest attendance</h2></div><Link href="/admin/attendance" className="portal-link">View all <ArrowLeft className="h-4 w-4 rotate-180" /></Link></div><RecordTable records={records} empty="No attendance has been recorded yet." /></section></>;
}

function RecordTable({ records, empty, onSelect }: { records: RecordItem[]; empty: string; onSelect?: (record: RecordItem) => void }) {
  if (!records.length) return <div className="portal-empty"><Clock3 className="h-7 w-7" /><p>{empty}</p></div>;
  return <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Team member</th><th>Date</th><th>Check in</th><th>Check out</th><th>Status</th><th>Risk</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} onClick={() => onSelect?.(record)} className={onSelect ? "is-clickable" : ""}><td><b>{record.employeeName || "You"}</b><small>{record.employeeId || ""}</small></td><td>{formatDate(record.workDate)}</td><td>{formatTime(record.checkInAt)}</td><td>{formatTime(record.checkOutAt)}</td><td><StatusPill value={record.status} /></td><td><StatusPill value={record.riskLevel} /></td></tr>)}</tbody></table></div>;
}

function AdminTeam() {
  const [employees, setEmployees] = useState<Array<User & { lastLoginAt?: string | null; createdAt?: string; minimumWorkMinutes?: number }>>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<(typeof employees)[number] | null>(null);
  const [form, setForm] = useState({ employeeId: "", name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(() => api<{ employees: typeof employees }>("/api/admin/employees?pageSize=100").then((data) => setEmployees(data.employees)), []);
  useEffect(() => { void load().catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load team.")); }, [load]);
  async function create(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    try { await api("/api/admin/employees", { method: "POST", body: JSON.stringify(form) }); setForm({ employeeId: "", name: "", email: "", password: "" }); setMessage("Team member created."); await load(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to create team member."); }
  }
  async function toggle(employee: User) {
    try { await api(`/api/admin/employees/${employee.id}`, { method: "PATCH", body: JSON.stringify({ active: !employee.active }) }); await load(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to update team member."); }
  }
  return <><PageHeading eyebrow="People" title="Your care team." copy="Create and manage employee access. Select a team member to open their monthly attendance calendar." /><div className="portal-two-col"><section className="portal-card"><div className="portal-card__head"><div><div className="portal-kicker">New account</div><h2>Add a team member</h2></div><UserPlus className="h-5 w-5 text-[#b87912]" /></div>{error && <PortalError message={error} />} {message && <div className="portal-success"><Check className="h-4 w-4" />{message}</div>}<form onSubmit={create} className="portal-form portal-form--compact"><label>Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label><label>Employee ID<input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="e.g. PHY-014" required /></label><label>Email <span className="portal-optional">optional</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Temporary password<input type="password" minLength={12} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><small>At least 12 characters. Share it securely and ask the member to change it.</small></label><button className="portal-button portal-button--primary">Create account</button></form></section><section className="portal-card"><div className="portal-card__head"><div><div className="portal-kicker">Directory</div><h2>Team members</h2></div><Users className="h-5 w-5 text-[#b87912]" /></div><div className="portal-people">{employees.map((employee) => <div className={`portal-person portal-person--selectable ${selectedEmployee?.id === employee.id ? "is-selected" : ""}`} key={employee.id} role="button" tabIndex={0} onClick={() => setSelectedEmployee(employee)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedEmployee(employee); }}><div className="portal-avatar">{employee.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><b>{employee.name}</b><span>{employee.employeeId}{employee.email ? ` · ${employee.email}` : ""}</span><small>Target: {((employee.minimumWorkMinutes ?? 60) / 60).toFixed(2).replace(/\.00$/, "")}h/day</small></div><button className={`portal-toggle ${employee.active ? "is-on" : ""}`} onClick={(event) => { event.stopPropagation(); void toggle(employee); }}>{employee.active ? "Active" : "Off"}</button></div>)}{!employees.length && <div className="portal-empty"><Users className="h-7 w-7" /><p>No team members yet.</p></div>}</div></section></div>{selectedEmployee && <EmployeeAttendanceCalendar employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} onEmployeeUpdated={(updated) => { setSelectedEmployee((current) => current ? { ...current, ...updated } : current); void load(); }} />}</>;
}

function AdminAttendance() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);
  const refreshInFlight = useRef(false);
  const load = useCallback(async (nextPage = 1, silent = false) => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    if (!silent) setIsRefreshing(true);
    const query = new URLSearchParams({ page: String(nextPage), pageSize: "30" });
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    try {
      const data = await api<{ records: RecordItem[] }>(`/api/admin/attendance?${query.toString()}`);
      setRecords(data.records);
      setPage(nextPage);
      pageRef.current = nextPage;
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load attendance.");
    } finally {
      refreshInFlight.current = false;
      if (!silent) setIsRefreshing(false);
    }
  }, [from, to]);
  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(pageRef.current, true), 15000);
    return () => window.clearInterval(interval);
  }, [load]);
  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    const loadDetail = () => api(`/api/admin/attendance/${selected.id}`).then((data) => { if (!cancelled) setDetail(data); }).catch(() => { if (!cancelled) setDetail(null); });
    void loadDetail();
    const interval = window.setInterval(loadDetail, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [selected]);
  async function updateStatus(status: "PRESENT" | "FLAGGED" | "REJECTED" | "CORRECTED") {
    if (!selected) return;
    const reason = window.prompt(`Why should this record be marked ${status.toLowerCase()}?`);
    if (!reason) return;
    try { await api(`/api/admin/attendance/${selected.id}/correction`, { method: "POST", body: JSON.stringify({ status, reason }) }); await load(page); setSelected(null); } catch (issue) { setError(issue instanceof Error ? issue.message : "Unable to update record."); }
  }
  return <><PageHeading eyebrow="Review" title="Attendance records." copy="Inspect check-in evidence, review risk signals and keep corrections transparent. This list refreshes automatically." action={<div className="flex gap-2"><button className="portal-button portal-button--secondary" onClick={() => void load(page)} disabled={isRefreshing}><RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />{isRefreshing ? "Refreshing…" : "Refresh"}</button><button className="portal-button portal-button--secondary" onClick={() => window.open(`/api/admin/reports/export.csv?from=${from}&to=${to}`, "_blank")}><Download className="h-4 w-4" /> Export CSV</button></div>} />{error && <PortalError message={error} />}<section className="portal-card"><div className="portal-filterbar"><label>From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label>To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label><button className="portal-button portal-button--secondary" onClick={() => void load()}>Apply filters</button></div><RecordTable records={records} empty="No records found." onSelect={setSelected} /><div className="portal-pagination"><button disabled={page <= 1} onClick={() => void load(page - 1)}>Previous</button><span>Page {page}</span><button disabled={records.length < 30} onClick={() => void load(page + 1)}>Next</button></div></section>{selected && <div className="portal-drawer-backdrop" onClick={() => setSelected(null)}><aside className="portal-drawer" onClick={(e) => e.stopPropagation()}><button className="portal-drawer__close" onClick={() => setSelected(null)}><X className="h-5 w-5" /></button><div className="portal-kicker">Record detail</div><h2>{selected.employeeName}</h2><p className="portal-muted">{formatDate(selected.workDate)} · {formatTime(selected.checkInAt)}</p><div className="portal-detail-grid"><div><span>Status</span><StatusPill value={selected.status} /></div><div><span>Risk</span><StatusPill value={selected.riskLevel} /></div><div><span>Check out</span><b>{formatTime(selected.checkOutAt)}</b></div></div>{(detail?.evidence || detail?.checkoutEvidence) && <div className="portal-evidence-sections">{detail?.evidence && <section><div className="portal-kicker portal-detail-kicker">Check-in evidence</div><div className="portal-evidence-grid"><img src={`/api/admin/attendance/${selected.id}/evidence/face`} alt="Check-in face capture" /><img src={`/api/admin/attendance/${selected.id}/evidence/workplace`} alt="Check-in workplace capture" /></div><p className="portal-muted portal-small">Captured {formatTime(detail.evidence.capturedAt)} · GPS accuracy {Math.round(detail.evidence.accuracyM)}m · {Math.round(detail.evidence.distanceM)}m from the configured clinic point (informational only).</p></section>}{detail?.checkoutEvidence && <section><div className="portal-kicker portal-detail-kicker">Check-out evidence</div><div className="portal-evidence-grid"><img src={`/api/admin/attendance/${selected.id}/evidence/checkout-face`} alt="Check-out face capture" /><img src={`/api/admin/attendance/${selected.id}/evidence/checkout-workplace`} alt="Check-out workplace capture" /></div><p className="portal-muted portal-small">Captured {formatTime(detail.checkoutEvidence.capturedAt)} · GPS accuracy {Math.round(detail.checkoutEvidence.accuracyM)}m · {Math.round(detail.checkoutEvidence.distanceM)}m from the configured clinic point (informational only).</p></section>}</div>}{detail?.evidence && <LocationMapLink label="Check-in location" location={detail.evidence} />}{detail?.checkoutEvidence && <LocationMapLink label="Check-out location" location={detail.checkoutEvidence} />}<div className="portal-status-actions"><button className="portal-button portal-button--secondary" onClick={() => void updateStatus("PRESENT")}>Approve</button><button className="portal-button portal-button--secondary" onClick={() => void updateStatus("FLAGGED")}>Flag</button><button className="portal-button portal-button--secondary" onClick={() => void updateStatus("REJECTED")}>Reject</button></div><button className="portal-button portal-button--secondary portal-full" onClick={() => void updateStatus("CORRECTED")}>Add correction with audit reason</button><div className="portal-kicker portal-detail-kicker">Audit history</div><div className="portal-audit">{(detail?.audit || []).map((entry: any) => <div key={entry.id}><b>{entry.action.replaceAll("_", " ")}</b><span>{new Date(entry.createdAt).toLocaleString()}</span></div>)}</div></aside></div>}</>;
}

function AdminReports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  return <><PageHeading eyebrow="Reporting" title="Simple, useful reports." copy="Export attendance summaries without including private camera or location evidence." /><section className="portal-card portal-report-card"><div className="portal-kicker">Attendance export</div><h2>Choose a date range</h2><p className="portal-muted">CSV exports include employee, date, check-in/out, status and risk level only.</p><div className="portal-inline-form"><label>From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label>To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label><a className="portal-button portal-button--primary" href={`/api/admin/reports/export.csv?from=${from}&to=${to}`}><Download className="h-4 w-4" /> Download CSV</a></div></section><section className="portal-card"><div className="portal-card__head"><div><div className="portal-kicker">Privacy by design</div><h2>Evidence stays protected.</h2></div><ShieldCheck className="h-5 w-5 text-[#b87912]" /></div><p className="portal-muted">Camera photos and exact coordinates are available only from an authorized attendance record view. They are never included in exports.</p></section></>;
}

function AdminSettings() {
  const [settings, setSettings] = useState({ clinicLatitude: 0, clinicLongitude: 0, geofenceRadiusM: 150, maxGpsAccuracyM: 100, lateAfterMinutes: 15, retentionDays: 365, privacyNoticeVersion: "2026-01" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { void api<{ settings: typeof settings }>("/api/admin/settings").then((data) => setSettings(data.settings)).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load settings.")); }, []);
  async function save(event: FormEvent) {
    event.preventDefault(); setMessage(""); setError("");
    try { await api("/api/admin/settings", { method: "PUT", body: JSON.stringify({ ...settings, clinicLatitude: Number(settings.clinicLatitude), clinicLongitude: Number(settings.clinicLongitude), geofenceRadiusM: Number(settings.geofenceRadiusM), maxGpsAccuracyM: Number(settings.maxGpsAccuracyM), lateAfterMinutes: Number(settings.lateAfterMinutes), retentionDays: Number(settings.retentionDays) }) }); setMessage("Attendance settings saved."); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save settings."); }
  }
  return <><PageHeading eyebrow="Controls" title="Attendance settings." copy="Keep location evidence, accuracy rules and privacy retention aligned with the clinic’s operating policy." /><section className="portal-card portal-settings-card">{error && <PortalError message={error} />}{message && <div className="portal-success"><Check className="h-4 w-4" />{message}</div>}<form onSubmit={save} className="portal-form portal-form--grid"><label>Clinic latitude<input type="number" step="any" value={settings.clinicLatitude} onChange={(e) => setSettings({ ...settings, clinicLatitude: Number(e.target.value) })} required /></label><label>Clinic longitude<input type="number" step="any" value={settings.clinicLongitude} onChange={(e) => setSettings({ ...settings, clinicLongitude: Number(e.target.value) })} required /></label><label>Max GPS accuracy (metres)<input type="number" min="10" max="1000" value={settings.maxGpsAccuracyM} onChange={(e) => setSettings({ ...settings, maxGpsAccuracyM: Number(e.target.value) })} required /></label><label>Late after (minutes)<input type="number" min="0" value={settings.lateAfterMinutes} onChange={(e) => setSettings({ ...settings, lateAfterMinutes: Number(e.target.value) })} required /></label><label>Retention (days)<input type="number" min="30" value={settings.retentionDays} onChange={(e) => setSettings({ ...settings, retentionDays: Number(e.target.value) })} required /></label><label>Privacy notice version<input value={settings.privacyNoticeVersion} onChange={(e) => setSettings({ ...settings, privacyNoticeVersion: e.target.value })} required /></label><div className="portal-form__wide"><button className="portal-button portal-button--primary">Save settings</button></div></form><div className="portal-note"><MapPin className="h-4 w-4" /><span>Office geofencing is disabled. Team members can check in from field visits or any other work location. Location is requested once during check-in and stored with the attendance evidence; it is not continuous tracking.</span></div></section></>;
}

function AdminPortal() {
  const [location] = useLocation();
  const { user, setUser, loading, logout } = useCurrentUser("admin");
  if (location === "/admin/login") return <LoginCard portal="admin" onLogin={setUser} />;
  if (loading) return <div className="portal-loading">Loading workspace…</div>;
  if (!user) return <LoginCard portal="admin" onLogin={setUser} />;
  let content: React.ReactNode = <AdminDashboard />;
  if (location === "/admin/team") content = <AdminTeam />;
  if (location === "/admin/attendance") content = <AdminAttendance />;
  if (location === "/admin/reports") content = <AdminReports />;
  if (location === "/admin/settings") content = <AdminSettings />;
  return <AdminShell user={user} onLogout={() => void logout()}>{content}</AdminShell>;
}

function CameraCapture({ facingMode, label, onCapture }: { facingMode: "user" | "environment"; label: string; onCapture: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false }).then((stream) => {
      if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; void videoRef.current.play(); }
    }).catch(() => setError("Camera access is required. Allow camera permission and try again."));
    return () => { cancelled = true; streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; };
  }, [facingMode]);
  function capture() {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) { setError("Camera is still starting. Try again in a moment."); return; }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL("image/jpeg", 0.78));
  }
  return <div className="camera-capture">{error ? <PortalError message={error} /> : <video ref={videoRef} playsInline muted className="camera-capture__video" />}<div className="camera-capture__footer"><span><Camera className="h-4 w-4" />{label}</span><button onClick={capture} className="portal-button portal-button--primary"><Camera className="h-4 w-4" /> Capture live photo</button></div></div>;
}

function TeamShell({ user, onLogout, children }: { user: User; onLogout: () => void; children: ReactNode }) {
  return <div className="team-app"><header className="team-topbar"><PortalLogo /><div className="team-topbar__person"><div className="portal-avatar">{user.name.slice(0, 1).toUpperCase()}</div><span>{user.name}</span><button onClick={onLogout} aria-label="Log out"><LogOut className="h-4 w-4" /></button></div></header><main className="team-content">{children}</main><footer className="team-footer">Punar Axis Therapy · Location is requested once for attendance evidence.</footer></div>;
}

function TeamDashboard({ user }: { user: User }) {
  const [today, setToday] = useState<RecordItem | null>(null);
  const [history, setHistory] = useState<RecordItem[]>([]);
  const [settings, setSettings] = useState({ privacyNoticeVersion: "2026-01", maxGpsAccuracyM: 100, geofenceRadiusM: 150 });
  const [consent, setConsent] = useState(false);
  const [stage, setStage] = useState<"idle" | "face" | "workplace" | "confirm">("idle");
  const [captureMode, setCaptureMode] = useState<"check-in" | "check-out" | null>(null);
  const [session, setSession] = useState<{ nonce: string; privacyNoticeVersion: string } | null>(null);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [facePhoto, setFacePhoto] = useState("");
  const [workplacePhoto, setWorkplacePhoto] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshInFlight = useRef(false);
  const load = useCallback(async (silent = false) => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    if (!silent) setIsRefreshing(true);
    try {
      const [current, past, publicSettings] = await Promise.all([
        api<{ today: RecordItem | null }>("/api/attendance/me"),
        api<{ records: RecordItem[] }>("/api/attendance/me/history?pageSize=12"),
        api<typeof settings>("/api/attendance/settings/public"),
      ]);
      setToday(current.today); setHistory(past.records); setSettings(publicSettings); setError("");
    } finally {
      refreshInFlight.current = false;
      if (!silent) setIsRefreshing(false);
    }
  }, []);
  useEffect(() => {
    void load().catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load attendance."));
    const interval = window.setInterval(() => void load(true).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to refresh attendance.")), 15000);
    return () => window.clearInterval(interval);
  }, [load]);
  async function begin(mode: "check-in" | "check-out") {
    setError(""); setMessage("");
    if (!consent) { setError(`Please read and accept the privacy notice before checking ${mode === "check-in" ? "in" : "out"}.`); return; }
    try {
      const challenge = await api<{ nonce: string; privacyNoticeVersion: string }>(mode === "check-in" ? "/api/attendance/session" : "/api/attendance/checkout/session", { method: "POST", body: "{}" });
      await new Promise<void>((resolve, reject) => navigator.geolocation.getCurrentPosition((position) => { setLocation(position); resolve(); }, () => reject(new Error(`Location permission is required to check ${mode === "check-in" ? "in" : "out"}.`)), { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }));
      setCaptureMode(mode); setSession(challenge); setFacePhoto(""); setWorkplacePhoto(""); setStage("face");
    } catch (reason) { setError(reason instanceof Error ? reason.message : `Unable to start check-${mode === "check-in" ? "in" : "out"}.`); }
  }
  async function finalize() {
    if (!session || !location || !facePhoto || !workplacePhoto || !captureMode) return;
    setError(""); setMessage("");
    try {
      const result = await api<{ record: RecordItem }>(captureMode === "check-in" ? "/api/attendance/finalize" : "/api/attendance/checkout", { method: "POST", body: JSON.stringify({ nonce: session.nonce, idempotencyKey: crypto.randomUUID(), latitude: location.coords.latitude, longitude: location.coords.longitude, accuracyM: location.coords.accuracy, consent: true, consentVersion: session.privacyNoticeVersion, captureMethod: "camera", facePhoto, workplacePhoto, integritySignals: JSON.stringify({ userAgent: navigator.userAgent, platform: navigator.platform, visibility: document.visibilityState }) }) });
      setToday(result.record); setStage("idle"); setCaptureMode(null); setSession(null); setLocation(null); setMessage(captureMode === "check-in" ? "Check-in recorded securely." : "Check-out recorded securely."); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to record check-in."); }
  }
  return <><div className="team-welcome"><div><div className="portal-kicker">Team dashboard</div><h1>Hello, {user.name.split(" ")[0]}.</h1><p>One focused check-in, then get back to caring for patients.</p></div><div className="flex items-center gap-3"><button className="portal-button portal-button--secondary" onClick={() => void load()} disabled={isRefreshing}><RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />{isRefreshing ? "Refreshing…" : "Refresh"}</button><div className="team-date"><Clock3 className="h-4 w-4" />{new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "short" })}</div></div></div>{error && <PortalError message={error} onClose={() => setError("")} />}{message && <div className="portal-success"><Check className="h-4 w-4" />{message}</div>}<section className="team-checkin-card">{stage === "idle" && <><div className={`team-status-mark ${today ? "is-done" : ""}`}>{today ? <Check className="h-8 w-8" /> : <Clock3 className="h-8 w-8" />}</div><div><div className="portal-kicker">{today ? "You are checked in" : "Today’s attendance"}</div><h2>{today ? `Checked in at ${formatTime(today.checkInAt)}` : "Ready when you are?"}</h2><p>{today ? (today.checkOutAt ? `Checked out at ${formatTime(today.checkOutAt)}.` : "Remember to check out at the end of your workday. Check-out also requires a fresh location and two live photos.") : "We’ll ask for one location check and two live camera photos. You can check in from a field visit or any other work location."}</p></div><div className="team-checkin-actions">{(!today || !today.checkOutAt) && <label className="portal-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>I consent to the one-time use of my location and camera photos for this {today ? "check-out" : "check-in"}. <b>Notice {settings.privacyNoticeVersion}</b></span></label>}{!today && <button className="portal-button portal-button--primary portal-full" onClick={() => void begin("check-in")}><MapPin className="h-4 w-4" /> Start secure check-in</button>}{today && !today.checkOutAt && <button className="portal-button portal-button--secondary portal-full" onClick={() => void begin("check-out")}><MapPin className="h-4 w-4" /> Start secure check-out</button>}</div></>}{stage === "face" && <><div className="team-capture-heading"><div className="portal-kicker">Step 1 of 2 · {captureMode === "check-out" ? "Check-out" : "Check-in"}</div><h2>Take a {captureMode === "check-out" ? "check-out " : ""}selfie.</h2><p>Use the front camera and keep your face in frame. This is a live capture only.</p></div><CameraCapture facingMode="user" label={`Front camera · ${captureMode === "check-out" ? "check-out selfie" : "face photo"}`} onCapture={(photo) => { setFacePhoto(photo); setStage("workplace"); }} /><button className="portal-link" onClick={() => { setStage("idle"); setCaptureMode(null); }}>Cancel {captureMode === "check-out" ? "check-out" : "check-in"}</button></>}{stage === "workplace" && <><div className="team-capture-heading"><div className="portal-kicker">Step 2 of 2 · {captureMode === "check-out" ? "Check-out" : "Check-in"}</div><h2>Show the surroundings.</h2><p>Switch to the rear camera and capture the current work environment.</p></div><CameraCapture facingMode="environment" label={`Rear camera · ${captureMode === "check-out" ? "check-out surroundings" : "workplace photo"}`} onCapture={(photo) => { setWorkplacePhoto(photo); setStage("confirm"); }} /><button className="portal-link" onClick={() => { setStage("idle"); setCaptureMode(null); }}>Cancel {captureMode === "check-out" ? "check-out" : "check-in"}</button></>}{stage === "confirm" && <><div className="team-capture-heading"><div className="portal-kicker">Ready to submit · {captureMode === "check-out" ? "Check-out" : "Check-in"}</div><h2>Review your two captures.</h2><p>Both photos and your one-time location reading will be stored together in this attendance record.</p></div><div className="team-preview-grid"><img src={facePhoto} alt={`${captureMode === "check-out" ? "Check-out" : "Check-in"} selfie preview`} /><img src={workplacePhoto} alt={`${captureMode === "check-out" ? "Check-out" : "Check-in"} surroundings preview`} /></div><button className="portal-button portal-button--primary portal-full" onClick={() => void finalize()}><ShieldCheck className="h-4 w-4" /> Submit {captureMode === "check-out" ? "check-out" : "attendance"}</button><button className="portal-link" onClick={() => { setStage("face"); setFacePhoto(""); setWorkplacePhoto(""); }}>Retake both photos</button></>}</section><section className="portal-card team-history"><div className="portal-card__head"><div><div className="portal-kicker">Personal history</div><h2>Recent attendance</h2></div><span className="portal-muted">{user.employeeId}</span></div><RecordTable records={history} empty="Your attendance history will appear here." /></section></>;
}

function TeamPortal() {
  const [location] = useLocation();
  const { user, setUser, loading, logout } = useCurrentUser("team");
  if (location === "/team/login") return <LoginCard portal="team" onLogin={setUser} />;
  if (loading) return <div className="portal-loading">Loading workspace…</div>;
  if (!user) return <LoginCard portal="team" onLogin={setUser} />;
  return <TeamShell user={user} onLogout={() => void logout()}><TeamDashboard user={user} /></TeamShell>;
}

export { AdminPortal, TeamPortal };