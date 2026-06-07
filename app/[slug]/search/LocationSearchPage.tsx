"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, SlidersHorizontal, Zap } from "lucide-react";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import type { LocationSelection } from "@/components/SearchBar";
import { useLocations, useProductCategories, useProducts } from "@/lib/hooks";
import { marketplaceProductPath } from "@/lib/productRoutes";
import { filterQueryString, locationPathSlug } from "@/lib/routes";
import { slugify, titleFromSlug } from "@/lib/slug";
import type { Category, Product } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function LocationSearchPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || searchParams.get("q") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { locations } = useLocations({ country: "Nigeria", limit: 100 });
  const { categories } = useProductCategories();
  const resolvedLocation = useMemo(() => {
    const byCity = locations.find((item) => item.city && slugify(item.city) === slug);
    if (byCity) return { city: byCity.city, state: byCity.state || undefined };

    const byState = locations.find((item) => item.state && slugify(item.state) === slug);
    if (byState?.state) return { state: byState.state };

    return { city: titleFromSlug(slug) };
  }, [slug, locations]);
  const selectedLocation: LocationSelection =
    resolvedLocation.city
      ? {
          type: "city",
          city: resolvedLocation.city,
          state: resolvedLocation.state || "",
          id: "",
        }
      : { type: "state", state: resolvedLocation.state || titleFromSlug(slug) };

  const { products, isLoading, isError, error } = useProducts(undefined, {
    search: query,
    city: resolvedLocation.city,
    state: resolvedLocation.city ? undefined : resolvedLocation.state,
    minPrice,
    maxPrice,
    limit: 24,
  });

  const place = resolvedLocation.city || resolvedLocation.state || titleFromSlug(slug);

  const replaceQuery = useCallback(
    (next: { query?: string; minPrice?: string; maxPrice?: string }) => {
      const qs = filterQueryString(searchParams.toString(), next);
      router.replace(`/${slug}/search${qs ? `?${qs}` : ""}`, {
        scroll: false,
      });
    },
    [slug, router, searchParams]
  );

  const handleLocationChange = useCallback(
    (value: LocationSelection | null) => {
      if (!value) {
        router.push(query ? `/?query=${encodeURIComponent(query)}` : "/");
        return;
      }

      const locationSlug = locationPathSlug(value);
      const qs = filterQueryString(searchParams.toString(), { query, minPrice, maxPrice });
      router.push(`/${locationSlug}/search${qs ? `?${qs}` : ""}`);
    },
    [maxPrice, minPrice, query, router, searchParams]
  );

  const handleCategoryChange = useCallback(
    (value: Category | null) => {
      if (!value) return;

      const qs = filterQueryString(searchParams.toString());
      router.push(`/${slug}/${slugify(value.name)}${qs ? `?${qs}` : ""}`);
    },
    [router, searchParams, slug]
  );

  const openMarketplaceProduct = useCallback(
    (product: Product) => {
      const path = marketplaceProductPath(product);
      if (path) router.push(path);
    },
    [router]
  );

  const prefetchMarketplaceProduct = useCallback(
    (product: Product) => {
      const path = marketplaceProductPath(product);
      if (path) router.prefetch(path);
    },
    [router]
  );

  useEffect(() => {
    setQuery(searchParams.get("query") || searchParams.get("q") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white px-4 py-10 text-zinc-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-primary/20 bg-white p-2 text-zinc-500 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-display text-xl font-bold text-zinc-950 sm:text-2xl">
                Products in {place}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen((current) => !current)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-primary/30 bg-white px-3 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:border-primary hover:text-primary lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {(selectedLocation || minPrice || maxPrice) && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        </div>

        <div className="flex gap-10">
          <div className="hidden lg:block">
            <FilterSidebar
              categories={categories}
              selectedCategory=""
              selectedLocation={selectedLocation}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryChange={handleCategoryChange}
              onLocationChange={handleLocationChange}
              onMinPriceChange={(value) => {
                setMinPrice(value);
                replaceQuery({ minPrice: value });
              }}
              onMaxPriceChange={(value) => {
                setMaxPrice(value);
                replaceQuery({ maxPrice: value });
              }}
              onClear={() => router.push(`/${slug}/search`)}
            />
          </div>

          <main className="min-w-0 flex-1">
            {sidebarOpen && (
              <div className="mb-6 rounded-xl border border-primary/20 bg-white p-4 shadow-lg lg:hidden">
                <FilterSidebar
                  categories={categories}
                  selectedCategory=""
                  selectedLocation={selectedLocation}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onCategoryChange={(value) => {
                    handleCategoryChange(value);
                    setSidebarOpen(false);
                  }}
                  onLocationChange={(value) => {
                    handleLocationChange(value);
                    setSidebarOpen(false);
                  }}
                  onMinPriceChange={(value) => {
                    setMinPrice(value);
                    replaceQuery({ minPrice: value });
                  }}
                  onMaxPriceChange={(value) => {
                    setMaxPrice(value);
                    replaceQuery({ maxPrice: value });
                  }}
                  onClear={() => {
                    router.push(`/${slug}/search`);
                    setSidebarOpen(false);
                  }}
                />
              </div>
            )}

            {isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error instanceof Error ? error.message : "Unable to load products."}
              </div>
            )}

            {isLoading && !isError && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-lg border border-primary/20 bg-white">
                    <div className="h-28 skeleton" />
                    <div className="space-y-2 p-3">
                      <div className="h-4 w-3/4 skeleton rounded-full" />
                      <div className="h-3 w-1/2 skeleton rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !isError && products.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    storePhone={product.store?.phone ?? ""}
                    cardStyle="compact"
                    showCondition
                    onProductClick={openMarketplaceProduct}
                    onProductPrefetch={prefetchMarketplaceProduct}
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
    </div>
  );
}
