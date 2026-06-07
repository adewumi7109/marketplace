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
  initialCategory?: string;
}

function categorySlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function StorePageClient({ store, products, initialCategory = "" }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const initialCategoryName = useMemo(() => {
    if (!initialCategory) return "";
    const found = products.find((product) => {
      const name = product.productCategory?.name || product.category || "";
      return categorySlug(name) === initialCategory;
    });
    return found?.productCategory?.name || found?.category || "";
  }, [initialCategory, products]);
  const [category, setCategory] = useState(initialCategoryName);
  const primaryColor = getStorePrimaryColor(store);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const productCategory = product.productCategory?.name || product.category || "";
      if (category && productCategory !== category) return false;
      if (!term) return true;

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
  }, [products, search, category]);

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
        selectedCategory={category}
        allProducts={products}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onProductClick={(product) => {
          router.push(`/store/${store.slug}/products/${product.slug || product.id}`);
        }}
      />
    </>
  );
}
