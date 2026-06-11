"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, SlidersHorizontal, Zap } from "lucide-react";
import FilterSidebar from "@/components/FilterSidebar";
import SearchBar, { type LocationSelection } from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import { useProductCategories, useProducts } from "@/lib/hooks";
import type { Category, Product } from "@/lib/types";
import { slugify } from "@/lib/slug";
import { marketplaceProductPath } from "@/lib/productRoutes";

const HERO_CATEGORIES = ["Fashion", "Food", "Electronics", "General"];

export default function MarketplacePage() {
  const router = useRouter();
  const [search, setSearch] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("query") || params.get("q") || "";
  });
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("minPrice") || "";
  });
  const [maxPrice, setMaxPrice] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("maxPrice") || "";
  });
  const [page] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  const { products, total, isLoading, isError, error } = useProducts(undefined, {
    categoryId: category,
    search,
    minPrice,
    maxPrice,
    page,
    limit: 24,
  });
  const {
    categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useProductCategories();
  function clearFilters() {
    handleSearchChange("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    window.history.replaceState(null, "", "/");
  }

  function handleSearchChange(value: string) {
    setSearch(value.trimStart());
  }

  const handleSearchSubmit = useCallback(
    (value: string) => {
      const nextSearch = value.trimStart();
      const params = new URLSearchParams();
      if (nextSearch) params.set("query", nextSearch);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [maxPrice, minPrice, router]
  );

  const handleLocationChange = useCallback(
    (value: LocationSelection | null) => {
      if (!value) {
        router.push(search ? `/?query=${encodeURIComponent(search)}` : "/");
        return;
      }

      const locationSlug = slugify(value.type === "city" ? value.city : value.state);
      const params = new URLSearchParams();
      if (search) params.set("query", search);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      router.push(`/${locationSlug}/search${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [maxPrice, minPrice, router, search]
  );

  const handleCategoryChange = useCallback(
    (nextCategory: Category | null) => {
      if (!nextCategory) {
        setCategory("");
        router.push("/");
        return;
      }

      router.push(`/${slugify(nextCategory.name)}`);
    },
    [router]
  );

  const openProduct = useCallback(
    (product: Product) => {
      const path = marketplaceProductPath(product);
      if (path) router.push(path);
    },
    [router]
  );

  const prefetchProduct = useCallback(
    (product: Product) => {
      const path = marketplaceProductPath(product);
      if (path) router.prefetch(path);
    },
    [router]
  );

  const updatePriceQuery = useCallback((key: "minPrice" | "maxPrice", value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const nextUrl = params.toString() ? `/?${params.toString()}` : "/";
    window.history.replaceState(null, "", nextUrl);
  }, []);

  const handleMinPriceChange = useCallback(
    (value: string) => {
      setMinPrice(value);
      updatePriceQuery("minPrice", value);
    },
    [updatePriceQuery]
  );

  const handleMaxPriceChange = useCallback(
    (value: string) => {
      setMaxPrice(value);
      updatePriceQuery("maxPrice", value);
    },
    [updatePriceQuery]
  );

  useEffect(() => {
    const onNavbarSearch = (event: Event) => {
      const nextSearch =
        event instanceof CustomEvent && typeof event.detail === "string"
          ? event.detail
          : "";
      setSearch(nextSearch.trimStart());
      setSidebarOpen(false);
    };

    window.addEventListener("marketplace-search", onNavbarSearch);
    return () => window.removeEventListener("marketplace-search", onNavbarSearch);
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-950">
    <section
  className="relative overflow-hidden border-b border-primary/20 bg-cover bg-center"
  style={{
    backgroundImage: "url('marketplace.png')",
  }}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-primary/95" />

  {/* Content */}
  <div className="relative mx-auto max-w-7xl flex items-center justify-between px-4 py-16 sm:px-6 md:py-10">
    <div className="max-w-2xl">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-white/85 px-3 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur">
        <Zap className="h-3 w-3 text-accent" />
        Nigeria&apos;s fastest-growing product marketplace
      </div>

      <h1 className="font-display mb-5 text-balance text-2xl font-black leading-[1.05] tracking-tight text-white md:text-5xl">
        Discover local
        <br />
        <span className="text-accent">products near you</span>
      </h1>

      <p className="mb-8 max-w-lg text-lg text-white/80">
        Browse thousands of products, compare prices, and discover trusted stores.
      </p>

      <SearchBar
        value={search}
        onChange={handleSearchChange}
        onSubmit={handleSearchSubmit}
        onLocationChange={handleLocationChange}
        placeholder="Search products by name, category..."
        className="max-w-lg"
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {HERO_CATEGORIES.map((item) => (
          <button
            key={item}
            onClick={() => router.push(`/${slugify(item)}`)}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80 shadow-sm transition-all hover:border-accent/60 hover:bg-white/20 hover:text-white"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
    {/* To be used later */}
{/* <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur">
  <LocateFixed className="h-3 w-3 font-medium" />

  {geo.loading && (
    <span className="text-sm">Detecting location...</span>
  )}

  {!geo.loading && geo.userAddress && (
    <span className="text-sm">

      {geo.userAddress.state}
    </span>
  )}

  {!geo.loading && !geo.userAddress && geo.error && (
    <span className="text-sm text-red-500">
      Location unavailable
    </span>
  )}
</div> */}
  </div>
</section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex gap-10">
          <div className="hidden lg:block">
            <FilterSidebar
              categories={categories}
              selectedCategory={category}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryChange={handleCategoryChange}
              onLocationChange={handleLocationChange}
              onMinPriceChange={handleMinPriceChange}
              onMaxPriceChange={handleMaxPriceChange}
              onClear={clearFilters}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="text-sm text-zinc-600">
                {isLoading ? (
                  <span>Loading products...</span>
                ) : isError ? (
                  <span className="text-red-600">
                    {error instanceof Error ? error.message : "Unable to load products"}
                  </span>
                ) : (
                  <span>
                    {search
                      ? `Showing ${total.toLocaleString()} results for "${search}"`
                      : `${total.toLocaleString()} products`}
                  </span>
                )}
              </div>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-white px-3 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:border-primary hover:text-primary lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {(category || minPrice || maxPrice) && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            </div>

            {sidebarOpen && (
              <div className="mb-6 rounded-xl border border-primary/20 bg-white p-4 shadow-lg lg:hidden">
                <FilterSidebar
                  categories={categories}
                  selectedCategory={category}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onCategoryChange={(nextCategory) => {
                    handleCategoryChange(nextCategory);
                    setSidebarOpen(false);
                  }}
                  onLocationChange={(nextLocation) => {
                    handleLocationChange(nextLocation);
                    setSidebarOpen(false);
                  }}
                  onMinPriceChange={handleMinPriceChange}
                  onMaxPriceChange={handleMaxPriceChange}
                  onClear={() => {
                    clearFilters();
                    setSidebarOpen(false);
                  }}
                />
              </div>
            )}

            {categoriesError && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Categories could not be loaded, but product discovery is still available.
              </div>
            )}

            {categoriesLoading && !categories.length && (
              <div className="mb-6 text-sm text-zinc-500">Loading categories...</div>
            )}

            {isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error instanceof Error
                  ? error.message
                  : "We could not reach the marketplace API. Please try again."}
              </div>
            )}

            {isLoading && !isError && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-lg border border-primary/20 bg-white">
                    <div className="h-28 skeleton" />
                    <div className="space-y-2 p-3">
                      <div className="h-4 w-3/4 skeleton rounded-full" />
                      <div className="h-3 w-1/2 skeleton rounded-full" />
                      <div className="h-3 w-2/3 skeleton rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !isError && products.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product, index) => {
                  const categoryKey = product.category?.toLowerCase() ?? "";
                  const variant = categoryKey.includes("fashion")
                    ? "fashion"
                    : categoryKey.includes("food")
                    ? "food"
                    : categoryKey.includes("electronic")
                    ? "electronics"
                    : "default";

                  return (
                    <div
                      key={product.id}
                      className="animate-fade-up"
                      style={{
                        animationDelay: `${index * 40}ms`,
                        animationFillMode: "both",
                      }}
                    >
                      <ProductCard
                        product={product}
                        storePhone={product.store?.phone ?? ""}
                        variant={variant}
                        cardStyle="compact"
                        showInStock={variant !== "fashion"}
                        showCondition
                        onProductClick={openProduct}
                        onProductPrefetch={prefetchProduct}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoading && !isError && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Zap className="h-7 w-7" />
                </div>
                <h3 className="font-display mb-2 text-xl font-semibold text-zinc-950">
                  No products found
                </h3>
                <p className="mb-6 text-sm text-zinc-500">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Clear filters <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
