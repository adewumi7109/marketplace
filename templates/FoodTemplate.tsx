import Image from "next/image";
import type { CSSProperties } from "react";
import {
  MapPin,
  Phone,
  Clock,
  BadgeCheck,
  ChefHat,
  ShoppingBag,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import type { Store, Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

interface TemplateProps {
  store: Store;
  products: Product[];
  onProductClick?: (product: Product) => void;
}

export default function FoodTemplate({ store, products, onProductClick }: TemplateProps) {
  // Pull config from templateData with sensible defaults
  const config = store.templateData?.config || {};
  const primaryColor =
    typeof config.primaryColor === "string" ? config.primaryColor : "#22c55e";
  const showCategories = config.showCategories !== false;
  const showWhatsapp = config.showWhatsappButton !== false;
  const showInStock = config.showInStockBadge !== false;
  const allowedCardStyles = ["compact", "detailed", "modern", "grid", "list"] as const;
  const cardStyle = allowedCardStyles.includes(
    config.productCardStyle as (typeof allowedCardStyles)[number]
  )
    ? (config.productCardStyle as (typeof allowedCardStyles)[number])
    : "compact";

  // Group products by category
  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    const key = p.category || "Menu";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const categories = Object.entries(grouped);
  const hasProducts = products.length > 0;

  // Dynamic color utilities
  const colorClass = primaryColor === "#22c55e" ? "emerald" : "custom";
  const isCustomColor = colorClass === "custom";

  return (
    <div
      className="min-h-screen bg-white text-zinc-950 antialiased selection:bg-emerald-200"
      style={
        {
          "--primary-color": primaryColor,
          "--loader-color": primaryColor,
        } as CSSProperties
      }
    >
      {/* ===== HERO ===== */}
      <div className="relative h-[300px] md:h-[380px] overflow-hidden">
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
              background: isCustomColor
                ? `linear-gradient(135deg, ${primaryColor}20 0%, #0a0a0a 100%)`
                : undefined,
              backgroundColor: !isCustomColor ? undefined : undefined,
            }}
          >
            {!isCustomColor && (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/70 via-[#0a0a0a]/80 to-[#0a0a0a]" />
            )}
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 px-4 sm:px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md"
              style={{
                backgroundColor: isCustomColor
                  ? `${primaryColor}15`
                  : "rgba(16, 185, 129, 0.15)",
                borderColor: isCustomColor
                  ? `${primaryColor}25`
                  : "rgba(16, 185, 129, 0.25)",
                color: isCustomColor ? primaryColor : "#34d399",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: primaryColor }}
              />
              Open Now
            </span>

            {showWhatsapp && store.phone && (
              <a
                href={`https://wa.me/${store.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ===== STORE IDENTITY ===== */}
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 -mt-14 z-10">
        <div className="flex items-end gap-4 mb-6">
          {/* Logo */}
          <div className="relative w-[72px] h-[72px] md:w-24 md:h-24 rounded-2xl bg-white border border-zinc-200 shadow-xl overflow-hidden shrink-0 ring-4 ring-white">
            {store.logoUrl ? (
              <Image
                src={store.logoUrl}
                alt={store.name}
                fill
                className="object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <ChefHat className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
            )}
          </div>

          {/* Name & Meta */}
          <div className="pb-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display font-bold text-2xl md:text-3xl text-zinc-950 tracking-tight truncate">
                {store.name}
              </h1>
              {store.isVerified && (
                <BadgeCheck
                  className="w-5 h-5 shrink-0"
                  style={{ color: primaryColor }}
                />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-zinc-400">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
              <span className="truncate">{store.location}</span>
            </div>
          </div>
        </div>

        {/* ===== INFO CARD ===== */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 sm:divide-x sm:divide-zinc-200">
           

            {/* Phone */}
            <a
              href={`tel:${store.phone}`}
              className="flex items-center gap-3 sm:px-6 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <span className="text-sm text-zinc-700 group-hover:text-zinc-950 transition-colors">
                {store.phone}
              </span>
            </a>

            {/* Delivery time */}
            <div className="flex items-center gap-3 sm:px-6">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <span className="text-sm text-zinc-600">30-45 min</span>
            </div>

            {/* Items count */}
            <div className="flex items-center gap-3 sm:pl-6">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <span className="text-sm text-zinc-600">
                {products.length} items
              </span>
            </div>
          </div>

          {/* Description */}
          {store.description && (
            <p className="mt-4 pt-4 border-t border-zinc-200 text-sm text-zinc-600 leading-relaxed">
              {store.description}
            </p>
          )}
        </div>

        {/* ===== CATEGORY NAV (Sticky) ===== */}
        {showCategories && categories.length > 1 && (
          <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-xl border-b border-zinc-200 mb-8">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {categories.map(([cat]) => (
                <a
                  key={cat}
                  href={`#${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  className="shrink-0 group flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-50 hover:bg-zinc-100 transition-all border border-zinc-200"
                >
                  {cat}
                  <ChevronRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== MENU SECTIONS ===== */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
        {!hasProducts ? (
          <div className="flex flex-col items-center justify-center py-28 text-zinc-600">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <ChefHat
                className="w-8 h-8"
                style={{ color: `${primaryColor}80` }}
              />
            </div>
            <p className="text-lg font-semibold text-zinc-500">
              Menu coming soon
            </p>
            <p className="text-sm text-zinc-600 mt-1">
              Check back later for delicious options
            </p>
          </div>
        ) : (
          <div className="space-y-14">
            {categories.map(([cat, items]) => (
              <section
                key={cat}
                id={cat.toLowerCase().replace(/\s+/g, "-")}
              >
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="font-display font-bold text-xl md:text-2xl text-zinc-950 tracking-tight shrink-0">
                    {cat}
                  </h2>
                  <div className="flex-1 h-px bg-zinc-200" />
                  <span className="shrink-0 text-xs font-medium text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200">
                    {items.length}{" "}
                    {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Product Grid/List based on cardStyle */}
                <div
                  className={
                    cardStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                      : "space-y-3"
                  }
                >
                  {items.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      storePhone={store.phone}
                      variant="food"
                      cardStyle={cardStyle}
                      showInStock={showInStock}
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

      {/* ===== FLOATING CTA ===== */}
      {showWhatsapp && store.phone && hasProducts && (
        <div className="fixed bottom-6 right-6 z-40">
          <a
            href={`https://wa.me/${store.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 pl-2 pr-4 py-2.5 rounded-full shadow-2xl shadow-black/50 text-white text-sm font-medium transition-all hover:scale-105 active:scale-95 border border-white/10"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            Order on WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
