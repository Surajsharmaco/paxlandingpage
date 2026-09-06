import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Image, Save, Target, X } from "lucide-react";
import { LocationMapLink, type LocationPoint } from "./location-map-link";

type Employee = {
  id: string;
  employeeId: string;
  email?: string | null;
  name: string;
  active: boolean;
  minimumWorkMinutes?: number;
};

type CalendarDay = {
  date: string;
  state: "MET" | "BELOW_TARGET" | "MISSED" | "IN_PROGRESS" | "TODAY" | "FUTURE" | "RECORDED";
  checkInAt: string | null;
  checkOutAt: string | null;
  workedMinutes: number;
  status: string | null;
  riskLevel: string | null;
  recordId: string | null;
  hasCheckInEvidence: boolean;
  hasCheckoutEvidence: boolean;
  checkInLocation: LocationPoint | null;
  checkoutLocation: LocationPoint | null;
};

type CalendarData = {
  month: string;
  employee: Employee;
  targetMinutes: number;
  targetHours: number;
  summary: {
    daysMet: number;
    daysBelowTarget: number;
    daysMissed: number;
    eligibleDays: number;
    totalWorkedMinutes: number;
    completionPercentage: number;
  };
  days: CalendarDay[];
};

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const text = await response.text();
  let payload: unknown = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (!response.ok) {
    throw new Error(typeof payload === "object" && payload && "message" in payload ? String(payload.message) : `Request failed (${response.status})`);
  }
  return payload as T;
}

function currentMonth() {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date());
}

function formatTime(value: string | null) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function formatDay(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" });
}

function stateLabel(state: CalendarDay["state"]) {
  return {
    MET: "Target met",
    BELOW_TARGET: "Below target",
    MISSED: "Missed",
    IN_PROGRESS: "In progress",
    TODAY: "Today",
    FUTURE: "Upcoming",
    RECORDED: "Recorded",
  }[state];
}

function shiftMonth(month: string, offset: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const next = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function EmployeeAttendanceCalendar({ employee, onClose, onEmployeeUpdated }: { employee: Employee; onClose: () => void; onEmployeeUpdated: (employee: Employee) => void }) {
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState<CalendarData | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [targetHours, setTargetHours] = useState(((employee.minimumWorkMinutes ?? 60) / 60).toString());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setTargetHours(((employee.minimumWorkMinutes ?? 60) / 60).toString());
  }, [employee]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api<CalendarData>(`/api/admin/employees/${employee.id}/attendance?month=${month}`)
      .then((next) => {
        if (cancelled) return;
        setData(next);
        setSelectedDate(next.days.find((day) => day.state === "IN_PROGRESS" || day.state === "TODAY")?.date || next.days[0]?.date || "");
      })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load employee attendance."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [employee.id, employee.minimumWorkMinutes, month]);

  const calendarCells = useMemo(() => {
    if (!data) return [];
    const firstDay = new Date(`${data.month}-01T00:00:00`).getDay();
    return [...Array((firstDay + 6) % 7).fill(null), ...data.days];
  }, [data]);
  const selectedDay = data?.days.find((day) => day.date === selectedDate) || null;

  async function saveTarget(event: FormEvent) {
    event.preventDefault();
    const hours = Number(targetHours);
    if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
      setError("Enter a minimum between 0 and 24 hours.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await api<{ employee: Employee }>(`/api/admin/employees/${employee.id}`, {
        method: "PATCH",
        body: JSON.stringify({ minimumWorkMinutes: Math.round(hours * 60) }),
      });
      onEmployeeUpdated(updated.employee);
      setMessage("Minimum hours saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save minimum hours.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="portal-card employee-calendar">
    <div className="portal-card__head">
      <div>
        <div className="portal-kicker">Employee attendance</div>
        <h2>{employee.name}</h2>
        <p className="portal-muted">{employee.employeeId} · {employee.active ? "Active member" : "Deactivated member"}</p>
      </div>
      <button className="portal-drawer__close employee-calendar__close" onClick={onClose} aria-label="Close employee calendar"><X className="h-5 w-5" /></button>
    </div>
    <div className="employee-calendar__controls">
      <div className="employee-calendar__month">
        <button className="portal-icon-button" onClick={() => setMonth((value) => shiftMonth(value, -1))} aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
        <label><span>Attendance month</span><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label>
        <button className="portal-icon-button" onClick={() => setMonth((value) => shiftMonth(value, 1))} aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <form className="employee-calendar__target" onSubmit={saveTarget}>
        <Target className="h-4 w-4" />
        <label><span>Minimum hours / day</span><input type="number" min="0" max="24" step="0.25" value={targetHours} onChange={(event) => setTargetHours(event.target.value)} /></label>
        <button className="portal-button portal-button--secondary" disabled={saving}>{saving ? "Saving…" : <><Save className="h-4 w-4" /> Save target</>}</button>
      </form>
    </div>
    {error && <div className="portal-alert" role="alert">{error}</div>}
    {message && <div className="portal-success"><Check className="h-4 w-4" />{message}</div>}
    {loading && <div className="portal-empty employee-calendar__loading"><Clock3 className="h-7 w-7" /><p>Loading monthly attendance…</p></div>}
    {!loading && data && <>
      <div className="employee-calendar__summary">
        <article><span>Completion</span><strong>{data.summary.completionPercentage}%</strong><small>{data.summary.daysMet} of {data.summary.eligibleDays} eligible days met</small></article>
        <article><span>Worked hours</span><strong>{formatMinutes(data.summary.totalWorkedMinutes)}</strong><small>Target to date: {data.targetHours}h</small></article>
        <article><span>Below target</span><strong>{data.summary.daysBelowTarget}</strong><small>{data.summary.daysMissed} missed days</small></article>
      </div>
      <div className="employee-calendar__legend"><span><i className="is-met" /> Target met</span><span><i className="is-below" /> Below / missed</span><span><i className="is-progress" /> In progress</span><span><i className="is-future" /> Upcoming</span></div>
      <div className="employee-calendar__weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="employee-calendar__grid">
        {calendarCells.map((day, index) => day ? <button type="button" key={day.date} className={`employee-calendar__day is-${day.state.toLowerCase().replaceAll("_", "-")} ${selectedDate === day.date ? "is-selected" : ""}`} onClick={() => setSelectedDate(day.date)}>
          <span className="employee-calendar__day-number">{Number(day.date.slice(-2))}</span>
          <b>{day.checkInAt ? formatTime(day.checkInAt) : day.state === "MISSED" ? "—" : stateLabel(day.state)}</b>
          <small>{day.checkOutAt ? `${formatTime(day.checkOutAt)} · ${formatMinutes(day.workedMinutes)}` : day.checkInAt ? `${formatMinutes(day.workedMinutes)} so far` : "No record"}</small>
          <em>{day.hasCheckInEvidence || day.hasCheckoutEvidence ? "Evidence stored" : "No evidence"}</em>
        </button> : <span className="employee-calendar__day employee-calendar__day--empty" key={`empty-${index}`} />)}
      </div>
      {selectedDay && <article className="employee-calendar__detail">
        <div><div className="portal-kicker">{formatDay(selectedDay.date)}</div><h3>{stateLabel(selectedDay.state)}</h3></div>
        <div className="employee-calendar__detail-times"><span><b>Check-in</b>{formatTime(selectedDay.checkInAt)}</span><span><b>Check-out</b>{formatTime(selectedDay.checkOutAt)}</span><span><b>Worked</b>{formatMinutes(selectedDay.workedMinutes)}</span></div>
        <div className="employee-calendar__evidence"><span><Image className="h-4 w-4" /> Check-in evidence {selectedDay.hasCheckInEvidence ? "available" : "not available"}</span><span><Image className="h-4 w-4" /> Check-out evidence {selectedDay.hasCheckoutEvidence ? "available" : "not available"}</span></div>
        {selectedDay.checkInLocation && <LocationMapLink label="Check-in location" location={selectedDay.checkInLocation} />}
        {selectedDay.checkoutLocation && <LocationMapLink label="Check-out location" location={selectedDay.checkoutLocation} />}
        {selectedDay.recordId && <div className="employee-calendar__evidence-links">
          {selectedDay.hasCheckInEvidence && <><a href={`/api/admin/attendance/${selectedDay.recordId}/evidence/face`} target="_blank" rel="noreferrer">View check-in selfie</a><a href={`/api/admin/attendance/${selectedDay.recordId}/evidence/workplace`} target="_blank" rel="noreferrer">View check-in surroundings</a></>}
          {selectedDay.hasCheckoutEvidence && <><a href={`/api/admin/attendance/${selectedDay.recordId}/evidence/checkout-face`} target="_blank" rel="noreferrer">View check-out selfie</a><a href={`/api/admin/attendance/${selectedDay.recordId}/evidence/checkout-workplace`} target="_blank" rel="noreferrer">View check-out surroundings</a></>}
        </div>}
      </article>}
    </>}
  </section>;
}