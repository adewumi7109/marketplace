"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Store, Product } from "@/lib/types";
import TemplateRenderer from "@/components/TemplateRenderer";
import { StoreViewTracker } from "@/components/ProductEngagement";
import { getStorePrimaryColor } from "@/lib/storefront";

interface Props {
  store: Store;
  products: Product[];
}

export default function StorePageClient({ store, products }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const primaryColor = getStorePrimaryColor(store);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) => {
      const searchable = [
        product.name,
        product.description,
        product.category,
        product.productCategory?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [products, search]);

  useEffect(() => {
    const root = document.documentElement;
    const previousPrimary = root.style.getPropertyValue("--primary-color");
    const previousLoader = root.style.getPropertyValue("--loader-color");

    root.style.setProperty("--primary-color", primaryColor);
    root.style.setProperty("--loader-color", primaryColor);

    return () => {
      if (previousPrimary) {
        root.style.setProperty("--primary-color", previousPrimary);
      } else {
        root.style.removeProperty("--primary-color");
      }

      if (previousLoader) {
        root.style.setProperty("--loader-color", previousLoader);
      } else {
        root.style.removeProperty("--loader-color");
      }
    };
  }, [primaryColor]);

  return (
    <>
      <StoreViewTracker slug={store.slug} />

      <TemplateRenderer
        store={store}
        products={filteredProducts}
        search={search}
        onSearchChange={setSearch}
        onProductClick={(product) => {
          router.push(`/store/${store.slug}/products/${product.slug || product.id}`);
        }}
      />
    </>
  );
}
