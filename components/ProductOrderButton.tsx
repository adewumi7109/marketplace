"use client";

import { ShoppingBag } from "lucide-react";
import { buildWhatsAppLink, trackProductWhatsAppClick } from "@/lib/api";
import type { Product } from "@/lib/types";

interface ProductOrderButtonProps {
  product: Product;
  storePhone?: string;
  primaryColor?: string;
  className?: string;
  iconClassName?: string;
  label?: string;
}

export default function ProductOrderButton({
  product,
  storePhone,
  primaryColor,
  className = "",
  iconClassName = "h-4 w-4",
  label = "Order",
}: ProductOrderButtonProps) {
  const phone = storePhone || product.store?.phone || "";
  const href = phone
    ? buildWhatsAppLink(
        phone,
        product.name,
        product.price,
        product.currency,
        product.whatsappOrderLink
      )
    : "";

  return (
    <a
      href={href || undefined}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        event.stopPropagation();
        if (!href) {
          event.preventDefault();
          return;
        }
        trackProductWhatsAppClick(product.id).catch(() => undefined);
      }}
      aria-disabled={!href}
      className={className}
      style={primaryColor ? { backgroundColor: primaryColor } : undefined}
    >
      <ShoppingBag className={iconClassName} />
      {label}
    </a>
  );
}
