import { useEffect, useState } from "react";
import { getDayLog, toggleExercise, toggleDay } from "../api/logs";
import type { DailyLogDto } from "../types";

interface Props {
  planId: string;
  date: string;
  onClose: (markedDone?: boolean) => void; // ← add optional param
}

const DAY_BADGE: Record<string, string> = {
  Chest: "bg-violet-100 text-violet-700",
  Back: "bg-teal-100 text-teal-700",
  Abs: "bg-amber-100 text-amber-700",
};

export default function DayDetailDrawer({ planId, date, onClose }: Props) {
  const [log, setLog] = useState<DailyLogDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDayLog(planId, date)
      .then(setLog)
      .finally(() => setLoading(false));
  }, [planId, date]);

  const handleToggleExercise = async (entryId: string, current: boolean) => {
    if (!log) return;
    const updated = await toggleExercise(planId, log.id, entryId, !current);
    setLog(updated);
  };

  const handleToggleDay = async () => {
    if (!log) return;
    const updated = await toggleDay(planId, log.id, !log.isCompleted);
    setLog(updated);
    if (updated.isCompleted) onClose(true); // ← close + trigger toast
  };

  const formatted = new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const completedCount =
    log?.logEntries.filter((e) => e.isCompleted).length ?? 0;
  const totalCount = log?.logEntries.length ?? 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={() => onClose()}
      />

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl
        max-h-[85vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-8">
          {/* Date + type */}
          <div className="flex items-start justify-between mt-3 mb-4">
            <div>
              <p className="text-xs text-gray-400">{formatted}</p>
              {log && (
                <span
                  className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full
                  ${DAY_BADGE[log.dayType] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {log.dayType === "Chest"
                    ? "Chest & Shoulders"
                    : log.dayType === "Back"
                      ? "Back & Rear Shoulders"
                      : "Abs"}
                </span>
              )}
            </div>
            <button
              onClick={() => onClose()}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-1"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">
              Loading...
            </div>
          ) : log ? (
            <>
              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>
                    {completedCount} of {totalCount} exercises done
                  </span>
                  <span>
                    {totalCount > 0
                      ? Math.round((completedCount / totalCount) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{
                      width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Exercises */}
              <div className="space-y-2 mb-5">
                {log.logEntries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() =>
                      handleToggleExercise(entry.id, entry.isCompleted)
                    }
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer
                      transition-colors select-none
                      ${
                        entry.isCompleted
                          ? "bg-violet-50 border-violet-200"
                          : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                      }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      flex-shrink-0 transition-colors
                      ${
                        entry.isCompleted
                          ? "bg-violet-500 border-violet-500"
                          : "border-gray-300"
                      }`}
                    >
                      {entry.isCompleted && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          entry.isCompleted
                            ? "text-violet-700 line-through"
                            : "text-gray-800"
                        }`}
                      >
                        {entry.exerciseName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {entry.sets} sets × {entry.reps}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mark day button */}
              <button
                onClick={handleToggleDay}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-colors
                  ${
                    log.isCompleted
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-violet-600 text-white hover:bg-violet-700"
                  }`}
              >
                {log.isCompleted
                  ? "Unmark day as complete"
                  : "✓ Mark day as complete"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
