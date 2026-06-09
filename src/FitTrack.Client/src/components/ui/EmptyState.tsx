import { useNavigate } from "react-router-dom";

export default function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="text-5xl mb-4">🏋️</div>
      <h2 className="text-lg font-medium text-white mb-2">
        No workout plan yet
      </h2>
      <p className="text-sm mb-6 max-w-xs" style={{ color: "#6b7280" }}>
        Build your personalised plan — choose your cycle, pick your exercises,
        and start tracking.
      </p>
      <button
        onClick={() => navigate("/plan/new")}
        className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium
          px-6 py-3 rounded-xl transition-colors"
      >
        Create my plan →
      </button>
    </div>
  );
}
