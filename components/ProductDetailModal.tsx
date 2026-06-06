"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { buildWhatsAppLink, formatPrice, getProduct, trackProductView, trackProductWhatsAppClick } from "@/lib/api";

interface ProductDetailModalProps {
  product: Product | null;
  storePhone: string;
  primaryColor?: string;
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  storePhone,
  primaryColor = "#2563eb",
  onClose,
}: ProductDetailModalProps) {
  const [detail, setDetail] = useState<Product | null>(product);
  const [isLoading, setIsLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    if (!product) return;

    let alive = true;
    setDetail(product);
    setActiveImage(0);
    setIsLoading(true);

    getProduct(product.id)
      .then((freshProduct) => {
        if (alive) setDetail(freshProduct);
      })
      .catch(() => {
        if (alive) setDetail(product);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [product]);

  useEffect(() => {
    if (!detail?.id) return;
    trackProductView(detail.id).catch(() => undefined);
  }, [detail?.id]);

  useEffect(() => {
    if (!product) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, product]);

  const images = useMemo(() => {
    const list = detail?.images?.length
      ? detail.images
      : detail?.imageUrl
      ? [detail.imageUrl]
      : [];

    return list.filter(Boolean);
  }, [detail]);

  if (!product || !detail) return null;

  const price = formatPrice(detail.price, detail.currency);
  const whatsappLink = buildWhatsAppLink(
    detail.store?.phone || storePhone,
    detail.name,
    detail.price,
    detail.currency,
    detail.whatsappOrderLink
  );

  const moveImage = (direction: 1 | -1) => {
    if (images.length < 2) return;
    setActiveImage((current) => (current + direction + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 sm:px-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Product details
            </p>
            {isLoading && <p className="text-xs text-zinc-400">Refreshing details...</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950"
            aria-label="Close product details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid max-h-[calc(92vh-58px)] overflow-y-auto md:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div
            className="relative aspect-square bg-zinc-50 md:min-h-[520px]"
            onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
            onTouchEnd={(event) => {
              if (touchStart === null) return;
              const end = event.changedTouches[0]?.clientX ?? touchStart;
              const delta = end - touchStart;
              if (Math.abs(delta) > 40) moveImage(delta < 0 ? 1 : -1);
              setTouchStart(null);
            }}
          >
            {images[activeImage] ? (
              <Image
                src={images[activeImage]}
                alt={detail.name}
                fill
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-contain p-4"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                No image available
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => moveImage(-1)}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow transition hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(1)}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow transition hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              {detail.category && (
                <span className="rounded-full bg-zinc-100 px-3 py-1">
                  {detail.category}
                </span>
              )}
              <span className="rounded-full bg-zinc-100 px-3 py-1">
                {detail.inStock === false ? "Out of stock" : "In stock"}
              </span>
              {detail.isNegotiable && (
                <span className="rounded-full bg-zinc-100 px-3 py-1">Negotiable</span>
              )}
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
              {detail.name}
            </h2>
            <p className="mt-3 text-2xl font-bold" style={{ color: primaryColor }}>
              {price}
            </p>

            {detail.description && (
              <p className="mt-5 text-sm leading-7 text-zinc-600">
                {detail.description}
              </p>
            )}

            <div className="mt-6 space-y-3 border-t border-zinc-200 pt-5 text-sm text-zinc-600">
              {detail.condition && (
                <div className="flex justify-between gap-4">
                  <span>Condition</span>
                  <strong className="font-medium text-zinc-900">{detail.condition}</strong>
                </div>
              )}
              {detail.store?.name && (
                <div className="flex justify-between gap-4">
                  <span>Store</span>
                  <strong className="font-medium text-zinc-900">{detail.store.name}</strong>
                </div>
              )}
            </div>

            {detail.inStock !== false && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackProductWhatsAppClick(detail.id).catch(() => undefined);
                }}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <MessageCircle className="h-4 w-4" />
                Order on WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
