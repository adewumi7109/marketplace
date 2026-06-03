"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import type { LocationSelection } from "@/components/SearchBar";
import { useLocations, useProductCategories, useProducts } from "@/lib/hooks";
import { slugify, titleFromSlug } from "@/lib/slug";
import type { Category, Product } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string; category: string }>;
}

export default function LocationCategoryProductsPage({ params }: Props) {
  const { slug, category: categoryParam } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || searchParams.get("q") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { locations } = useLocations({ country: "Nigeria", limit: 100 });
  const { categories } = useProductCategories();

  const resolvedLocation = useMemo(() => {
    const byCity = locations.find((item) => item.city && slugify(item.city) === slug);
    if (byCity) return { city: byCity.city, state: byCity.state || undefined };

    const byState = locations.find((item) => item.state && slugify(item.state) === slug);
    if (byState?.state) return { state: byState.state };

    return { city: titleFromSlug(slug) };
  }, [locations, slug]);

  const selectedCategory = useMemo(
    () => categories.find((item) => slugify(item.name) === categoryParam || item.id === categoryParam),
    [categories, categoryParam]
  );

  const selectedLocation: LocationSelection =
    resolvedLocation.city
      ? {
          type: "city",
          city: resolvedLocation.city,
          state: resolvedLocation.state || "",
          id: "",
        }
      : { type: "state", state: resolvedLocation.state || titleFromSlug(slug) };

  const { products, total, isLoading, isError, error } = useProducts(undefined, {
    categoryId: selectedCategory?.id ?? categoryParam,
    search: query,
    city: resolvedLocation.city,
    state: resolvedLocation.city ? undefined : resolvedLocation.state,
    minPrice,
    maxPrice,
    limit: 24,
  });

  const place = resolvedLocation.city || resolvedLocation.state || titleFromSlug(slug);
  const categoryTitle = selectedCategory?.name ?? titleFromSlug(categoryParam);

  const queryString = useCallback(
    (next: { query?: string; minPrice?: string; maxPrice?: string } = {}) => {
      const urlParams = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (value) urlParams.set(key, value);
        else urlParams.delete(key);
      });

      return urlParams.toString();
    },
    [searchParams]
  );

  const pushWithQuery = useCallback(
    (path: string, next: { query?: string; minPrice?: string; maxPrice?: string } = {}) => {
      const qs = queryString(next);
      router.push(`${path}${qs ? `?${qs}` : ""}`);
    },
    [queryString, router]
  );

  const replaceCurrentQuery = useCallback(
    (next: { query?: string; minPrice?: string; maxPrice?: string }) => {
      const qs = queryString(next);
      router.replace(`/${slug}/${categoryParam}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [categoryParam, queryString, router, slug]
  );

  const handleLocationChange = useCallback(
    (value: LocationSelection | null) => {
      if (!value) {
        pushWithQuery(`/${categoryParam}`);
        return;
      }

      const locationSlug = slugify(value.type === "city" ? value.city : value.state);
      pushWithQuery(`/${locationSlug}/${categoryParam}`);
    },
    [categoryParam, pushWithQuery]
  );

  const handleCategoryChange = useCallback(
    (value: Category | null) => {
      if (!value) {
        pushWithQuery(`/${slug}/search`);
        return;
      }

      pushWithQuery(`/${slug}/${slugify(value.name)}`);
    },
    [pushWithQuery, slug]
  );

  useEffect(() => {
    setQuery(searchParams.get("query") || searchParams.get("q") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white px-4 py-10 text-zinc-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-primary/20 bg-white p-2 text-zinc-500 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-zinc-950">
              {categoryTitle} in {place}
            </h1>
            {!isLoading && !isError && <p className="text-sm text-zinc-500">{total} products found</p>}
          </div>
        </div>

        <div className="flex gap-10">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory?.id ?? categoryParam}
            selectedLocation={selectedLocation}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategoryChange={handleCategoryChange}
            onLocationChange={handleLocationChange}
            onMinPriceChange={(value) => {
              setMinPrice(value);
              replaceCurrentQuery({ minPrice: value });
            }}
            onMaxPriceChange={(value) => {
              setMaxPrice(value);
              replaceCurrentQuery({ maxPrice: value });
            }}
            onClear={() => router.push("/")}
          />

          <main className="min-w-0 flex-1">
            {isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error instanceof Error ? error.message : "Unable to load products."}
              </div>
            )}

            {isLoading && !isError && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-2xl border border-primary/20 bg-white">
                    <div className="h-36 skeleton" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-3/4 skeleton rounded-full" />
                      <div className="h-3 w-1/2 skeleton rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !isError && products.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    storePhone={product.store?.phone ?? ""}
                    onProductClick={setSelectedProduct}
                  />
                ))}
              </div>
            )}

            {!isLoading && !isError && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Zap className="h-7 w-7" />
                </div>
                <h2 className="font-display mb-2 text-xl font-semibold">No products found</h2>
                <p className="text-sm text-zinc-500">Try another search or price range.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        storePhone={selectedProduct?.store?.phone ?? ""}
        primaryColor="green"
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
