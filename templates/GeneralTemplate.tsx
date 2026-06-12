"use client";

import Image from "next/image";
import type { CSSProperties, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product, Store } from "@/lib/types";
import { getStorePrimaryColor, storeAddressLabel } from "@/lib/storefront";

interface TemplateProps {
  store: Store;
  products: Product[];
  allProducts?: Product[];
  search?: string;
  selectedCategory?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
  onProductClick?: (product: Product) => void;
  onProductPrefetch?: (product: Product) => void;
}

const defaultBannerText = "Welcome to our store - explore amazing products today";

export default function GeneralTemplate({
  store,
  products,
  allProducts,
  search = "",
  selectedCategory = "",
  onSearchChange,
  onSearchSubmit,
  onCategoryChange,
  onProductClick,
  onProductPrefetch,
}: TemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const primaryColor = getStorePrimaryColor(store);
  const categoryNames = Array.from(
    new Set(
      (allProducts ?? products)
        .map((product) => product.productCategory?.name || product.category)
        .filter((category): category is string => Boolean(category))
    )
  );
  const storefrontUrl = `/`;
  const bannerText = store.bannerText?.trim() || defaultBannerText;
  const storeAddress = storeAddressLabel(store);
  const hasMobilePanel = mobileSearchOpen || mobileMenuOpen;

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearchSubmit?.(search);
    setMobileSearchOpen(false);
  }

  useEffect(() => {
    if (!mobileSearchOpen) return;
    mobileSearchInputRef.current?.focus();
  }, [mobileSearchOpen]);

  return (
    <div
      className="min-h-screen bg-[#f7f4ef] text-zinc-950"
      style={
        {
          "--primary-color": primaryColor,
          "--loader-color": primaryColor,
        } as CSSProperties
      }
    >
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <a href={storefrontUrl} className="flex min-w-0 items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-100 ring-1 ring-zinc-200">
              {store.logoUrl ? (
                <Image src={store.logoUrl} alt={store.name} fill sizes="40px" className="object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-sm font-black text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {store.name[0]}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black leading-tight">{store.name}</p>
            </div>
          </a>

          <div className="ml-auto hidden items-center gap-7 text-sm font-semibold text-zinc-700 lg:flex">
            <a href="#products" className="transition hover:text-zinc-950">Products</a>
            <a href="#about" className="transition hover:text-zinc-950">About</a>
          </div>

          <form
            onSubmit={submitSearch}
            className="hidden w-full max-w-sm items-center rounded-md border border-zinc-200 bg-zinc-50 pl-3 shadow-sm transition focus-within:border-zinc-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-zinc-950/5 md:flex"
          >
            <Search className="h-4 w-4 shrink-0 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder={`Search ${store.name}`}
              className="ml-2 h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-zinc-400"
            />
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-r-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
              aria-label="Search store"
              title="Search store"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <a
            href="#products"
            className="ml-auto hidden h-10 items-center gap-2 rounded-md px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 sm:inline-flex lg:ml-0"
            style={{ backgroundColor: primaryColor }}
          >
            <ShoppingBag className="h-4 w-4" />
            Shop
          </a>

          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((value) => !value);
              setMobileMenuOpen(false);
            }}
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 md:hidden"
            aria-label={mobileSearchOpen ? "Close store search" : "Open store search"}
            title={mobileSearchOpen ? "Close search" : "Search store"}
          >
            {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((value) => !value);
              setMobileSearchOpen(false);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 md:hidden"
            aria-label={mobileMenuOpen ? "Close store menu" : "Open store menu"}
            title={mobileMenuOpen ? "Close menu" : "Menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {hasMobilePanel && (
          <div className="border-t border-zinc-100 px-4 py-3 md:hidden">
            {mobileSearchOpen && (
              <form
                onSubmit={submitSearch}
                className="flex items-center rounded-md border border-zinc-200 bg-zinc-50 pl-3 shadow-sm transition focus-within:border-zinc-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-zinc-950/5"
              >
                <Search className="h-4 w-4 shrink-0 text-zinc-400" />
                <input
                  ref={mobileSearchInputRef}
                  value={search}
                  onChange={(event) => onSearchChange?.(event.target.value)}
                  placeholder={`Search ${store.name}`}
                  className="ml-2 h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-zinc-400"
                />
                <button
                  type="submit"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-r-md text-white transition hover:brightness-95"
                  style={{ backgroundColor: primaryColor }}
                  aria-label="Search store"
                  title="Search store"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            )}
            {mobileMenuOpen && (
              <nav className="mt-3 grid gap-2 text-sm font-semibold text-zinc-700">
                <a href="#products" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-2 py-2 hover:bg-zinc-50">Products</a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-2 py-2 hover:bg-zinc-50">About</a>
              </nav>
            )}
          </div>
        )}
      </header>

      <section className="relative overflow-hidden bg-zinc-950 text-white">
        {store.bannerUrl ? (
          <Image
            src={store.bannerUrl}
            alt={store.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#171717,#3f3f46_55%,#111827)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/75 to-zinc-950/20" />

        <div className="relative mx-auto flex min-h-[68vh] max-w-7xl items-center justify-center px-4 py-20 text-center sm:px-6 lg:py-24">
          <div className="mx-auto max-w-3xl">
           
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <div className="min-w-0">
                <h1 className="font-display text-4xl font-black leading-none tracking-tight sm:text-6xl">
                  {store.name}
                </h1>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-200">
                  {store.isVerified && (
                    <span className="inline-flex items-center gap-1.5">
                      <BadgeCheck className="h-4 w-4" style={{ color: primaryColor }} />
                      Verified store
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    Curated products
                  </span>
                </div>
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-100 sm:text-lg">
              {bannerText}
            </p>

            {store.description && (
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                {store.description}
              </p>
            )}

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href="#products"
                className="inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
                style={{ backgroundColor: primaryColor }}
              >
                Shop products
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 border-b border-zinc-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Products</p>
            <h2 className="font-display text-3xl font-black tracking-tight">Shop {store.name}</h2>
          </div>
          {categoryNames.length > 0 && (
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => onCategoryChange?.("")}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${
                  !selectedCategory
                    ? "text-white ring-transparent"
                    : "bg-white text-zinc-600 ring-zinc-200"
                }`}
                style={!selectedCategory ? { backgroundColor: primaryColor } : undefined}
              >
                All
              </button>
              {categoryNames.slice(0, 6).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategoryChange?.(category)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${
                    selectedCategory === category
                      ? "text-white ring-transparent"
                      : "bg-white text-zinc-600 ring-zinc-200"
                  }`}
                  style={selectedCategory === category ? { backgroundColor: primaryColor } : undefined}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-16 text-center">
            <p className="font-semibold text-zinc-900">
              {search ? "No products match your search" : "No products listed yet"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {search ? "Try a different product name." : "Check back soon for new items."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                storePhone={store.phone}
                cardStyle="compact"
                primaryColor={primaryColor}
                showLocation={false}
                onProductClick={onProductClick}
                onProductPrefetch={onProductPrefetch}
              />
            ))}
          </div>
        )}
      </section>

      <section id="about" className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">About</p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight">{store.name}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
            {store.description || `${store.name} offers a curated selection of products for shoppers.`}
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 text-white" style={{ backgroundColor: primaryColor }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:px-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-base font-black">{store.name}</p>
            {storeAddress && <p className="mt-2 max-w-xl leading-6 text-white/80">{storeAddress}</p>}
          </div>
          <p className="text-xs font-medium text-white/70">
            Copyright {store.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
