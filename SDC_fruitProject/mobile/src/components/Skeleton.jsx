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
    <div className="card space-y-3 animate-pulse">
      <div className="skeleton h-10 w-10 rounded-xl" />
      <div className="skeleton h-4 w-20" />
      <div className="skeleton h-6 w-14" />
    </div>
  );
}
