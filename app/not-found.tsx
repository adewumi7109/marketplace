import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">404</div>
      <h1 className="font-display font-bold text-3xl text-white mb-3">Page Not Found</h1>
      <p className="text-zinc-400 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
      >
        Go to Marketplace
      </Link>
    </div>
  );
}
