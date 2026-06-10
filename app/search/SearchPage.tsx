"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, SlidersHorizontal, Zap } from "lucide-react";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import type { LocationSelection } from "@/components/SearchBar";
import { useProductCategories, useProducts } from "@/lib/hooks";
import { marketplaceProductPath } from "@/lib/productRoutes";
import { filterQueryString, locationPathSlug } from "@/lib/routes";
import { slugify } from "@/lib/slug";
import type { Category, Product } from "@/lib/types";

export default function ProductSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { categories } = useProductCategories();

  const [query, setQuery] = useState(
    searchParams.get("query") || searchParams.get("q") || ""
  );

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );

  const [selectedLocation, setSelectedLocation] =
    useState<LocationSelection | null>(null);

  const [minPrice, setMinPrice] = useState(
    searchParams.get("minPrice") || ""
  );

  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") || ""
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { products, isLoading, isError, error } = useProducts(undefined, {
    search: query,
    categoryId: selectedCategory,
    city:
      selectedLocation?.type === "city"
        ? selectedLocation.city
        : undefined,
    state:
      selectedLocation?.type === "state"
        ? selectedLocation.state
        : undefined,
    minPrice,
    maxPrice,
    limit: 24,
  });

  const replaceFilterQuery = useCallback(
    (
      next: {
        query?: string;
        minPrice?: string;
        maxPrice?: string;
        category?: string;
      }
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(next).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.replace(
        `/search${params.toString() ? `?${params.toString()}` : ""}`,
        { scroll: false }
      );
    },
    [router, searchParams]
  );

  const handleLocationChange = useCallback(
    (value: LocationSelection | null) => {
      setSelectedLocation(value);

      const qs = filterQueryString(searchParams.toString());

      if (!value) {
        router.push(`/search${qs ? `?${qs}` : ""}`);
        return;
      }

      router.push(
        `/${locationPathSlug(value)}/search${qs ? `?${qs}` : ""}`
      );
    },
    [router, searchParams]
  );

  const handleCategoryChange = useCallback(
    (nextCategory: Category | null) => {
      const categoryId = nextCategory?.id ?? "";

      setSelectedCategory(categoryId);

      replaceFilterQuery({
        category: categoryId,
      });
    },
    [replaceFilterQuery]
  );

  const openMarketplaceProduct = useCallback(
    (product: Product) => {
      const path = marketplaceProductPath(product);

      if (path) {
        router.push(path);
      }
    },
    [router]
  );

  const prefetchMarketplaceProduct = useCallback(
    (product: Product) => {
      const path = marketplaceProductPath(product);

      if (path) {
        router.prefetch(path);
      }
    },
    [router]
  );

  useEffect(() => {
    const query =
      searchParams.get("query") ||
      searchParams.get("q") ||
      "";

    setQuery(query);

    setSelectedCategory(
      searchParams.get("category") || ""
    );

    setMinPrice(
      searchParams.get("minPrice") || ""
    );

    setMaxPrice(
      searchParams.get("maxPrice") || ""
    );

    const city = searchParams.get("city") || "";
    const state = searchParams.get("state") || "";

    setSelectedLocation(
      city
        ? {
            type: "city",
            city,
            state,
            id: "",
          }
        : state
        ? {
            type: "state",
            state,
          }
        : null
    );
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
                {query
                  ? `Search results for "${query}"`
                  : "Search products"}
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                {isLoading
                  ? "Searching products..."
                  : `${products.length} products found`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen((current) => !current)
            }
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-primary/30 bg-white px-3 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:border-primary hover:text-primary lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters

            {(selectedLocation ||
              selectedCategory ||
              minPrice ||
              maxPrice) && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        </div>

        <div className="flex gap-10">
          <div className="hidden lg:block">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              selectedLocation={selectedLocation}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryChange={handleCategoryChange}
              onLocationChange={handleLocationChange}
              onMinPriceChange={(value) => {
                setMinPrice(value);
                replaceFilterQuery({
                  minPrice: value,
                });
              }}
              onMaxPriceChange={(value) => {
                setMaxPrice(value);
                replaceFilterQuery({
                  maxPrice: value,
                });
              }}
              onClear={() => router.push("/")}
            />
          </div>

          <main className="min-w-0 flex-1">
            {sidebarOpen && (
              <div className="mb-6 rounded-xl border border-primary/20 bg-white p-4 shadow-lg lg:hidden">
                <FilterSidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
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
                    replaceFilterQuery({
                      minPrice: value,
                    });
                  }}
                  onMaxPriceChange={(value) => {
                    setMaxPrice(value);
                    replaceFilterQuery({
                      maxPrice: value,
                    });
                  }}
                  onClear={() => {
                    router.push("/");
                    setSidebarOpen(false);
                  }}
                />
              </div>
            )}

            {isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error instanceof Error
                  ? error.message
                  : "Unable to load products."}
              </div>
            )}

            {isLoading && !isError && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg border border-primary/20 bg-white"
                  >
                    <div className="h-28 skeleton" />
                    <div className="space-y-2 p-3">
                      <div className="h-4 w-3/4 skeleton rounded-full" />
                      <div className="h-3 w-1/2 skeleton rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading &&
              !isError &&
              products.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      storePhone={
                        product.store?.phone ?? ""
                      }
                      cardStyle="compact"
                      showCondition
                      onProductClick={
                        openMarketplaceProduct
                      }
                      onProductPrefetch={
                        prefetchMarketplaceProduct
                      }
                    />
                  ))}
                </div>
              )}

            {!isLoading &&
              !isError &&
              products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Zap className="h-7 w-7" />
                  </div>

                  <h2 className="font-display mb-2 text-xl font-semibold">
                    No products found
                  </h2>

                  <p className="text-sm text-zinc-500">
                    Try another search term or filter.
                  </p>

                  <button
                    onClick={() => router.push("/")}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                  >
                    Browse all products
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
          </main>
        </div>
      </div>
    </div>
  );
}