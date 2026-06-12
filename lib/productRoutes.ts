import type { Product } from "@/lib/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productCategorySegment(product: Product) {
  return (
    product.productCategory?.slug ||
    product.marketplaceCategory?.slug ||
    slugify(product.productCategory?.name || product.category || product.marketplaceCategory?.name || "product")
  );
}

export function marketplaceProductPath(product: Product) {
  if (!product.store?.slug || !product.slug) return "";
  return `/product/${productCategorySegment(product)}/${product.slug}`;
}

export function isCurrentStoreSubdomain(storeSlug: string) {
  if (typeof window === "undefined" || !storeSlug) return false;

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kombomart.com";
  const hostname = window.location.hostname.toLowerCase();
  const slug = storeSlug.toLowerCase();

  return (
    hostname === `${slug}.${rootDomain}` ||
    hostname === `www.${slug}.${rootDomain}`
  );
}

export function storeHomePath(storeSlug: string) {
  if (!storeSlug) return "";
  return isCurrentStoreSubdomain(storeSlug) ? "/" : `/store/${storeSlug}`;
}

export function storeProductPath(storeSlug: string, product: Product) {
  if (!(product.slug || product.id)) return "";
  const productPath = `/store/product${productCategorySegment(product)}/${product.slug || product.id}`;
  return isCurrentStoreSubdomain(storeSlug) ? productPath : `/store/${storeSlug}${productPath}`;
}
