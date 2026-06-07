"use client";

import { useEffect } from "react";
import { trackProductView, trackStoreView } from "@/lib/api";

export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    trackProductView(productId).catch(() => undefined);
  }, [productId]);

  return null;
}

export function StoreViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackStoreView(slug).catch(() => undefined);
  }, [slug]);

  return null;
}
