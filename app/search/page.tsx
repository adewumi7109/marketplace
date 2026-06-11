"use client";

import { Suspense } from "react";
import ProductSearchPage from "./SearchPage";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-zinc-500">Loading...</div>}>
      <ProductSearchPage />
    </Suspense>
  );
}
