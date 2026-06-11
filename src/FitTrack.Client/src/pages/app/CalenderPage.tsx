import { useState, useEffect, useCallback } from "react";
import { getCalendar } from "../../api/logs";
import { getPlans } from "../../api/workoutPlans";
import type { CalendarDayDto, WorkoutPlan } from "../../types";
import DayDetailDrawer from "../../components/DayDetailDrawer";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCalendar, SkeletonCard } from "../../components/ui/Skeleton";
import ToastContainer from "../../components/ui/ToastContainer";
import { useToast } from "../../hooks/useToast";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY_LABEL: Record<string, string> = {
  Chest: "C+S",
  Back: "B+S",
  Abs: "Abs",
  Rest: "Rest",
};

const BG_INCOMPLETE: Record<string, { background: string; border: string }> = {
  Chest: { background: "#1a1730", border: "1px solid #4c3a9e" },
  Back: { background: "#0a1f1a", border: "1px solid #134e35" },
  Abs: { background: "#1c1206", border: "1px solid #7c2d12" },
  Rest: { background: "#0f1117", border: "1px solid #1e2130" },
};

const BG_COMPLETE: Record<string, { background: string; border: string }> = {
  Chest: { background: "#3b1fa8", border: "1px solid #6d28d9" },
  Back: { background: "#065f46", border: "1px solid #059669" },
  Abs: { background: "#92400e", border: "1px solid #d97706" },
  Rest: { background: "#1a2332", border: "1px solid #2a3444" },
};

const TEXT_INCOMPLETE: Record<string, string> = {
  Chest: "#c4b5fd",
  Back: "#6ee7b7",
  Abs: "#fcd34d",
  Rest: "#4b5563",
};

const TEXT_COMPLETE: Record<string, string> = {
  Chest: "#ede9fe",
  Back: "#d1fae5",
  Abs: "#fef3c7",
  Rest: "#6b7280",
};

export default function CalendarPage() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [days, setDays] = useState<CalendarDayDto[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingDays, setLoadingDays] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { toasts, showToast } = useToast();

  const loadPlan = useCallback(() => {
    setLoadingPlan(true);
    getPlans()
      .then((plans) => setPlan(plans.length > 0 ? plans[0] : null))
      .finally(() => setLoadingPlan(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPlan();
  }, [loadPlan]);

  useEffect(() => {
    if (!plan) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingDays(true);
    getCalendar(plan.id, year, month)
      .then(setDays)
      .finally(() => setLoadingDays(false));
  }, [plan, year, month]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  // Build a lookup map from date string to day data
  const dayMap = new Map<string, CalendarDayDto>();
  days.forEach((d) => dayMap.set(d.date.slice(0, 10), d));

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const totalDone = days.filter((d) => d.isCompleted).length;
  const totalWorkout = days.filter((d) => d.dayType !== "Rest").length;
  const pct =
    totalWorkout > 0 ? Math.round((totalDone / totalWorkout) * 100) : 0;

  const handleDayClick = (dateStr: string, dayType: string) => {
    if (dayType === "Rest") return;
    const [y, m, d] = dateStr.split("-").map(Number);
    const parsed = new Date(y, m - 1, d);
    if (parsed > today) return;
    setSelectedDate(dateStr);
  };

  const handleDrawerClose = (markedDone?: boolean) => {
    setSelectedDate(null);
    if (markedDone) showToast("Day marked as complete! 💪");
    if (plan) getCalendar(plan.id, year, month).then(setDays);
  };

  if (loadingPlan)
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCalendar />
      </div>
    );

  if (!plan) return <EmptyState />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <ToastContainer toasts={toasts} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Done this month", value: totalDone },
          { label: "Workouts", value: totalWorkout },
          { label: "Consistency", value: `${pct}%` },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-4 py-3"
            style={{ background: "#0d1421", border: "1px solid #1a2332" }}
          >
            <div className="text-xl font-medium text-white">{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar card */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "#0d1421", border: "1px solid #1a2332" }}
      >
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg transition-colors text-xl font-light"
            style={{ color: "#6b7280" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
          >
            ‹
          </button>
          <span className="font-medium" style={{ color: "#e5e7eb" }}>
            {MONTHS[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg transition-colors text-xl font-light"
            style={{ color: "#6b7280" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
          >
            ›
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-xs py-1 font-medium"
              style={{ color: "#4b5563" }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        {loadingDays ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg animate-pulse"
                style={{ background: "#1a2332" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Leading empty cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* All days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const dayData = dayMap.get(dateStr);
              const cellDate = new Date(year, month - 1, dayNum);
              const isToday = dateStr === todayStr;
              const isFuture = cellDate > today;

              // Day not in plan range
              if (!dayData) {
                return (
                  <div
                    key={dateStr}
                    className="aspect-square rounded-lg flex items-center justify-center"
                    style={{
                      background: "#0a0d14",
                      border: "1px solid #12151f",
                      opacity: 0.3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#374151",
                        fontWeight: 500,
                      }}
                    >
                      {dayNum}
                    </span>
                  </div>
                );
              }

              const bgStyle = dayData.isCompleted
                ? (BG_COMPLETE[dayData.dayType] ?? BG_COMPLETE.Rest)
                : (BG_INCOMPLETE[dayData.dayType] ?? BG_INCOMPLETE.Rest);

              const textColor = dayData.isCompleted
                ? (TEXT_COMPLETE[dayData.dayType] ?? "#6b7280")
                : (TEXT_INCOMPLETE[dayData.dayType] ?? "#4b5563");

              const isClickable = dayData.dayType !== "Rest" && !isFuture;

              return (
                <div
                  key={dateStr}
                  onClick={() =>
                    isClickable && handleDayClick(dateStr, dayData.dayType)
                  }
                  style={{
                    ...bgStyle,
                    color: textColor,
                    opacity: isFuture ? 0.3 : 1,
                    boxShadow: isToday ? "0 0 0 2px #7c3aed" : "none",
                    cursor: isClickable ? "pointer" : "default",
                  }}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center
                    select-none transition-all
                    ${isClickable ? "hover:scale-105 hover:brightness-125" : ""}`}
                >
                  <span
                    style={{ fontSize: "12px", fontWeight: 600, lineHeight: 1 }}
                  >
                    {dayNum}
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      opacity: 0.85,
                      lineHeight: 1,
                      marginTop: "2px",
                    }}
                  >
                    {DAY_LABEL[dayData.dayType] ?? dayData.dayType}
                  </span>
                  {dayData.isCompleted && (
                    <span
                      style={{
                        fontSize: "10px",
                        lineHeight: 1,
                        marginTop: "1px",
                      }}
                    >
                      ✓
                    </span>
                  )}
                  {!dayData.isCompleted && dayData.completedExercises > 0 && (
                    <span
                      style={{
                        fontSize: "8px",
                        opacity: 0.7,
                        lineHeight: 1,
                        marginTop: "1px",
                      }}
                    >
                      {dayData.completedExercises}/{dayData.totalExercises}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-4 mt-4 flex-wrap">
          {[
            {
              bg: BG_INCOMPLETE.Chest.background,
              border: BG_INCOMPLETE.Chest.border,
              label: "C+S",
            },
            {
              bg: BG_INCOMPLETE.Back.background,
              border: BG_INCOMPLETE.Back.border,
              label: "B+S",
            },
            {
              bg: BG_INCOMPLETE.Abs.background,
              border: BG_INCOMPLETE.Abs.border,
              label: "Abs",
            },
            {
              bg: BG_COMPLETE.Chest.background,
              border: BG_COMPLETE.Chest.border,
              label: "Done",
            },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded"
                style={{ background: l.bg, border: l.border }}
              />
              <span className="text-xs" style={{ color: "#6b7280" }}>
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selectedDate && plan && (
        <DayDetailDrawer
          planId={plan.id}
          date={selectedDate}
          onClose={handleDrawerClose}
        />
      )}
    </div>
  );
}
