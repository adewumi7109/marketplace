"use client";

import { useEffect } from "react";
import type { CSSProperties } from "react";
import { MessageCircle } from "lucide-react";
import { trackProductView, trackProductWhatsAppClick, trackStoreView } from "@/lib/api";

export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    trackProductView(productId).catch(() => undefined);
  }, [productId]);

  return null;
}

export function StoreViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackStoreView(slug).catch(() => undefined);
  }, [slug]);

  return null;
}

interface WhatsAppOrderButtonProps {
  productId: string;
  href: string;
  className?: string;
  style?: CSSProperties;
}

export function WhatsAppOrderButton({
  productId,
  href,
  className = "",
  style,
}: WhatsAppOrderButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        trackProductWhatsAppClick(productId).catch(() => undefined);
      }}
      className={className}
      style={style}
    >
      <MessageCircle className="h-4 w-4" />
      Order on WhatsApp
    </a>
  );
}
