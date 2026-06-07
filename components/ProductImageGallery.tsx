"use client";

import Image from "next/image";
import { Box, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ProductImageGalleryProps {
  images: string[];
  name: string;
}

export default function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [active, setActive] = useState(0);
  const mainImage = images[active] || null;

  function move(direction: 1 | -1) {
    if (images.length < 2) return;
    setActive((current) => (current + direction + images.length) % images.length);
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={name}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-contain p-4"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-300">
            <Box className="h-16 w-16" />
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition hover:bg-white"
              aria-label="Previous product image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition hover:bg-white"
              aria-label="Next product image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {images.slice(0, 6).map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative aspect-square overflow-hidden rounded-md border bg-white ${
                active === index ? "border-primary ring-2 ring-primary/20" : "border-zinc-200"
              }`}
            >
              <Image src={image} alt={`${name} image ${index + 1}`} fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
