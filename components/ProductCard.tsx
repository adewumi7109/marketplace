import Image from "next/image";
import { MessageCircle, Percent, Box, Check, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { buildWhatsAppLink, formatPrice } from "@/lib/api";

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
  onProductClick,
}: ProductCardProps) {
  const waLink = buildWhatsAppLink(
    storePhone,
    product.name,
    product.price,
    product.currency,
    product.whatsappOrderLink
  );

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

  const openProduct = () => onProductClick?.(product);

  const WhatsAppButton = ({ className = "" }: { className?: string }) => (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 ${className}`}
    >
      <MessageCircle className="h-3.5 w-3.5" />
      Order
    </a>
  );

  const Badges = () => {
    if (!showBadges || !discount) return null;

    return (
      <div className="absolute left-2 top-2 z-10">
        <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-white">
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
            : "p-4"
        }`}
      >
        <div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-950">
            {product.name}
          </h3>

          {product.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">
              {product.description}
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-bold text-primary">
                {price}
              </span>

              {showComparePrice && comparePrice && (
                <span className="text-xs text-zinc-400 line-through">
                  {comparePrice}
                </span>
              )}
            </div>

           
          </div>

          {showWhatsapp &&
            product.inStock !== false && <WhatsAppButton />}
        </div>
      </div>
    </article>
  );
}
