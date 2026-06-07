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
  return `/products/${product.store.slug}/${productCategorySegment(product)}/${product.slug}`;
}

export function storeProductPath(storeSlug: string, product: Product) {
  if (!storeSlug || !(product.slug || product.id)) return "";
  return `/store/${storeSlug}/products/${productCategorySegment(product)}/${product.slug || product.id}`;
}
