"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-5xl mb-6">⚡</div>
      <h2 className="font-display font-bold text-2xl text-white mb-3">Something went wrong</h2>
      <p className="text-zinc-400 text-sm mb-6 max-w-sm">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
