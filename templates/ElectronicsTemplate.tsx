import Image from "next/image";
import type { CSSProperties } from "react";
import {
  BadgeCheck,
  ChevronRight,
  MapPin,
  MessageCircle,
  Phone,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from "lucide-react";
import type { Store, Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

interface TemplateProps {
  store: Store;
  products: Product[];
  onProductClick?: (product: Product) => void;
}

export default function ElectronicsTemplate({
  store,
  products,
  onProductClick,
}: TemplateProps) {
  const config = store.templateData?.config || {};
  const primaryColor =
    typeof config.primaryColor === "string" ? config.primaryColor : "#0066ff";
  const showCategories = config.showCategories !== false;
  const showBadges = config.showBadges !== false;
  const showComparePrice = config.showComparePrice !== false;
  const showWhatsapp = config.showWhatsappButton !== false;
  const allowedCardStyles = ["compact", "detailed", "modern", "grid", "list"] as const;
  const cardStyle = allowedCardStyles.includes(
    config.productCardStyle as (typeof allowedCardStyles)[number]
  )
    ? (config.productCardStyle as (typeof allowedCardStyles)[number])
    : "detailed";

  const grouped = showCategories
    ? products.reduce<Record<string, Product[]>>((acc, product) => {
        const key = product.category || "Products";
        if (!acc[key]) acc[key] = [];
        acc[key].push(product);
        return acc;
      }, {})
    : { Products: products };

  const categories = Object.entries(grouped);
  const hasProducts = products.length > 0;
  const whatsappLink = store.phone
    ? `https://wa.me/${store.phone.replace(/\D/g, "")}`
    : "#";

  return (
    <div
      className="min-h-screen bg-white text-zinc-950 antialiased selection:bg-blue-100"
      style={
        {
          "--primary-color": primaryColor,
          "--loader-color": primaryColor,
        } as CSSProperties
      }
    >
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                {store.logoUrl ? (
                  <Image
                    src={store.logoUrl}
                    alt={store.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Zap className="h-5 w-5" style={{ color: primaryColor }} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="truncate text-base font-bold tracking-tight text-zinc-950 sm:text-lg">
                    {store.name}
                  </h1>
                  {store.isVerified && (
                    <BadgeCheck
                      className="h-4 w-4 shrink-0"
                      style={{ color: primaryColor }}
                    />
                  )}
                </div>
                {store.location && (
                  <p className="flex items-center gap-1 truncate text-xs text-zinc-500">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {store.location}
                  </p>
                )}
              </div>
            </div>

            {showWhatsapp && store.phone && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-white transition hover:opacity-90 sm:px-4"
                style={{ backgroundColor: primaryColor }}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-zinc-200 bg-zinc-50">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_380px] md:items-center md:py-14 lg:py-16">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                Electronics catalog
              </div>

              <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
                {store.name}
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
                {store.description ||
                  "Browse available phones, gadgets, accessories, and devices, then message directly on WhatsApp to confirm details and place an order."}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                {showWhatsapp && store.phone && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat to order
                  </a>
                )}
                {store.phone && (
                  <a
                    href={`tel:${store.phone}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    <Phone className="h-4 w-4" />
                    Call store
                  </a>
                )}
              </div>

              
            </div>

            <div className="relative hidden min-h-[340px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:block">
              {store.bannerUrl ? (
                <Image
                  src={store.bannerUrl}
                  alt={store.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full min-h-[340px] items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
                  <Zap className="h-20 w-20" style={{ color: `${primaryColor}90` }} />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/85 to-transparent p-5">
                <div className="rounded-lg border border-zinc-200 bg-white/90 p-4 backdrop-blur">
                  <p className="text-sm font-semibold text-zinc-950">
                   Advertisement Section
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    Advertise Heare
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {showCategories && categories.length > 1 && (
          <section className="sticky top-16 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <span className="hidden shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:flex">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Categories
                </span>
                {categories.map(([category, items]) => (
                  <a
                    key={category}
                    href={`#${category.toLowerCase().replace(/\s+/g, "-")}`}
                    className="group inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-white"
                  >
                    {category}
                    <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] text-zinc-500">
                      {items.length}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-400 transition group-hover:translate-x-0.5" />
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          {!hasProducts ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-24 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-sm">
                <Zap className="h-8 w-8" style={{ color: `${primaryColor}90` }} />
              </div>
              <p className="text-lg font-semibold text-zinc-800">
                No products available
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Check back soon for updated electronics listings.
              </p>
            </div>
          ) : (
            <div className="space-y-14">
              {categories.map(([category, items]) => (
                <section
                  key={category}
                  id={category.toLowerCase().replace(/\s+/g, "-")}
                >
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-4">
                    <div>
                      <h3 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
                        {category}
                      </h3>
                     
                    </div>
                  
                  </div>

                  <div
                    className={
                      cardStyle === "list"
                        ? "space-y-4"
                        : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
                    }
                  >
                    {items.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        storePhone={store.phone}
                        variant="electronics"
                        cardStyle={cardStyle}
                        showBadges={showBadges}
                        showComparePrice={showComparePrice}
                        showInStock={false}
                        showWhatsapp={showWhatsapp}
                        primaryColor={primaryColor}
                        onProductClick={onProductClick}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </main>

      {showWhatsapp && store.phone && hasProducts && (
        <div className="fixed bottom-5 right-5 z-50">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            <MessageCircle className="h-4 w-4" />
            Order on WhatsApp
          </a>
        </div>
      )}

      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-zinc-500 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="font-medium text-zinc-700">{store.name}</p>
          <div className="flex flex-wrap items-center gap-4">
            {store.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {store.location}
              </span>
            )}
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="inline-flex items-center gap-1.5 transition hover:text-zinc-900"
              >
                <Phone className="h-3.5 w-3.5" />
                {store.phone}
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
