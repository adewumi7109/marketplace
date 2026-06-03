import Image from "next/image";
import type { CSSProperties } from "react";
import {
  MapPin,
  Phone,
  BadgeCheck,
  Sparkles,
  Heart,
  Eye,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import type { Store, Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

interface TemplateProps {
  store: Store;
  products: Product[];
  onProductClick?: (product: Product) => void;
}

export default function FashionTemplate({ store, products, onProductClick }: TemplateProps) {
  const config = store.templateData?.config || {};
  const primaryColor =
    typeof config.primaryColor === "string" ? config.primaryColor : "#ff6600";
  const showCategories = config.showCategories !== false;
  const showWhatsapp = config.showWhatsappButton !== false;
  const allowedCardStyles = ["compact", "detailed", "modern", "grid", "list"] as const;
  const cardStyle = allowedCardStyles.includes(
    config.productCardStyle as (typeof allowedCardStyles)[number]
  )
    ? (config.productCardStyle as (typeof allowedCardStyles)[number])
    : "modern";
  const columns = config.columns || 3;

  // Group by category
  const grouped = showCategories
    ? products.reduce<Record<string, Product[]>>((acc, p) => {
        const key = p.category || "Collection";
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
      }, {})
    : { Collection: products };

  const categories = Object.entries(grouped);
  const hasProducts = products.length > 0;

  // Determine if default orange or custom
  const isOrange = primaryColor === "#ff6600" || primaryColor.toLowerCase().includes("f60");
  const accentColor = isOrange ? "#ff6600" : primaryColor;

  // Grid columns class based on config
  const gridCols =
    columns === 2
      ? "grid-cols-2"
      : columns === 4
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-2 md:grid-cols-3";

  return (
    <div
      className="min-h-screen bg-white text-zinc-950 antialiased selection:bg-orange-100"
      style={
        {
          "--primary-color": accentColor,
          "--loader-color": accentColor,
        } as CSSProperties
      }
    >
      {/* ===== HERO ===== */}
      <section className="relative h-[420px] overflow-hidden md:h-[500px]">
        {/* Background */}
        <div className="absolute inset-0">
          {store.bannerUrl ? (
            <Image
              src={store.bannerUrl}
              alt={store.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${accentColor}14 0%, #fff7ed 45%, #ffffff 100%)`,
              }}
            />
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative flex h-full flex-col justify-end px-6 pb-12 md:px-12 md:pb-16">
          <div className="max-w-6xl mx-auto w-full">
            {/* Category pill */}
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-md"
              style={{
                backgroundColor: "rgba(255,255,255,0.88)",
                borderColor: `${accentColor}35`,
                color: accentColor,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Fashion
            </div>

            {/* Brand name */}
            <h1 className="font-display mb-4 max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl">
              {store.name}
            </h1>

            {/* Description */}
            {store.description && (
              <p className="mb-7 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
                {store.description}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <span className="inline-flex items-center gap-2 text-white/85">
                <MapPin
                  className="w-4 h-4"
                  style={{ color: accentColor }}
                />
                {store.location}
              </span>

              {store.isVerified && (
                <span
                  className="inline-flex items-center gap-2"
                  style={{ color: accentColor }}
                >
                  <BadgeCheck className="w-4 h-4" />
                  Verified Store
                </span>
              )}

              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="group inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-300"
                >
                  <Phone
                    className="w-4 h-4 transition-colors"
                    style={{ color: accentColor }}
                  />
                  <span className="border-b border-transparent group-hover:border-current transition-all">
                    {store.phone}
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-zinc-400">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <div className="h-6 w-px bg-gradient-to-b from-zinc-400 to-transparent" />
        </div>
      </section>

      {/* ===== INFO STRIP ===== */}
      <section className="border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Description */}
            {store.description && (
              <div className="max-w-2xl">
                <p className="text-base leading-relaxed text-zinc-600 md:text-lg">
                  {store.description}
                </p>
              </div>
            )}

            {/* Quick actions */}
            <div className="flex items-center gap-3 shrink-0">
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 hover:text-zinc-950 text-sm transition-all duration-300"
                >
                  <Phone
                    className="w-4 h-4 transition-colors"
                    style={{ color: accentColor }}
                  />
                  Contact
                </a>
              )}

              {showWhatsapp && store.phone && (
                <a
                  href={`https://wa.me/${store.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: accentColor }}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORY NAV (Sticky) ===== */}
      {showCategories && categories.length > 1 && (
        <div className="sticky top-14 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
              {categories.map(([cat]) => (
                <a
                  key={cat}
                  href={`#${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  className="shrink-0 group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-950 bg-transparent hover:bg-zinc-100 transition-all border border-transparent hover:border-zinc-200"
                >
                  {cat}
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== COLLECTIONS ===== */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
        {!hasProducts ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 py-28">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: `${accentColor}12` }}
            >
              <Eye
                className="w-8 h-8"
                style={{ color: `${accentColor}80` }}
              />
            </div>
            <p className="text-lg font-light text-zinc-500">
              No pieces available yet
            </p>
            <p className="text-sm text-zinc-600 mt-2">
              Check back soon for new arrivals
            </p>
          </div>
        ) : (
          <div className="space-y-20">
            {categories.map(([cat, items]) => (
              <section
                key={cat}
                id={cat.toLowerCase().replace(/\s+/g, "-")}
              >
                {/* Section header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 md:mb-12">
                  <div>
                    <span
                      className="text-xs font-semibold tracking-widest uppercase mb-3 block"
                      style={{ color: accentColor }}
                    >
                      Curated Selection
                    </span>
                    <h2 className="font-display font-bold text-3xl md:text-4xl text-zinc-950 tracking-tight">
                      {cat}
                    </h2>
                  </div>
                  <span className="text-zinc-500 text-sm font-light shrink-0">
                    {items.length} {items.length === 1 ? "piece" : "pieces"}
                  </span>
                </div>

                {/* Product grid */}
                <div className={`grid ${gridCols} gap-5 md:gap-6`}>
                  {items.map((p, index) => (
                    <div
                      key={p.id}
                      className="group"
                      style={{
                        animationDelay: `${index * 75}ms`,
                      }}
                    >
                      <ProductCard
                        product={p}
                        storePhone={store.phone}
                        variant="fashion"
                        cardStyle={cardStyle}
                        primaryColor={accentColor}
                        showWhatsapp={showWhatsapp}
                        showInStock={false}
                        onProductClick={onProductClick}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">
            © {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-600">
            <span className="inline-flex items-center gap-1.5">
              <Heart
                className="w-3.5 h-3.5"
                style={{ color: `${accentColor}80` }}
              />
              Crafted with care
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
