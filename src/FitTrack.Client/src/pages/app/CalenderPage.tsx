import { useState, useEffect, useCallback } from "react";
import { getCalendar } from "../../api/logs";
import { getPlans } from "../../api/workoutPlans";
import type { CalendarDayDto, WorkoutPlan } from "../../types";
import DayDetailDrawer from "../../components/DayDetailDrawer";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCalendar, SkeletonCard } from "../../components/ui/Skeleton";
import ToastContainer from "../../components/ui/ToastContainer";
import { useToast } from "../../hooks/useToast";

const DAY_LABELS: Record<string, string> = {
  Chest: "C+S",
  Back: "B+S",
  Abs: "Abs",
  Rest: "Rest",
};
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

export default function CalendarPage() {
  const today = new Date();
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const totalDone = days.filter((d) => d.isCompleted).length;
  const totalWorkout = days.filter((d) => d.dayType !== "Rest").length;
  const pct =
    totalWorkout > 0 ? Math.round((totalDone / totalWorkout) * 100) : 0;

  const handleDayClick = (date: string, dayType: string) => {
    if (dayType === "Rest") return;
    if (new Date(date) > today) return;
    setSelectedDate(date);
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

  if (!plan) return <EmptyState onSeeded={loadPlan} />;

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
            style={{ background: "#13161f", border: "1px solid #1e2130" }}
          >
            <div className="text-xl font-medium text-white">{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "#13161f", border: "1px solid #1e2130" }}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-lg"
          >
            ‹
          </button>
          <span className="font-medium text-gray-900">
            {MONTHS[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-lg"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {loadingDays ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {days.map((day) => {
              const date = new Date(day.date);
              const isToday =
                day.date.slice(0, 10) === today.toISOString().slice(0, 10);
              const isFuture = date > today;
              const isClickable = day.dayType !== "Rest" && !isFuture;
              const bgStyle = day.isCompleted
                ? ({
                    Chest: {
                      background: "#2d1f6e",
                      border: "1px solid #4c3a9e",
                    },
                    Back: {
                      background: "#064e3b",
                      border: "1px solid #065f46",
                    },
                    Abs: { background: "#451a03", border: "1px solid #7c2d12" },
                    Rest: {
                      background: "#1a1d2a",
                      border: "1px solid #2a2d3a",
                    },
                  }[day.dayType] ?? {
                    background: "#1a1d2a",
                    border: "1px solid #2a2d3a",
                  })
                : ({
                    Chest: {
                      background: "#1a1730",
                      border: "1px solid #312d6e",
                    },
                    Back: {
                      background: "#0a1f1a",
                      border: "1px solid #134e35",
                    },
                    Abs: { background: "#1c1206", border: "1px solid #5c3a0a" },
                    Rest: {
                      background: "#12141c",
                      border: "1px solid #1a1d28",
                    },
                  }[day.dayType] ?? {
                    background: "#12141c",
                    border: "1px solid #1a1d28",
                  });

              const textColor = day.isCompleted
                ? ({
                    Chest: "#c4b5fd",
                    Back: "#6ee7b7",
                    Abs: "#fcd34d",
                    Rest: "#4b5563",
                  }[day.dayType] ?? "#4b5563")
                : ({
                    Chest: "#a78bfa",
                    Back: "#34d399",
                    Abs: "#fbbf24",
                    Rest: "#374151",
                  }[day.dayType] ?? "#374151");

              return (
                <div
                  key={day.date}
                  onClick={() => handleDayClick(day.date, day.dayType)}
                  style={{
                    ...bgStyle,
                    color: textColor,
                    opacity: isFuture ? 0.35 : 1,
                    boxShadow: isToday ? "0 0 0 2px #7c3aed" : "none",
                  }}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center
    text-xs font-medium select-none transition-transform
    ${isClickable ? "cursor-pointer hover:scale-105" : "cursor-default"}`}
                >
                  <span className="text-[11px] font-semibold leading-none">
                    {date.getDate()}
                  </span>
                  <span className="text-[9px] opacity-75 leading-none mt-0.5">
                    {DAY_LABELS[day.dayType]}
                  </span>
                  {day.isCompleted && (
                    <span className="text-[9px] leading-none mt-0.5">✓</span>
                  )}
                  {!day.isCompleted && day.completedExercises > 0 && (
                    <span className="text-[8px] opacity-60 leading-none mt-0.5">
                      {day.completedExercises}/{day.totalExercises}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {[
            { color: "#312d6e", label: "C+S" },
            { color: "#134e35", label: "B+S" },
            { color: "#5c3a0a", label: "Abs" },
            { color: "#1a1d28", label: "Rest" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded"
                style={{ background: l.color }}
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
