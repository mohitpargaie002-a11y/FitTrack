import type { Toast } from "../../hooks/useToast";

export default function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-72">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg
            transition-all animate-fade-in
            ${t.type === "success" ? "bg-violet-600" : "bg-red-500"}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
