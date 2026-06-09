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
import type { DashboardStatsDto, WorkoutPlan } from "../../types";
import { SkeletonCard, SkeletonBar } from "../../components/ui/Skeleton";

const TYPE_COLOR: Record<string, string> = {
  Chest: "#7c3aed",
  Back: "#0d9488",
  Abs: "#d97706",
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
    <div
      className="rounded-xl px-4 py-3"
      style={{ background: "#0d1421", border: "1px solid #1a2332" }}
    >
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
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [, setPlan] = useState<WorkoutPlan | null>(null);
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlans()
      .then((plans) => {
        if (plans.length > 0) {
          setPlan(plans[0]);
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
        <div
          className="rounded-xl p-4"
          style={{ background: "#0d1421", border: "1px solid #1a2332" }}
        >
          <div className="h-4 bg-gray-100 rounded w-40 mb-4 animate-pulse" />
          <SkeletonBar />
        </div>
      </div>
    );

  if (!stats)
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        No stats yet — start logging workouts!
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h2 className="text-base font-medium text-white">Dashboard</h2>

      {/* Stat cards */}
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

      {/* Consistency by type */}
      <div
        className="rounded-xl p-4"
        style={{ background: "#0d1421", border: "1px solid #1a2332" }}
      >
        <h3 className="text-sm font-medium mb-3" style={{ color: "#e5e7eb" }}>
          Consistency by type
        </h3>
        <ConsistencyBar
          label="Chest & Shoulders"
          value={stats.chestConsistency}
          color="#7c3aed"
        />
        <ConsistencyBar
          label="Back & Rear Shoulders"
          value={stats.backConsistency}
          color="#0d9488"
        />
        <ConsistencyBar
          label="Abs"
          value={stats.absConsistency}
          color="#d97706"
        />
      </div>

      {/* Weekly bar chart */}
      <div
        className="rounded-xl p-4"
        style={{ background: "#0d1421", border: "1px solid #1a2332" }}
      >
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
                tick={{ fontSize: 10 }}
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
                  border: "1px solid #f0f0f0",
                }}
              />
              <Bar dataKey="total" fill="#f3f4f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                {stats.weeklyBars.map((_, i) => (
                  <Cell key={i} fill="#7c3aed" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Heatmap */}
      <div
        className="rounded-xl p-4"
        style={{ background: "#0d1421", border: "1px solid #1a2332" }}
      >
        <h3 className="text-sm font-medium mb-3" style={{ color: "#e5e7eb" }}>
          Activity heatmap
        </h3>
        <div className="flex flex-wrap gap-1">
          {stats.heatmapDays.map((d) => {
            const isRest = d.dayType === "Rest";
            const bg = isRest
              ? "#f3f4f6"
              : d.isCompleted
                ? (TYPE_COLOR[d.dayType] ?? "#888")
                : d.completedExercises > 0
                  ? "#ddd6fe"
                  : "#e5e7eb";
            return (
              <div
                key={d.date}
                title={`${d.date} — ${d.dayType}${d.isCompleted ? " ✓" : ""}`}
                style={{ background: bg }}
                className="w-4 h-4 rounded-sm"
              />
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 flex-wrap">
          {[
            { color: "#7c3aed", label: "Chest done" },
            { color: "#0d9488", label: "Back done" },
            { color: "#d97706", label: "Abs done" },
            { color: "#ddd6fe", label: "Partial" },
            { color: "#e5e7eb", label: "Missed" },
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
