import Image from "next/image";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Search,
  Store as StoreIcon,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product, Store } from "@/lib/types";
import { getStorePrimaryColor, storeLocationLabel } from "@/lib/storefront";

interface TemplateProps {
  store: Store;
  products: Product[];
  search?: string;
  onSearchChange?: (value: string) => void;
  onProductClick?: (product: Product) => void;
}

export default function GeneralTemplate({
  store,
  products,
  search = "",
  onSearchChange,
  onProductClick,
}: TemplateProps) {
  const config = store.templateData?.config || {};
  const primaryColor = getStorePrimaryColor(store);
  const showWhatsapp = config.showWhatsappButton !== false;
  const categoryNames = Array.from(
    new Set(
      products
        .map((product) => product.productCategory?.name || product.category)
        .filter((category): category is string => Boolean(category))
    )
  );
  const featured = products.slice(0, 3);
  const cleanPhone = store.phone?.replace(/\D/g, "") || "";
  const locationLabel = storeLocationLabel(store) || "Nigeria";
  const storefrontUrl = `/store/${store.slug}`;

  return (
    <div
      className="min-h-screen bg-[#f6f5f1] text-zinc-950"
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
              <p className="truncate text-xs font-medium text-zinc-500">{locationLabel}</p>
            </div>
          </a>

          <div className="ml-auto hidden items-center gap-7 text-sm font-semibold text-zinc-700 md:flex">
            <a href="#products" className="transition hover:text-zinc-950">Products</a>
            <a href="#about" className="transition hover:text-zinc-950">About</a>
            {store.phone && <a href={`tel:${store.phone}`} className="transition hover:text-zinc-950">Call</a>}
          </div>

          <div className="ml-auto hidden w-full max-w-xs items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 lg:flex">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search products"
              className="ml-2 w-full bg-transparent text-sm font-medium outline-none placeholder:text-zinc-400"
            />
          </div>

          {showWhatsapp && cleanPhone && (
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-2 rounded-md px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 sm:inline-flex"
              style={{ backgroundColor: primaryColor }}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
        </div>
      </header>

      <section className="relative min-h-[72vh] overflow-hidden bg-zinc-950 text-white">
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
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#18181b,#3f3f46_55%,#0f172a)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/75 to-zinc-950/20" />

        <div className="relative mx-auto grid min-h-[72vh] max-w-7xl items-end gap-10 px-4 pb-8 pt-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-12">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">
              <StoreIcon className="h-3.5 w-3.5" />
              {store.category || "Store"}
            </div>
            <div className="flex items-end gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-white/30 sm:h-24 sm:w-24">
                {store.logoUrl ? (
                  <Image src={store.logoUrl} alt={store.name} fill sizes="96px" className="object-cover" />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-3xl font-black text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {store.name[0]}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-4xl font-black leading-none tracking-tight sm:text-6xl">
                  {store.name}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-200">
                  {store.isVerified && (
                    <span className="inline-flex items-center gap-1.5">
                      <BadgeCheck className="h-4 w-4" style={{ color: primaryColor }} />
                      Verified
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {locationLabel}
                  </span>
                </div>
              </div>
            </div>

            {store.description && (
              <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-200 sm:text-lg">
                {store.description}
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              {showWhatsapp && cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp store
                </a>
              )}
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-zinc-950 transition hover:-translate-y-0.5"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              )}
              <a
                href="#products"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-white/12 px-5 text-sm font-bold text-white ring-1 ring-white/20 transition hover:-translate-y-0.5"
              >
                Shop products
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur sm:grid-cols-3 lg:self-end">
            <div className="rounded-md bg-white/10 p-4">
              <Package className="h-4 w-4 text-zinc-300" />
              <p className="mt-2 text-2xl font-black">{products.length}</p>
              <p className="text-xs font-semibold text-zinc-300">Products</p>
            </div>
            <div className="rounded-md bg-white/10 p-4">
              <Search className="h-4 w-4 text-zinc-300" />
              <p className="mt-2 text-2xl font-black">{categoryNames.length || 1}</p>
              <p className="text-xs font-semibold text-zinc-300">Collections</p>
            </div>
            <div className="rounded-md bg-white/10 p-4">
              <Eye className="h-4 w-4 text-zinc-300" />
              <p className="mt-2 text-2xl font-black">{(store.storeViewCount ?? 0).toLocaleString()}</p>
              <p className="text-xs font-semibold text-zinc-300">Store views</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white lg:hidden">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search products"
              className="ml-2 w-full bg-transparent text-sm font-medium outline-none placeholder:text-zinc-400"
            />
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Featured</p>
              <h2 className="font-display text-2xl font-black tracking-tight">Store highlights</h2>
            </div>
            <a href="#products" className="hidden items-center gap-2 text-sm font-bold text-zinc-700 hover:text-zinc-950 sm:inline-flex">
              View all
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                storePhone={store.phone}
                cardStyle="detailed"
                showWhatsapp={showWhatsapp}
                primaryColor={primaryColor}
                onProductClick={onProductClick}
              />
            ))}
          </div>
        </section>
      )}

      <section id="products" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 border-b border-zinc-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Products</p>
            <h2 className="font-display text-3xl font-black tracking-tight">Shop {store.name}</h2>
          </div>
          {categoryNames.length > 0 && (
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {categoryNames.slice(0, 6).map((category) => (
                <span
                  key={category}
                  className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 ring-1 ring-zinc-200"
                >
                  {category}
                </span>
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                storePhone={store.phone}
                cardStyle="detailed"
                showWhatsapp={showWhatsapp}
                primaryColor={primaryColor}
                onProductClick={onProductClick}
              />
            ))}
          </div>
        )}
      </section>

      <section id="about" className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.75fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">About</p>
            <h2 className="mt-2 font-display text-3xl font-black tracking-tight">{store.name}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">
              {store.description || `${store.name} sells selected products and receives orders through WhatsApp.`}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <MapPin className="h-4 w-4 text-zinc-500" />
              <p className="mt-2 text-sm font-bold text-zinc-950">{locationLabel}</p>
              {store.address && <p className="mt-1 text-xs leading-5 text-zinc-500">{store.address}</p>}
            </div>
            {store.phone && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <Phone className="h-4 w-4 text-zinc-500" />
                <p className="mt-2 text-sm font-bold text-zinc-950">{store.phone}</p>
                <div className="mt-3 flex gap-2">
                  <a href={`tel:${store.phone}`} className="inline-flex h-9 items-center rounded-md bg-white px-3 text-xs font-bold text-zinc-900 ring-1 ring-zinc-200">
                    Call
                  </a>
                  {showWhatsapp && cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center rounded-md px-3 text-xs font-bold text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
