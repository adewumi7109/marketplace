import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  BadgeCheck,
  Box,
  CheckCircle2,
  Eye,
  MapPin,
  ShoppingBag,
  Store,
  Tag,
  XCircle,
} from "lucide-react";
import { ProductViewTracker } from "@/components/ProductEngagement";
import ProductShareLinks from "@/components/ProductShareLinks";
import { formatPrice, getStoreProductBySlug } from "@/lib/api";
import { getSiteUrl } from "@/lib/storefront";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ storeSlug: string; productSlug: string }>;
}

function imagesFor(product: Awaited<ReturnType<typeof getStoreProductBySlug>>) {
  const images = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
  return images.filter(Boolean);
}

function locationLabel(product: Awaited<ReturnType<typeof getStoreProductBySlug>>) {
  return [product.location?.city, product.location?.state, product.location?.country]
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeSlug, productSlug } = await params;

  try {
    const product = await getStoreProductBySlug(storeSlug, productSlug);
    return {
      title: `${product.name} in Nigeria`,
      description: product.description || `View ${product.name} from ${product.store?.name || "a local store"}.`,
      openGraph: {
        title: product.name,
        description: product.description || undefined,
        images: product.imageUrl || product.images?.[0] ? [product.imageUrl || product.images?.[0] || ""] : undefined,
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function MarketplaceProductPage({ params }: Props) {
  const { storeSlug, productSlug } = await params;
  const product = await getStoreProductBySlug(storeSlug, productSlug).catch(() => null);

  if (!product) notFound();

  const store = product.store;
  const images = imagesFor(product);
  const mainImage = images[0] || null;
  const price = formatPrice(product.price, product.currency);
  const place = locationLabel(product);
  const canonical = `${getSiteUrl()}/products/${storeSlug}/${product.slug || product.id}`;

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <ProductViewTracker productId={product.id} />

      <section className="border-b border-primary/15 bg-primary/5 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to marketplace
          </Link>
          {store && (
            <Link
              href={`/store/${store.slug}`}
              className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-700 transition hover:text-primary"
            >
              <Store className="h-4 w-4 shrink-0" />
              <span className="truncate">{store.name}</span>
              {store.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
            </Link>
          )}
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:py-12">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-primary/15 bg-zinc-50">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-contain p-4"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-300">
                <Box className="h-16 w-16" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {images.slice(0, 6).map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-white">
                  <Image src={image} alt={`${product.name} ${index + 1}`} fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:pt-2">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-600">
            {product.category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary">
                <Tag className="h-3.5 w-3.5" />
                {product.category}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1">
              {product.inStock === false ? <XCircle className="h-3.5 w-3.5 text-red-500" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
              {product.inStock === false ? "Out of stock" : "In stock"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1">
              <Eye className="h-3.5 w-3.5 text-zinc-500" />
              {(product.viewCount ?? 0).toLocaleString()} views
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-primary">{price}</p>

          {place && (
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-600">
              <MapPin className="h-4 w-4 text-primary" />
              {place}
            </p>
          )}

          {product.description && (
            <p className="mt-6 whitespace-pre-line text-sm leading-7 text-zinc-600">{product.description}</p>
          )}

          {store && (
            <div className="mt-7 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Seller</p>
              <Link href={`/store/${store.slug}`} className="mt-2 inline-flex items-center gap-2 font-bold text-zinc-950 transition hover:text-primary">
                <Store className="h-4 w-4" />
                {store.name}
              </Link>
            </div>
          )}

          {product.inStock !== false && (
            <button
              type="button"
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90"
            >
              <ShoppingBag className="h-4 w-4" />
              Order
            </button>
          )}

          <ProductShareLinks title={product.name} url={canonical} className="mt-6" />
        </aside>
      </main>
    </div>
  );
}
