import { seedDefaultPlan } from "../../api/workoutPlans";
import { useState } from "react";

interface Props {
  onSeeded: () => void;
}

export default function EmptyState({ onSeeded }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSeed = async () => {
    setLoading(true);
    setError("");
    try {
      await seedDefaultPlan("2026-06-01");
      onSeeded();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="text-5xl mb-4">🏋️</div>
      <h2 className="text-lg font-medium text-gray-900 mb-2">
        No workout plan yet
      </h2>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        Set up your 6-month home workout plan with one tap. Chest, back, abs —
        all pre-loaded.
      </p>
      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
      <button
        onClick={handleSeed}
        disabled={loading}
        className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium
          px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
      >
        {loading ? "Setting up your plan..." : "Start my 6-month plan"}
      </button>
    </div>
  );
}
