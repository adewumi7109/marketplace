import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  Tag,
  Eye,
  XCircle,
} from "lucide-react";
import { formatPrice, getStoreProductBySlug } from "@/lib/api";
import { ProductViewTracker } from "@/components/ProductEngagement";
import ProductShareLinks from "@/components/ProductShareLinks";
import ProductImageGallery from "@/components/ProductImageGallery";
import {
  absoluteUrl,
  getSiteUrl,
  getStorePrimaryColor,
  storeProductMetadata,
} from "@/lib/storefront";
import type { Store } from "@/lib/types";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; productSlug: string }>;
}

function productImages(product: Awaited<ReturnType<typeof getStoreProductBySlug>>) {
  const images = product.images?.length
    ? product.images
    : product.imageUrl
    ? [product.imageUrl]
    : [];

  return images.filter(Boolean);
}

function locationLabel(product: Awaited<ReturnType<typeof getStoreProductBySlug>>) {
  return [product.location?.city, product.location?.state, product.location?.country]
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

function productStore(product: Awaited<ReturnType<typeof getStoreProductBySlug>>): Store {
  return product.store as Store;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productSlug } = await params;

  try {
    const product = await getStoreProductBySlug(slug, productSlug);
    return storeProductMetadata(product, productStore(product));
  } catch {
    return { title: "Product" };
  }
}

export default async function StoreProductPage({ params }: Props) {
  const { slug, productSlug } = await params;
  const product = await getStoreProductBySlug(slug, productSlug).catch(() => null);

  if (!product) {
    notFound();
  }

  const store = productStore(product);
  const images = productImages(product);
  const mainImage = images[0] || null;
  const price = formatPrice(product.price, product.currency);
  const place = locationLabel(product);
  const primaryColor = getStorePrimaryColor(store);
  const canonical = `${getSiteUrl()}/store/${store.slug}/products/${product.slug || product.id}`;
  const imageForSeo = absoluteUrl(mainImage || store.logoUrl || store.logo);

  return (
    <main
      className="min-h-screen bg-[#f6f5f1] text-zinc-950"
      style={
        {
          "--primary-color": primaryColor,
          "--loader-color": primaryColor,
        } as CSSProperties
      }
    >
      <ProductViewTracker productId={product.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description || undefined,
            image: imageForSeo ? [imageForSeo] : undefined,
            brand: { "@type": "Brand", name: store.name },
            url: canonical,
            offers: {
              "@type": "Offer",
              priceCurrency: product.currency || "NGN",
              price: product.price,
              availability:
                product.inStock === false
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
              seller: { "@type": "Store", name: store.name },
            },
          }),
        }}
      />

      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href={`/store/${store.slug}`} className="flex min-w-0 items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-100 ring-1 ring-zinc-200">
              {store.logoUrl ? (
                <Image src={store.logoUrl} alt={store.name} fill sizes="40px" className="object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-sm font-black text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {store.name[0]}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black leading-tight">{store.name}</p>
            </div>
          </Link>

          <div className="ml-auto hidden items-center gap-7 text-sm font-semibold text-zinc-700 md:flex">
            <Link href={`/store/${store.slug}`} className="transition hover:text-zinc-950">Store</Link>
            <Link href={`/store/${store.slug}#products`} className="transition hover:text-zinc-950">Products</Link>
            <Link href={`/store/${store.slug}#about`} className="transition hover:text-zinc-950">About</Link>
          </div>
          <Link
            href={`/store/${store.slug}#products`}
            className="ml-auto inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 md:ml-0"
            style={{ backgroundColor: primaryColor }}
          >
            <ShoppingBag className="h-4 w-4" />
            Shop
          </Link>
        </div>
      </header>

      <section className="mx-auto px-4 pb-4 pt-5 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href={`/store/${store.slug}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {store.name}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <ProductImageGallery images={images} name={product.name} />

        <div className="lg:pt-4">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-600">
            {product.category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-zinc-200">
                <Tag className="h-3.5 w-3.5 text-primary" style={{ color: primaryColor }} />
                {product.category}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-zinc-200">
              {product.inStock === false ? (
                <XCircle className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              )}
              {product.inStock === false ? "Out of stock" : "In stock"}
            </span>
            {product.isNegotiable && (
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-zinc-200">
                Negotiable
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-zinc-200">
              <Eye className="h-3.5 w-3.5 text-zinc-500" />
              {(product.viewCount ?? 0).toLocaleString()} views
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-4xl">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-bold text-primary" style={{ color: primaryColor }}>{price}</p>

          {product.description && (
            <p className="mt-6 max-w-2xl whitespace-pre-line text-sm leading-7 text-zinc-600 sm:text-base">
              {product.description}
            </p>
          )}

          <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">
              Product information
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              {store.name && (
                <div className="flex justify-between gap-4 border-b border-zinc-100 pb-4">
                  <dt className="text-zinc-500">Store</dt>
                  <dd className="inline-flex items-center gap-1 text-right font-semibold text-zinc-950">
                    {store.name}
                    {store.isVerified && <BadgeCheck className="h-4 w-4" style={{ color: primaryColor }} />}
                  </dd>
                </div>
              )}
              {product.condition && (
                <div className="flex justify-between gap-4 border-b border-zinc-100 pb-4">
                  <dt className="text-zinc-500">Condition</dt>
                  <dd className="text-right font-semibold text-zinc-950">
                    {product.condition}
                  </dd>
                </div>
              )}
              {place && (
                <div className="flex justify-between gap-4">
                  <dt className="inline-flex items-center gap-1 text-zinc-500">
                    <MapPin className="h-4 w-4 text-primary" style={{ color: primaryColor }} />
                    Location
                  </dt>
                  <dd className="text-right font-semibold text-zinc-950">{place}</dd>
                </div>
              )}
            </dl>
          </div>

          {product.inStock !== false && (
            <button
              type="button"
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90"
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingBag className="h-4 w-4" />
              Order
            </button>
          )}

          <ProductShareLinks title={product.name} url={canonical} className="mt-6" />
        </div>
      </section>
    </main>
  );
}
