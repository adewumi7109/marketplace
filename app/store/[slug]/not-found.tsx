import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl mb-6">🏪</div>
      <h1 className="font-display font-bold text-4xl text-gray mb-3">Store Not Found</h1>
      <p className="text-zinc-400 mb-8 max-w-md">
        This store doesn't exist or may have moved. Browse our marketplace to find what you're looking for.
      </p>
      <Link
        href="https://www.kombomart.com/"
        className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
      >
        Back to Marketplace
      </Link>
    </div>
  );
}
