import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Eye,
  MapPin,
  Store,
  Tag,
  XCircle,
} from "lucide-react";
import { ProductViewTracker } from "@/components/ProductEngagement";
import ProductShareLinks from "@/components/ProductShareLinks";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductOrderButton from "@/components/ProductOrderButton";
import { formatPrice, formatProductCondition, getStoreProductBySlug } from "@/lib/api";
import { getSiteUrl } from "@/lib/storefront";
import { productCategorySegment } from "@/lib/productRoutes";

export const revalidate = 30;

const getProduct = cache(getStoreProductBySlug);

interface Props {
  params: Promise<{ storeSlug: string; category?: string; productSlug: string }>;
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

export async function generateMarketplaceProductMetadata({ params }: Props): Promise<Metadata> {
  const { storeSlug, productSlug } = await params;

  try {
    const product = await getProduct(storeSlug, productSlug);
    const canonical = `${getSiteUrl()}/products/${storeSlug}/${productCategorySegment(product)}/${product.slug || product.id}`;

    return {
      title: `${product.name} in Nigeria`,
      description: product.description || `View ${product.name} from ${product.store?.name || "a local store"}.`,
      alternates: { canonical },
      openGraph: {
        title: product.name,
        description: product.description || undefined,
        url: canonical,
        images: product.imageUrl || product.images?.[0] ? [product.imageUrl || product.images?.[0] || ""] : undefined,
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function MarketplaceProductPage({ params }: Props) {
  const { storeSlug, productSlug } = await params;
  const product = await getProduct(storeSlug, productSlug).catch(() => null);

  if (!product) notFound();

  const store = product.store;
  const images = imagesFor(product);
  const price = formatPrice(product.price, product.currency);
  const place = locationLabel(product);
  const canonical = `${getSiteUrl()}/products/${storeSlug}/${productCategorySegment(product)}/${product.slug || product.id}`;

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <ProductViewTracker productId={product.id} />

      <section className="border-b border-primary/15 bg-primary/5 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-white text-zinc-700 transition hover:text-primary"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
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
        <ProductImageGallery images={images} name={product.name} />

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
           {/* <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1">
              <Eye className="h-3.5 w-3.5 text-zinc-500" />
              {(product.viewCount ?? 0).toLocaleString()} views
            </span>*/}
            {product.condition && (
              <span className="rounded-full bg-zinc-100 px-3 py-1">
                {formatProductCondition(product.condition)}
              </span>
            )}
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
            <ProductOrderButton
              product={product}
              storePhone={store?.phone}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90"
            />
          )}

          <ProductShareLinks title={product.name} url={canonical} className="mt-6" />
        </aside>
      </main>
    </div>
  );
}
