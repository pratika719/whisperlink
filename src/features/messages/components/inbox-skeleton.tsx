export function InboxSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-border/40 bg-card/30 p-5"
        >
          <div className="mb-3 space-y-2">
            <div className="h-4 w-full rounded bg-muted/60" />
            <div className="h-4 w-3/4 rounded bg-muted/40" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-muted/30" />
            <div className="h-7 w-16 rounded bg-muted/20" />
          </div>
        </div>
      ))}
    </div>
  );
}
