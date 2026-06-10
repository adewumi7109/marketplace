"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import StoreCard from "@/components/StoreCard";
import { useStores } from "@/lib/hooks";
import ProductSearchPage from "./SearchPage";

function SearchResults() {
  const params = useSearchParams();
  const query = params.get("query") || params.get("q") || "";

  const { stores, total, isLoading, isError, error } = useStores({
    q: query,
    limit: 48,
  });

  return (
    <SearchPage/>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-zinc-500">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
