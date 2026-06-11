import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getPlans } from "../../api/workoutPlans";
import { getDashboardStats } from "../../api/stats";
import type { CalendarDayDto, DashboardStatsDto } from "../../types";
import { SkeletonCard, SkeletonBar } from "../../components/ui/Skeleton";

const TYPE_COLOR: Record<string, string> = {
  Chest: "#8b5cf6",
  Back: "#14b8a6",
  Abs: "#f59e0b",
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="app-surface app-surface-hover rounded-xl px-4 py-3">
      <div className="text-xl font-medium text-white">{value}</div>
      <div className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
        {label}
      </div>
      {sub && (
        <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function ConsistencyBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between gap-3 text-xs">
        <span className="truncate" style={{ color: "#cbd5e1" }}>
          {label}
        </span>
        <span className="font-medium tabular-nums" style={{ color: "#94a3b8" }}>
          {value}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-slate-800">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

const getHeatmapColor = (day: CalendarDayDto) => {
  if (day.dayType === "Rest") return "#1b2433";
  if (day.isCompleted) return TYPE_COLOR[day.dayType] ?? "#8b5cf6";
  if (day.completedExercises > 0) return "#4c3a9e";
  return "#273244";
};

const getHeatmapTitle = (day: CalendarDayDto) => {
  const date = new Date(day.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
  const progress =
    day.dayType === "Rest"
      ? "Rest day"
      : day.isCompleted
        ? "Completed"
        : day.completedExercises > 0
          ? `${day.completedExercises}/${day.totalExercises} exercises`
          : "Missed";

  return `${date} - ${day.dayType} - ${progress}`;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlans()
      .then((plans) => {
        if (plans.length > 0) {
          return getDashboardStats(plans[0].id);
        }
      })
      .then((s) => {
        if (s) setStats(s);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="app-surface rounded-xl p-4">
          <div className="h-4 bg-slate-800 rounded w-40 mb-4 animate-pulse" />
          <SkeletonBar />
        </div>
      </div>
    );

  if (!stats)
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        No stats yet - start logging workouts!
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h2 className="text-base font-medium text-white">Dashboard</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Current streak" value={`${stats.currentStreak}d`} />
        <StatCard label="Longest streak" value={`${stats.longestStreak}d`} />
        <StatCard
          label="Consistency"
          value={`${stats.overallConsistency}%`}
          sub={`${stats.totalCompleted}/${stats.totalScheduled} days`}
        />
        <StatCard label="Days remaining" value={stats.daysRemaining} />
      </div>

      <div className="app-surface rounded-xl p-4">
        <h3 className="text-sm font-medium mb-3" style={{ color: "#e5e7eb" }}>
          Consistency by type
        </h3>
        <div className="space-y-4">
          <ConsistencyBar
            label="Chest & Shoulders"
            value={stats.chestConsistency}
            color="#8b5cf6"
          />
          <ConsistencyBar
            label="Back & Rear Shoulders"
            value={stats.backConsistency}
            color="#14b8a6"
          />
          <ConsistencyBar
            label="Abs"
            value={stats.absConsistency}
            color="#f59e0b"
          />
        </div>
      </div>

      <div className="app-surface rounded-xl p-4">
        <h3 className="text-sm font-medium mb-3" style={{ color: "#e5e7eb" }}>
          Weekly completions
        </h3>
        {stats.weeklyBars.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.weeklyBars} barSize={14}>
              <XAxis
                dataKey="weekLabel"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(v, name) => [
                  v,
                  name === "completed" ? "Done" : "Scheduled",
                ]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#e2e8f0",
                }}
              />
              <Bar dataKey="total" fill="#263244" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                {stats.weeklyBars.map((_, i) => (
                  <Cell key={i} fill="#8b5cf6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="app-surface rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-medium" style={{ color: "#e5e7eb" }}>
            Activity heatmap
          </h3>
          <span className="text-xs" style={{ color: "#64748b" }}>
            Last {stats.heatmapDays.length} days
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <div className="grid grid-rows-7 gap-1 pr-1 text-[10px] leading-4 text-slate-500">
            <span>Sun</span>
            <span />
            <span>Tue</span>
            <span />
            <span>Thu</span>
            <span />
            <span>Sat</span>
          </div>
          <div
            className="grid grid-rows-7 grid-flow-col gap-1"
            style={{ gridAutoColumns: "1rem" }}
          >
            {stats.heatmapDays.map((day) => (
              <div
                key={day.date}
                title={getHeatmapTitle(day)}
                className="h-4 w-4 rounded-[4px] ring-1 ring-slate-950/40 transition-transform hover:scale-110"
                style={{ background: getHeatmapColor(day) }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-4 mt-4 flex-wrap">
          {[
            { color: "#8b5cf6", label: "Chest done" },
            { color: "#14b8a6", label: "Back done" },
            { color: "#f59e0b", label: "Abs done" },
            { color: "#4c3a9e", label: "Partial" },
            { color: "#273244", label: "Missed" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: l.color }}
              />
              <span className="text-xs text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
