export function Skeleton({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton h-6 ${className}`} />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="card space-y-4 animate-pulse">
      <div className="skeleton h-12 w-12 rounded-xl" />
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-8 w-16" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
