"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, UserPlus, X } from "lucide-react";

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
            className="hidden items-center justify-center rounded-lg border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5 sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="hidden items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 sm:inline-flex"
          >
            Register
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-lg border border-primary/20 bg-white p-2 text-zinc-700 transition-colors hover:border-primary/40 hover:text-primary sm:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-primary/20 bg-white px-4 py-4 sm:hidden">
          {showSearch && (
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
          )}
          <div className={showSearch ? "mt-3 grid grid-cols-2 gap-3" : "grid grid-cols-2 gap-3"}>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-primary/30 bg-white px-4 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              <UserPlus className="h-4 w-4" />
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
