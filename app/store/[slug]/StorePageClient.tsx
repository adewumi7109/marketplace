"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Store, Product } from "@/lib/types";
import TemplateRenderer from "@/components/TemplateRenderer";
import ProductDetailModal from "@/components/ProductDetailModal";

interface Props {
  store: Store;
  products: Product[];
}

export default function StorePageClient({ store, products }: Props) {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const primaryColor =
    typeof store.templateData?.config?.primaryColor === "string"
      ? store.templateData.config.primaryColor
      : "#2563eb";

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
      <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${store.name}`}
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100"
            />
          </div>
        </div>
      </div>

      <TemplateRenderer
        store={store}
        products={filteredProducts}
        onProductClick={setSelectedProduct}
      />

      <ProductDetailModal
        product={selectedProduct}
        storePhone={store.phone}
        primaryColor={primaryColor}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
