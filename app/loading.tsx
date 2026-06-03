export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-primary/20 bg-white">
            <div className="h-36 skeleton" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 skeleton rounded-full" />
              <div className="h-3 w-1/2 skeleton rounded-full" />
              <div className="h-3 w-2/3 skeleton rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
