export default function AplicacoesLoading() {
  return (
    <div className="space-y-6">
      {/* Toolbar skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="flex gap-3">
          <div className="h-10 w-80 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-10 w-48 animate-pulse rounded-lg bg-neutral-200" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-neutral-200" />
          ))}
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-200" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-200" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
            </div>
            <div className="mt-4 flex gap-3">
              <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-200" />
              <div className="h-6 w-20 animate-pulse rounded bg-neutral-200" />
              <div className="h-6 w-14 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
