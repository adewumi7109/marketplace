import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Package, BadgeCheck } from "lucide-react";
import type { Store } from "@/lib/types";

interface StoreCardProps {
  store: Store;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  fashion: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  food: "bg-green-500/10 text-green-400 border-green-500/20",
  electronics: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  church: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  sports: "bg-primary/100/10 text-orange-400 border-orange-500/20",
};

function getCategoryStyle(category: string) {
  const key = category.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
}

export default function StoreCard({ store, className = "" }: StoreCardProps) {
  return (
    <Link
      href={`/store/${store.slug}`}
      className={`group block rounded-2xl bg-surface-2 border border-border overflow-hidden hover:border-brand-500/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ${className}`}
    >
      {/* Banner */}
      <div className="relative h-36 bg-surface-3 overflow-hidden">
        {store.bannerUrl ? (
          <Image
            src={store.bannerUrl}
            alt={store.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-surface-3" />
        )}

        {/* Category badge */}
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryStyle(
            store.category
          )}`}
        >
          {store.category}
        </span>

        {/* Logo */}
        <div className="absolute -bottom-5 left-4">
          <div className="w-12 h-12 rounded-xl bg-surface border-2 border-surface-3 overflow-hidden shadow-lg">
            {store.logoUrl ? (
              <Image src={store.logoUrl} alt={store.name} width={48} height={48} className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white font-display font-bold text-lg">
                {store.name[0]}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pt-8 pb-5 px-4 space-y-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-display font-semibold text-white text-base leading-tight group-hover:text-primary transition-colors">
              {store.name}
            </h3>
            {store.isVerified && (
              <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
            )}
          </div>
          {store.description && (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{store.description}</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {store.location}
          </span>
          <div className="flex items-center gap-3">
            {store.rating && (
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                {store.rating.toFixed(1)}
              </span>
            )}
            {store.productCount !== undefined && (
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {store.productCount}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-1">
          <span className="text-xs font-medium text-primary group-hover:text-primary transition-colors">
            Visit Store →
          </span>
        </div>
      </div>
    </Link>
  );
}
