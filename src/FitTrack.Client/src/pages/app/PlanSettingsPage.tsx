import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlans,
  deletePlan,
  updateDayExercises,
} from "../../api/workoutPlans";
import type { WorkoutPlan } from "../../types";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";

const SUGGESTIONS: Record<
  string,
  { name: string; sets: number; reps: string }[]
> = {
  Chest: [
    { name: "Standard Push-Up", sets: 3, reps: "10-15" },
    { name: "Wide-Grip Push-Up", sets: 3, reps: "10-12" },
    { name: "Diamond Push-Up", sets: 3, reps: "8-10" },
    { name: "Pike Push-Up", sets: 3, reps: "8-12" },
    { name: "Decline Push-Up", sets: 3, reps: "8-12" },
  ],
  Back: [
    { name: "Superman Hold", sets: 3, reps: "12" },
    { name: "Reverse Snow Angels", sets: 3, reps: "12-15" },
    { name: "Push-Up to T-Rotation", sets: 3, reps: "8 each side" },
    { name: "Bird Dog", sets: 3, reps: "10 each side" },
    { name: "Plank Hold", sets: 3, reps: "30-45 sec" },
  ],
  Abs: [
    { name: "Crunches", sets: 3, reps: "15-20" },
    { name: "Leg Raises", sets: 3, reps: "12-15" },
    { name: "Bicycle Crunches", sets: 3, reps: "20 total" },
    { name: "Plank", sets: 3, reps: "30-45 sec" },
    { name: "Mountain Climbers", sets: 3, reps: "30 sec" },
    { name: "Russian Twists", sets: 3, reps: "20 total" },
  ],
};

interface EditableExercise {
  name: string;
  description: string;
  sets: number;
  reps: string;
}

export default function PlanSettingsPage() {
  const navigate = useNavigate();
  const { toasts, showToast } = useToast();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Chest");
  const [editMap, setEditMap] = useState<Record<string, EditableExercise[]>>(
    {},
  );
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customEx, setCustomEx] = useState({
    name: "",
    description: "",
    sets: 3,
    reps: "",
  });

  useEffect(() => {
    getPlans()
      .then((plans) => {
        if (plans.length > 0) {
          const p = plans[0];
          setPlan(p);

          // Build editMap — unique day types with their exercises
          const map: Record<string, EditableExercise[]> = {};
          const seen = new Set<string>();
          p.planDays.forEach((day) => {
            const typeKey = String(day.dayType); // ensure it's a string
            if (!seen.has(typeKey) && typeKey !== "Rest") {
              seen.add(typeKey);
              map[typeKey] = day.exercises.map((e) => ({
                name: e.name,
                description: e.description ?? "",
                sets: e.sets,
                reps: e.reps,
              }));
            }
          });
          setEditMap(map);
          setActiveTab(Object.keys(map)[0] ?? "Chest");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const currentExercises = editMap[activeTab] ?? [];

  const isAdded = (name: string) =>
    currentExercises.some((e) => e.name === name);

  const toggleSuggestion = (s: {
    name: string;
    sets: number;
    reps: string;
  }) => {
    if (isAdded(s.name)) {
      setEditMap((m) => ({
        ...m,
        [activeTab]: m[activeTab].filter((e) => e.name !== s.name),
      }));
    } else {
      setEditMap((m) => ({
        ...m,
        [activeTab]: [
          ...(m[activeTab] ?? []),
          { name: s.name, description: "", sets: s.sets, reps: s.reps },
        ],
      }));
    }
  };

  const removeExercise = (name: string) => {
    setEditMap((m) => ({
      ...m,
      [activeTab]: m[activeTab].filter((e) => e.name !== name),
    }));
  };

  const addCustom = () => {
    if (!customEx.name.trim() || !customEx.reps.trim()) return;
    setEditMap((m) => ({
      ...m,
      [activeTab]: [
        ...(m[activeTab] ?? []),
        { ...customEx, description: customEx.description || "" },
      ],
    }));
    setCustomEx({ name: "", description: "", sets: 3, reps: "" });
    setShowCustomForm(false);
  };

  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      for (const [dayType, exercises] of Object.entries(editMap)) {
        await updateDayExercises(plan.id, dayType, exercises);
      }
      showToast("Exercises updated! Changes apply from next unlogged day.");
    } catch {
      showToast("Failed to save changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!plan) return;
    setDeleting(true);
    try {
      await deletePlan(plan.id);
      navigate("/plan/new");
    } catch {
      showToast("Failed to delete plan.", "error");
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div
        className="flex items-center justify-center py-20 text-sm"
        style={{ color: "#6b7280" }}
      >
        Loading...
      </div>
    );

  if (!plan)
    return (
      <div className="min-h-screen" style={{ background: "#0d1117" }}>
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <p className="text-sm mb-4" style={{ color: "#6b7280" }}>
            No plan found.
          </p>
          <button
            onClick={() => navigate("/plan/new")}
            className="text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            Create a plan →
          </button>
        </div>
      </div>
    );

  const dayTypes = Object.keys(editMap);

  return (
    <div className="min-h-screen" style={{ background: "#0d1117" }}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <ToastContainer toasts={toasts} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm transition-colors"
            style={{ color: "#6b7280" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#9ca3af")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-white flex-1">
            {plan.name}
          </h1>
        </div>

        {/* Plan info */}
        <div
          className="rounded-xl p-4 mb-5"
          style={{ background: "#13161f", border: "1px solid #1e2130" }}
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs mb-1" style={{ color: "#6b7280" }}>
                Start
              </div>
              <div className="text-white">
                {new Date(plan.startDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: "#6b7280" }}>
                End
              </div>
              <div className="text-white">
                {new Date(plan.endDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: "#6b7280" }}>
                Cycle
              </div>
              <div className="text-white">
                {plan.cycleConfig.workDays} on · {plan.cycleConfig.restDays}{" "}
                rest
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: "#6b7280" }}>
                Slots
              </div>
              <div className="text-white">
                {plan.cycleConfig.slots.join(", ")}
              </div>
            </div>
          </div>
        </div>

        {/* Edit exercises */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: "#13161f", border: "1px solid #1e2130" }}
        >
          <h2 className="text-sm font-medium mb-3" style={{ color: "#e5e7eb" }}>
            Edit exercises
          </h2>
          <p className="text-xs mb-4" style={{ color: "#4b5563" }}>
            Changes apply from tomorrow onwards. Past logs are never affected.
          </p>

          {/* Day type tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {dayTypes.map((dt) => (
              <button
                key={dt}
                onClick={() => setActiveTab(dt)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: activeTab === dt ? "#1a1730" : "#0f1117",
                  border: `1px solid ${activeTab === dt ? "#7c3aed" : "#1e2130"}`,
                  color: activeTab === dt ? "#a78bfa" : "#6b7280",
                }}
              >
                {activeTab === dt ? "✓ " : ""}
                {dt}
                <span className="ml-1 opacity-50 text-[10px]">
                  {editMap[dt]?.length ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Current exercises */}
          <div className="space-y-2 mb-4">
            {currentExercises.map((ex) => (
              <div
                key={ex.name}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{ background: "#0f1117", border: "1px solid #1e2130" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {ex.name}
                  </div>
                  <div className="text-xs" style={{ color: "#6b7280" }}>
                    {ex.sets} sets × {ex.reps}
                  </div>
                </div>
                <button
                  onClick={() => removeExercise(ex.name)}
                  className="text-xl leading-none flex-shrink-0"
                  style={{ color: "#4b5563" }}
                >
                  ×
                </button>
              </div>
            ))}
            {currentExercises.length === 0 && (
              <p
                className="text-xs text-center py-3"
                style={{ color: "#4b5563" }}
              >
                No exercises — add some below
              </p>
            )}
          </div>

          {/* Suggestions */}
          {(SUGGESTIONS[activeTab] ?? []).filter((s) => !isAdded(s.name))
            .length > 0 && (
            <div className="mb-4">
              <div className="text-xs mb-2" style={{ color: "#4b5563" }}>
                Suggestions
              </div>
              <div className="flex flex-wrap gap-2">
                {(SUGGESTIONS[activeTab] ?? [])
                  .filter((s) => !isAdded(s.name))
                  .map((s) => (
                    <button
                      key={s.name}
                      onClick={() => toggleSuggestion(s)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        background: "#1a1730",
                        border: "1px solid #312d6e",
                        color: "#a78bfa",
                      }}
                    >
                      + {s.name}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Custom exercise form */}
          {showCustomForm ? (
            <div
              className="rounded-lg p-3 space-y-2"
              style={{ background: "#0f1117", border: "1px solid #1e2130" }}
            >
              <input
                type="text"
                value={customEx.name}
                onChange={(e) =>
                  setCustomEx((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Exercise name"
                className="w-full px-3 py-2 rounded-lg text-sm text-white"
                style={{ background: "#13161f", border: "1px solid #1e2130" }}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={customEx.sets}
                  min={1}
                  onChange={(e) =>
                    setCustomEx((p) => ({ ...p, sets: +e.target.value }))
                  }
                  placeholder="Sets"
                  className="px-3 py-2 rounded-lg text-sm text-white"
                  style={{ background: "#13161f", border: "1px solid #1e2130" }}
                />
                <input
                  type="text"
                  value={customEx.reps}
                  onChange={(e) =>
                    setCustomEx((p) => ({ ...p, reps: e.target.value }))
                  }
                  placeholder="Reps e.g. 10-15"
                  className="px-3 py-2 rounded-lg text-sm text-white"
                  style={{ background: "#13161f", border: "1px solid #1e2130" }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addCustom}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ background: "#7c3aed" }}
                >
                  Add
                </button>
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    background: "#0f1117",
                    border: "1px solid #1e2130",
                    color: "#6b7280",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full py-2.5 rounded-lg text-sm mb-4"
              style={{
                background: "transparent",
                border: "1px dashed #1e2130",
                color: "#4b5563",
              }}
            >
              + Add custom exercise
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-medium text-white
            transition-colors disabled:opacity-60"
            style={{ background: "#7c3aed" }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        {/* Danger zone */}
        <div
          className="rounded-xl p-4"
          style={{ background: "#13161f", border: "1px solid #2a1515" }}
        >
          <h2 className="text-sm font-medium mb-1" style={{ color: "#f87171" }}>
            Danger zone
          </h2>
          <p className="text-xs mb-3" style={{ color: "#6b7280" }}>
            Deleting your plan removes all workout logs permanently. This cannot
            be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: "#2a1515",
                color: "#f87171",
                border: "1px solid #3a1a1a",
              }}
            >
              Delete plan & start fresh
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium" style={{ color: "#f87171" }}>
                Are you sure? All logs will be lost.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium
                  transition-colors disabled:opacity-60"
                  style={{ background: "#7f1d1d", color: "#fca5a5" }}
                >
                  {deleting ? "Deleting..." : "Yes, delete everything"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: "#0f1117",
                    border: "1px solid #1e2130",
                    color: "#9ca3af",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
