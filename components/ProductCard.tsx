import Image from "next/image";
import { Percent, Box, Check, X, MapPin, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  storePhone: string;
  variant?: "default" | "fashion" | "food" | "electronics";
  className?: string;
  cardStyle?: "compact" | "detailed" | "modern" | "grid" | "list";
  showBadges?: boolean;
  showComparePrice?: boolean;
  showInStock?: boolean;
  showWhatsapp?: boolean;
  showLocation?: boolean;
  primaryColor?: string;
  onProductClick?: (product: Product) => void;
}

export default function ProductCard({
  product,
  storePhone,
  variant = "default",
  className = "",
  cardStyle = "detailed",
  showBadges = true,
  showComparePrice = true,
  showInStock = true,
  showWhatsapp = true,
  showLocation = true,
  primaryColor,
  onProductClick,
}: ProductCardProps) {
  const price = formatPrice(product.price, product.currency);

  const imageUrl = product.imageUrl || product.images?.[0] || null;

  const comparePrice = product.comparePrice
    ? formatPrice(product.comparePrice, product.currency)
    : null;

  const discount =
    showComparePrice &&
    product.comparePrice &&
    product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100
        )
      : null;

  const isList =
    cardStyle === "list" ||
    (variant === "food" && cardStyle !== "grid");
  const isCompact = cardStyle === "compact";

  const locationLabel = [product.location?.city, product.location?.state]
    .filter((part): part is string => Boolean(part))
    .join(", ");

  const openProduct = () => onProductClick?.(product);

  const OrderButton = ({ className = "" }: { className?: string }) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openProduct();
      }}
      className={`inline-flex items-center justify-center gap-1 rounded-md bg-primary font-semibold text-white transition hover:bg-primary/90 ${
        isCompact ? "px-2 py-1 text-[10px]" : "px-2 py-1.5 text-[11px] sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs"
      } ${className}`}
      style={primaryColor ? { backgroundColor: primaryColor } : undefined}
    >
      <ShoppingBag className={isCompact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      Order
    </button>
  );

  const Badges = () => {
    if (!showBadges || !discount) return null;

    return (
      <div className="absolute left-2 top-2 z-10">
        <span
          className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-white"
          style={primaryColor ? { backgroundColor: primaryColor } : undefined}
        >
          <Percent className="h-3 w-3" />
          {discount}% off
        </span>
      </div>
    );
  };

  const StockIndicator = () => {
    if (!showInStock) return null;

    if (product.inStock === false) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600">
          <X className="h-3 w-3" />
          Out of stock
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
        <Check className="h-3 w-3" />
        In stock
      </span>
    );
  };

  const imageBoxClass =
    variant === "fashion"
      ? "aspect-[3/4]"
      : isList
      ? "h-24 w-24 sm:h-28 sm:w-28"
      : isCompact
      ? "aspect-[4/3]"
      : "aspect-square";

  const imageFit =
    variant === "electronics"
      ? "object-contain p-4"
      : "object-cover";

  return (
    <article
      role={onProductClick ? "button" : undefined}
      tabIndex={onProductClick ? 0 : undefined}
      onClick={openProduct}
      onKeyDown={(e) => {
        if (
          onProductClick &&
          (e.key === "Enter" || e.key === " ")
        ) {
          e.preventDefault();
          openProduct();
        }
      }}
      className={`group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md ${
        isList ? "flex gap-4 p-3" : ""
      } ${onProductClick ? "cursor-pointer" : ""} ${className}`}
    >
      {/* IMAGE */}
      <div
        className={`relative shrink-0 overflow-hidden rounded-md bg-zinc-50 ${imageBoxClass}`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes={
              isList
                ? "112px"
                : "(min-width: 1024px) 25vw, 50vw"
            }
            className={`${imageFit} transition duration-500 group-hover:scale-105`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <Box className="h-10 w-10" />
          </div>
        )}

        <Badges />
      </div>

      {/* CONTENT */}
      <div
        className={`${
          isList
            ? "flex min-w-0 flex-1 flex-col justify-between py-1"
            : isCompact
            ? "p-2.5"
            : "p-3 sm:p-4"
        }`}
      >
        <div>
          <h3
            className={`line-clamp-2 font-semibold leading-snug text-zinc-950 ${
              isCompact ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm"
            }`}
          >
            {product.name}
          </h3>

          {product.description && !isCompact && (
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-500 sm:text-xs">
              {product.description}
            </p>
          )}

          {showLocation && locationLabel && (
            <p
              className={`mt-2 flex min-w-0 items-center gap-1 font-medium text-zinc-500 ${
                isCompact ? "text-[10px]" : "text-[11px] sm:text-xs"
              }`}
            >
              <MapPin
                className="h-3 w-3 shrink-0 text-primary"
                style={primaryColor ? { color: primaryColor } : undefined}
              />
              <span className="truncate">{locationLabel}</span>
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className={`${isCompact ? "mt-2" : "mt-3"} flex items-end justify-between gap-2 sm:gap-3`}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <span
                className={`${isCompact ? "text-[12px]" : "text-xs sm:text-sm"} font-bold text-primary`}
                style={primaryColor ? { color: primaryColor } : undefined}
              >
                {price}
              </span>

              {showComparePrice && comparePrice && (
                <span className="text-[11px] text-zinc-400 line-through sm:text-xs">
                  {comparePrice}
                </span>
              )}
            </div>

           
          </div>

          {showWhatsapp &&
            product.inStock !== false && <OrderButton />}
        </div>
      </div>
    </article>
  );
}
