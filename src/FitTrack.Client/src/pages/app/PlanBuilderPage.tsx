import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPlan } from "../../api/workoutPlans";
import type { BuilderState, BuilderExercise } from "../../types/builder";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";

const SLOT_SUGGESTIONS: Record<
  string,
  { name: string; sets: number; reps: string }[]
> = {
  Chest: [
    { name: "Standard Push-Up", sets: 3, reps: "10-15" },
    { name: "Wide-Grip Push-Up", sets: 3, reps: "10-12" },
    { name: "Diamond Push-Up", sets: 3, reps: "8-10" },
    { name: "Pike Push-Up", sets: 3, reps: "8-12" },
    { name: "Decline Push-Up", sets: 3, reps: "8-12" },
    { name: "Archer Push-Up", sets: 3, reps: "5-8 each side" },
  ],
  Back: [
    { name: "Superman Hold", sets: 3, reps: "12" },
    { name: "Reverse Snow Angels", sets: 3, reps: "12-15" },
    { name: "Push-Up to T-Rotation", sets: 3, reps: "8 each side" },
    { name: "Prone Y-W-T Raises", sets: 2, reps: "10 each shape" },
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
  Legs: [
    { name: "Bodyweight Squat", sets: 3, reps: "15-20" },
    { name: "Reverse Lunge", sets: 3, reps: "10 each side" },
    { name: "Jump Squat", sets: 3, reps: "10-12" },
    { name: "Glute Bridge", sets: 3, reps: "15-20" },
    { name: "Wall Sit", sets: 3, reps: "30-45 sec" },
  ],
  Cardio: [
    { name: "Jumping Jacks", sets: 3, reps: "30 sec" },
    { name: "High Knees", sets: 3, reps: "30 sec" },
    { name: "Burpees", sets: 3, reps: "8-10" },
    { name: "Mountain Climbers", sets: 3, reps: "30 sec" },
  ],
};

const SLOT_OPTIONS = [
  "Chest",
  "Back",
  "Abs",
  "Shoulders",
  "Legs",
  "Cardio",
  "Custom",
];

const STEP_LABELS = ["Plan basics", "Workout cycle", "Exercises", "Review"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEP_LABELS.map((label, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center
              text-xs font-semibold transition-colors
              ${
                i < current
                  ? "bg-teal-600 text-white"
                  : i === current
                    ? "bg-violet-600 text-white"
                    : "text-gray-500"
              }`}
              style={{
                background:
                  i < current
                    ? "#065f46"
                    : i === current
                      ? "#7c3aed"
                      : "#1e2130",
              }}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className="text-[10px] mt-1 text-center whitespace-nowrap"
              style={{ color: i === current ? "#a78bfa" : "#4b5563" }}
            >
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className="flex-1 h-px mb-4"
              style={{ background: i < current ? "#065f46" : "#1e2130" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({
  state,
  onChange,
}: {
  state: BuilderState;
  onChange: (s: Partial<BuilderState>) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div>
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: "#9ca3af" }}
        >
          Plan name
        </label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. 6-Month Home Workout"
          className="w-full px-3 py-2.5 rounded-lg text-sm text-white"
          style={{ background: "#0f1117", border: "1px solid #1e2130" }}
        />
      </div>

      <div>
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: "#9ca3af" }}
        >
          Start date
        </label>
        <input
          type="date"
          value={state.startDate}
          min={today}
          onChange={(e) => onChange({ startDate: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg text-sm text-white"
          style={{
            background: "#0f1117",
            border: "1px solid #1e2130",
            colorScheme: "dark",
          }}
        />
      </div>

      <div>
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: "#9ca3af" }}
        >
          Duration
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 3, 6, 0].map((m) => (
            <button
              key={m}
              onClick={() => onChange({ durationMonths: m })}
              className="py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: state.durationMonths === m ? "#1a1730" : "#0f1117",
                border: `1px solid ${state.durationMonths === m ? "#7c3aed" : "#1e2130"}`,
                color: state.durationMonths === m ? "#a78bfa" : "#6b7280",
              }}
            >
              {m === 0 ? "Custom" : `${m}mo`}
            </button>
          ))}
        </div>

        {state.durationMonths === 0 && (
          <div className="mt-3">
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#9ca3af" }}
            >
              End date
            </label>
            <input
              type="date"
              value={state.customEndDate}
              min={state.startDate || today}
              onChange={(e) => onChange({ customEndDate: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white"
              style={{
                background: "#0f1117",
                border: "1px solid #1e2130",
                colorScheme: "dark",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({
  state,
  onChange,
}: {
  state: BuilderState;
  onChange: (s: Partial<BuilderState>) => void;
}) {
  const updateSlotName = (index: number, name: string) => {
    const slots = [...state.slots];
    slots[index] = { ...slots[index], slotName: name, exercises: [] };
    onChange({ slots });
  };

  const syncSlots = (workDays: number) => {
    const current = state.slots;
    const newSlots = Array.from(
      { length: workDays },
      (_, i) => current[i] ?? { slotName: "", exercises: [] },
    );
    onChange({ workDays, slots: newSlots });
  };

  return (
    <div className="space-y-5">
      {/* Work days */}
      <div>
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: "#9ca3af" }}
        >
          Workout days per cycle
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => syncSlots(n)}
              className="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: state.workDays === n ? "#1a1730" : "#0f1117",
                border: `1px solid ${state.workDays === n ? "#7c3aed" : "#1e2130"}`,
                color: state.workDays === n ? "#a78bfa" : "#6b7280",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Rest days */}
      <div>
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: "#9ca3af" }}
        >
          Rest days per cycle
        </label>
        <div className="flex gap-2">
          {[1, 2].map((n) => (
            <button
              key={n}
              onClick={() => onChange({ restDays: n })}
              className="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: state.restDays === n ? "#1a1730" : "#0f1117",
                border: `1px solid ${state.restDays === n ? "#7c3aed" : "#1e2130"}`,
                color: state.restDays === n ? "#a78bfa" : "#6b7280",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Cycle preview */}
      <div>
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: "#9ca3af" }}
        >
          Cycle preview — repeats every {state.workDays + state.restDays} days
        </label>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: state.workDays }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="text-xs" style={{ color: "#4b5563" }}>
                Day {i + 1}
              </div>
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: "#1a1730",
                  border: "1px solid #312d6e",
                  color: "#a78bfa",
                }}
              >
                Workout
              </div>
            </div>
          ))}
          {Array.from({ length: state.restDays }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="text-xs" style={{ color: "#4b5563" }}>
                Day {state.workDays + i + 1}
              </div>
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: "#12141c",
                  border: "1px solid #1e2130",
                  color: "#374151",
                }}
              >
                Rest
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Label each slot */}
      <div>
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: "#9ca3af" }}
        >
          Name each workout day
        </label>
        <div className="space-y-2">
          {Array.from({ length: state.workDays }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="text-xs w-14 flex-shrink-0"
                style={{ color: "#6b7280" }}
              >
                Day {i + 1}
              </span>
              <div className="flex gap-2 flex-wrap">
                {SLOT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() =>
                      updateSlotName(i, opt === "Custom" ? "" : opt)
                    }
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background:
                        state.slots[i]?.slotName === opt ||
                        (opt === "Custom" &&
                          !SLOT_OPTIONS.slice(0, -1).includes(
                            state.slots[i]?.slotName,
                          ))
                          ? "#1a1730"
                          : "#0f1117",
                      border: `1px solid ${
                        state.slots[i]?.slotName === opt ||
                        (opt === "Custom" &&
                          !SLOT_OPTIONS.slice(0, -1).includes(
                            state.slots[i]?.slotName,
                          ))
                          ? "#7c3aed"
                          : "#1e2130"
                      }`,
                      color:
                        state.slots[i]?.slotName === opt ||
                        (opt === "Custom" &&
                          !SLOT_OPTIONS.slice(0, -1).includes(
                            state.slots[i]?.slotName,
                          ))
                          ? "#a78bfa"
                          : "#6b7280",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {!SLOT_OPTIONS.slice(0, -1).includes(
                state.slots[i]?.slotName,
              ) && (
                <input
                  type="text"
                  value={state.slots[i]?.slotName ?? ""}
                  onChange={(e) => updateSlotName(i, e.target.value)}
                  placeholder="Type name..."
                  className="flex-1 px-2 py-1 rounded-lg text-xs text-white min-w-0"
                  style={{ background: "#0f1117", border: "1px solid #1e2130" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
function Step3({
  state,
  onChange,
}: {
  state: BuilderState;
  onChange: (s: Partial<BuilderState>) => void;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customEx, setCustomEx] = useState({
    name: "",
    description: "",
    sets: 3,
    reps: "",
  });

  const currentSlot = state.slots[activeTab];
  const suggestions = SLOT_SUGGESTIONS[currentSlot?.slotName] ?? [];
  const isAdded = (name: string) =>
    currentSlot?.exercises.some((e) => e.name === name) ?? false;

  const updateSlotExercises = (idx: number, exercises: BuilderExercise[]) => {
    const slots = [...state.slots];
    slots[idx] = { ...slots[idx], exercises };
    onChange({ slots });
  };

  const toggleSuggestion = (s: {
    name: string;
    sets: number;
    reps: string;
  }) => {
    const exs = currentSlot.exercises;
    if (isAdded(s.name)) {
      updateSlotExercises(
        activeTab,
        exs.filter((e) => e.name !== s.name),
      );
    } else {
      updateSlotExercises(activeTab, [
        ...exs,
        { name: s.name, description: "", sets: s.sets, reps: s.reps },
      ]);
    }
  };

  const addCustom = () => {
    if (!customEx.name.trim() || !customEx.reps.trim()) return;
    updateSlotExercises(activeTab, [
      ...currentSlot.exercises,
      { ...customEx, description: customEx.description || "" },
    ]);
    setCustomEx({ name: "", description: "", sets: 3, reps: "" });
    setShowCustomForm(false);
  };

  const removeExercise = (name: string) => {
    updateSlotExercises(
      activeTab,
      currentSlot.exercises.filter((e) => e.name !== name),
    );
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {state.slots.map((slot, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveTab(i);
              setShowCustomForm(false);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: activeTab === i ? "#1a1730" : "#0f1117",
              border: `1px solid ${activeTab === i ? "#7c3aed" : "#1e2130"}`,
              color: activeTab === i ? "#a78bfa" : "#6b7280",
            }}
          >
            {slot.slotName || `Day ${i + 1}`}
            <span className="ml-1.5 text-[10px] opacity-60">
              {slot.exercises.length}
            </span>
          </button>
        ))}
      </div>

      {/* Current exercises */}
      {currentSlot?.exercises.length > 0 && (
        <div className="space-y-2 mb-4">
          {currentSlot.exercises.map((ex) => (
            <div
              key={ex.name}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ background: "#0f1117", border: "1px solid #1e2130" }}
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#065f46", border: "1px solid #047857" }}
              >
                <span className="text-[9px] text-emerald-300">✓</span>
              </div>
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
                className="text-lg leading-none flex-shrink-0"
                style={{ color: "#4b5563" }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-4">
          <div className="text-xs mb-2" style={{ color: "#4b5563" }}>
            Suggestions — tap to add
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions
              .filter((s) => !isAdded(s.name))
              .map((s) => (
                <button
                  key={s.name}
                  onClick={() => toggleSuggestion(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
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
              onChange={(e) =>
                setCustomEx((p) => ({ ...p, sets: +e.target.value }))
              }
              placeholder="Sets"
              min={1}
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
          <input
            type="text"
            value={customEx.description}
            onChange={(e) =>
              setCustomEx((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Description (optional)"
            className="w-full px-3 py-2 rounded-lg text-sm text-white"
            style={{ background: "#13161f", border: "1px solid #1e2130" }}
          />
          <div className="flex gap-2">
            <button
              onClick={addCustom}
              className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: "#7c3aed" }}
            >
              Add exercise
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
          className="w-full py-2.5 rounded-lg text-sm transition-colors"
          style={{
            background: "transparent",
            border: "1px dashed #1e2130",
            color: "#4b5563",
          }}
        >
          + Add custom exercise
        </button>
      )}
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────
function Step4({ state }: { state: BuilderState }) {
  const endDate =
    state.durationMonths > 0
      ? new Date(
          new Date(state.startDate).setMonth(
            new Date(state.startDate).getMonth() + state.durationMonths,
          ),
        ).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : state.customEndDate;

  return (
    <div className="space-y-4">
      <div
        className="rounded-lg p-4 space-y-3"
        style={{ background: "#0f1117", border: "1px solid #1e2130" }}
      >
        <div>
          <div className="text-xs mb-1" style={{ color: "#6b7280" }}>
            Plan name
          </div>
          <div className="text-sm font-medium text-white">{state.name}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs mb-1" style={{ color: "#6b7280" }}>
              Start date
            </div>
            <div className="text-sm text-white">
              {new Date(state.startDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: "#6b7280" }}>
              End date
            </div>
            <div className="text-sm text-white">{endDate}</div>
          </div>
        </div>
        <div>
          <div className="text-xs mb-1" style={{ color: "#6b7280" }}>
            Cycle
          </div>
          <div className="text-sm text-white">
            {state.workDays} workout{state.workDays > 1 ? "s" : ""} +{" "}
            {state.restDays} rest day{state.restDays > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {state.slots.map((slot, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg"
            style={{ background: "#0f1117", border: "1px solid #1e2130" }}
          >
            <div>
              <div className="text-sm font-medium text-white">
                {slot.slotName}
              </div>
              <div className="text-xs" style={{ color: "#6b7280" }}>
                {slot.exercises.length} exercise
                {slot.exercises.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="flex gap-1">
              {slot.exercises.slice(0, 3).map((_ex, j) => (
                <div
                  key={j}
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#7c3aed", opacity: 0.6 + j * 0.2 }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PlanBuilderPage() {
  const navigate = useNavigate();
  const { toasts, showToast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const [state, setState] = useState<BuilderState>({
    name: "",
    startDate: today,
    durationMonths: 6,
    customEndDate: "",
    workDays: 3,
    restDays: 1,
    slots: [
      { slotName: "Chest", exercises: [] },
      { slotName: "Back", exercises: [] },
      { slotName: "Abs", exercises: [] },
    ],
  });

  const update = (partial: Partial<BuilderState>) =>
    setState((s) => ({ ...s, ...partial }));

  // Validate each step before allowing next
  const canProceed = (): { ok: boolean; message: string } => {
    if (step === 0) {
      if (!state.name.trim())
        return { ok: false, message: "Please enter a plan name." };
      if (!state.startDate)
        return { ok: false, message: "Please pick a start date." };
      if (state.durationMonths === 0 && !state.customEndDate)
        return { ok: false, message: "Please pick an end date." };
    }
    if (step === 1) {
      const unnamed = state.slots.findIndex((s) => !s.slotName.trim());
      if (unnamed >= 0)
        return { ok: false, message: `Please name Day ${unnamed + 1}.` };
    }
    if (step === 2) {
      const empty = state.slots.findIndex((s) => s.exercises.length === 0);
      if (empty >= 0)
        return {
          ok: false,
          message: `Please add at least one exercise for ${state.slots[empty].slotName || `Day ${empty + 1}`}.`,
        };
    }
    return { ok: true, message: "" };
  };

  const handleNext = () => {
    const { ok, message } = canProceed();
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setStep((s) => s + 1);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createPlan({
        name: state.name,
        startDate: state.startDate,
        durationMonths: state.durationMonths,
        customEndDate: state.durationMonths === 0 ? state.customEndDate : null,
        workDays: state.workDays,
        restDays: state.restDays,
        daySlots: state.slots.map((s) => ({
          slotName: s.slotName,
          exercises: s.exercises,
        })),
      });
      showToast("Plan created! Let's go 💪");
      setTimeout(() => navigate("/"), 1000);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to create plan.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <ToastContainer toasts={toasts} />

      <div className="mb-5">
        <h1 className="text-lg font-semibold text-white">
          Create workout plan
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
          Set up your personalised training schedule
        </p>
      </div>

      <StepIndicator current={step} />

      <div
        className="rounded-2xl p-5 mb-5"
        style={{ background: "#13161f", border: "1px solid #1e2130" }}
      >
        <h2 className="text-sm font-medium mb-4" style={{ color: "#e5e7eb" }}>
          {STEP_LABELS[step]}
        </h2>

        {step === 0 && <Step1 state={state} onChange={update} />}
        {step === 1 && <Step2 state={state} onChange={update} />}
        {step === 2 && <Step3 state={state} onChange={update} />}
        {step === 3 && <Step4 state={state} />}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "#0f1117",
              border: "1px solid #1e2130",
              color: "#9ca3af",
            }}
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ background: "#7c3aed" }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white
              transition-colors disabled:opacity-60"
            style={{ background: "#7c3aed" }}
          >
            {loading ? "Creating..." : "Create plan 🚀"}
          </button>
        )}
      </div>
    </div>
  );
}
