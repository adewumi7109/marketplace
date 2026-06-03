"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import StoreCard from "@/components/StoreCard";
import { useStores } from "@/lib/hooks";

function SearchResults() {
  const params = useSearchParams();
  const query = params.get("query") || params.get("q") || "";

  const { stores, total, isLoading, isError, error } = useStores({
    q: query,
    limit: 48,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/"
          className="p-2 rounded-lg hover:bg-surface-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {!isLoading && !isError && (
        <p className="text-sm text-zinc-500 mb-6">
          {query ? `${total} results for "${query}"` : `${total} stores available`}
        </p>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-100">
          {error instanceof Error ? error.message : "Unable to search stores."}
        </div>
      )}

      {isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="rounded-2xl overflow-hidden border border-border">
              <div className="h-36 skeleton" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 skeleton rounded-full" />
                <div className="h-3 w-1/2 skeleton rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && stores.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}

      {!isLoading && !isError && stores.length === 0 && (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-display font-semibold text-xl text-white mb-2">No results</h3>
          <p className="text-zinc-500">Try a different search term</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-zinc-500">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
