import Image from "next/image";
import type { CSSProperties } from "react";
import {
  MapPin,
  Phone,
  Package,
  BadgeCheck,
  ShoppingBag,
  Clock,
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

export default function GeneralTemplate({ store, products, onProductClick }: TemplateProps) {
  const config = store.templateData?.config || {};
  const primaryColor =
    typeof config.primaryColor === "string" ? config.primaryColor : "#2563eb";
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
  const layout = config.layout || "grid";

  // Group by category
  const grouped = showCategories
    ? products.reduce<Record<string, Product[]>>((acc, p) => {
        const key = p.category || "All Products";
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
      }, {})
    : { "All Products": products };

  const categories = Object.entries(grouped);
  const hasProducts = products.length > 0;

  // Grid columns based on layout
  const gridCols =
    layout === "list"
      ? "grid-cols-1"
      : layout === "masonry"
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <div
      className="min-h-screen bg-white text-zinc-950 antialiased selection:bg-blue-200"
      style={
        {
          "--primary-color": primaryColor,
          "--loader-color": primaryColor,
        } as CSSProperties
      }
    >

      {/* ===== HERO ===== */}
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        {store.bannerUrl ? (
          <Image
            src={store.bannerUrl}
            alt={store.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}25 0%, #0c0c10 50%, #0c0c10 100%)`,
            }}
          />
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10] via-[#0c0c10]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-8">
          <div className="max-w-7xl mx-auto flex items-end gap-5 md:gap-6">
            {/* Logo */}
        <div className="relative w-[72px] h-[72px] md:w-24 md:h-24 rounded-2xl bg-white border border-zinc-200 overflow-hidden shrink-0 shadow-xl ring-4 ring-white">
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center font-display font-bold text-3xl md:text-4xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {store.name[0]}
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="min-w-0 pb-1">
              <div className="flex items-center gap-2 mb-1.5">
              <h1 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-white tracking-tight truncate drop-shadow-sm">
                  {store.name}
                </h1>
                {store.isVerified && (
                  <BadgeCheck
                    className="w-5 h-5 md:w-6 md:h-6 shrink-0"
                    style={{ color: primaryColor }}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  {store.location}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium border"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    borderColor: `${primaryColor}25`,
                    color: primaryColor,
                  }}
                >
                  {store.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== INFO CARD ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-2 mb-8">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            {/* Stats */}
            <div className="flex items-center gap-6 md:gap-8">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}12` }}
                >
                  <ShoppingBag
                    className="w-5 h-5"
                    style={{ color: primaryColor }}
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-zinc-950">{products.length}</p>
                  <p className="text-xs text-zinc-500">Products</p>
                </div>
              </div>

              <div className="w-px h-10 bg-zinc-200" />

              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}12` }}
                >
                  <Clock
                    className="w-5 h-5"
                    style={{ color: primaryColor }}
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-zinc-950">{categories.length}</p>
                  <p className="text-xs text-zinc-500">Categories</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 text-sm font-medium transition-all border border-zinc-200"
                >
                  <Phone className="w-4 h-4" />
                  Call Store
                </a>
              )}

              {showWhatsapp && store.phone && (
                <a
                  href={`https://wa.me/${store.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:scale-105 active:scale-95 border border-white/10"
                  style={{ backgroundColor: primaryColor }}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          {store.description && (
            <p className="mt-5 pt-5 border-t border-zinc-200 text-sm text-zinc-600 leading-relaxed">
              {store.description}
            </p>
          )}
        </div>
      </div>

      {/* ===== CATEGORY NAV ===== */}
      {showCategories && categories.length > 1 && (
        <div className="sticky top-14 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
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

      {/* ===== PRODUCTS ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-24">
        {!hasProducts ? (
          <div className="flex flex-col items-center justify-center py-28 border border-dashed border-zinc-300 bg-zinc-50 rounded-2xl">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: `${primaryColor}12` }}
            >
              <Package
                className="w-8 h-8"
                style={{ color: `${primaryColor}80` }}
              />
            </div>
            <p className="text-lg font-semibold text-zinc-500">
              No products listed yet
            </p>
                  <p className="text-sm text-zinc-500 mt-1">
              Check back soon for new items
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {categories.map(([cat, items]) => (
              <section
                key={cat}
                id={cat.toLowerCase().replace(/\s+/g, "-")}
              >
                {/* Section header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}12` }}
                    >
                      <Package
                        className="w-4 h-4"
                        style={{ color: primaryColor }}
                      />
                    </div>
                    <h2 className="font-display font-bold text-xl md:text-2xl text-zinc-950 tracking-tight">
                      {cat}
                    </h2>
                    <span className="text-xs font-medium text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-200">
                      {items.length}
                    </span>
                  </div>
                </div>

                {/* Product grid */}
                <div className={`grid ${gridCols} gap-4 md:gap-5`}>
                  {items.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      storePhone={store.phone}
                      variant="default"
                      cardStyle={cardStyle}
                      showBadges={showBadges}
                      showComparePrice={showComparePrice}
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
      </div>

    </div>
  );
}
