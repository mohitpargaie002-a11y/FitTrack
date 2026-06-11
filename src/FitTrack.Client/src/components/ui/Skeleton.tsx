export function SkeletonCard() {
  return (
    <div className="app-surface rounded-xl p-4 animate-pulse">
      <div className="h-7 bg-slate-800 rounded w-16 mb-2" />
      <div className="h-3 bg-slate-800 rounded w-24" />
    </div>
  );
}

export function SkeletonCalendar() {
  return (
    <div className="app-surface rounded-2xl p-4 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-5 bg-slate-800 rounded w-8" />
        <div className="h-5 bg-slate-800 rounded w-32" />
        <div className="h-5 bg-slate-800 rounded w-8" />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonBar() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <div className="h-3 bg-slate-800 rounded w-32 mb-1" />
          <div className="h-2 bg-slate-800 rounded-full" />
        </div>
      ))}
    </div>
  );
}
