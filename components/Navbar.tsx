"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const showSearch = pathname !== "/";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("query") || params.get("q") || "");
  }, [pathname]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    const params = new URLSearchParams(window.location.search);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
      params.delete("q");
    }
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-primary/20 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ShoppingBag className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-zinc-950">
            Markt<span className="text-primary">Place</span>
          </span>
        </Link>

        {showSearch && (
          <form onSubmit={submitSearch} className="hidden w-full max-w-sm sm:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-lg border border-primary/20 bg-primary/10 pl-9 pr-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </form>
        )}

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 sm:inline-flex"
          >
            Login
          </Link>
          {showSearch && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="rounded-lg border border-primary/20 bg-primary/10 p-2 text-zinc-600 transition-colors hover:text-primary sm:hidden"
              aria-label="Toggle search"
            >
              {open ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>
          )}
        </div>
      </nav>

      {showSearch && open && (
        <div className="border-t border-primary/20 bg-white px-4 py-4 sm:hidden">
          <form onSubmit={submitSearch}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-lg border border-primary/20 bg-primary/10 pl-9 pr-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </form>
          <Link
            href="/login"
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Login
          </Link>
        </div>
      )}
    </header>
  );
}
