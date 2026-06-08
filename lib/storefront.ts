import type { Metadata } from "next";
import type { Product, Store } from "@/lib/types";
import { productCategorySegment } from "@/lib/productRoutes";

const DEFAULT_STORE_COLOR = "#035722";

function isHexColor(value?: string | null) {
  return Boolean(value && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value));
}

function compactStrings(values: Array<string | null | undefined>) {
  return values.filter((value): value is string => Boolean(value));
}

export function getStorePrimaryColor(store?: Pick<Store, "primaryColor" | "templateData" | "templateConfig"> | null) {
  const storeColor = store?.primaryColor;
  if (isHexColor(storeColor)) return storeColor as string;

  const storeConfigColor = store?.templateConfig?.primaryColor;
  if (typeof storeConfigColor === "string" && isHexColor(storeConfigColor)) return storeConfigColor;

  const configColor = store?.templateData?.config?.primaryColor;
  if (typeof configColor === "string" && isHexColor(configColor)) return configColor;

  return DEFAULT_STORE_COLOR;
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export function getRootDomain() {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kombomart.com";
}

export function getStoreUrl(storeSlug: string) {
  const siteUrl = getSiteUrl();
  const rootDomain = getRootDomain();

  try {
    const url = new URL(siteUrl);
    if (url.hostname === rootDomain || url.hostname.endsWith(`.${rootDomain}`)) {
      return `${url.protocol}//${storeSlug}.${rootDomain}`;
    }
  } catch {
    return `${siteUrl}/store/${storeSlug}`;
  }

  return `${siteUrl}/store/${storeSlug}`;
}

export function getStoreProductUrl(store: Store, product: Product) {
  return `${getStoreUrl(store.slug)}/products/${productCategorySegment(product)}/${product.slug || product.id}`;
}

export function absoluteUrl(path?: string | null) {
  if (!path) return undefined;

  try {
    return new URL(path).toString();
  } catch {
    if (path.startsWith("/uploads/")) {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/?$/, "").replace(/\/+$/, "");
      if (apiBase) return `${apiBase}${path}`;
    }

    return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  }
}

export function storeLocationLabel(store?: Store | null) {
  if (!store) return "";

  return (
    [store.locationData?.city || store.city, store.locationData?.state || store.state]
      .filter(Boolean)
      .join(", ") ||
    store.location ||
    store.country ||
    ""
  );
}

export function storeAddressLabel(store?: Store | null) {
  return store?.storeAddress?.trim() || store?.address?.trim() || "";
}

export function marketplaceStorePlaceLabel(store?: Store | null) {
  const address = storeAddressLabel(store);
  const location = storeLocationLabel(store);

  if (!address) return location;
  if (!location || address.toLowerCase().includes(location.toLowerCase())) return address;

  return `${address} - ${location}`;
}

export function storeMetadata(store: Store): Metadata {
  const title = `${store.name} | Online Store`;
  const location = storeLocationLabel(store);
  const description =
    store.description ||
    `Shop products from ${store.name}${location ? ` in ${location}` : ""}.`;
  const logo = absoluteUrl(store.logoUrl || store.logo);
  const banner = absoluteUrl(store.bannerUrl || store.banner || store.logoUrl || store.logo);
  const canonical = getStoreUrl(store.slug);

  return {
    title,
    description,
    keywords: compactStrings([store.name, store.category, location, "online store", "local store"]),
    alternates: { canonical },
    icons: logo
      ? {
          icon: logo,
          shortcut: logo,
          apple: logo,
        }
      : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: store.name,
      images: banner ? [{ url: banner, alt: store.name }] : undefined,
      type: "website",
    },
    twitter: {
      card: banner ? "summary_large_image" : "summary",
      title,
      description,
      images: banner ? [banner] : undefined,
    },
  };
}

export function storeProductMetadata(product: Product, store: Store): Metadata {
  const title = `${product.name} | ${store.name}`;
  const location = storeLocationLabel(store);
  const image = absoluteUrl(product.imageUrl || product.images?.[0] || store.logoUrl || store.logo);
  const logo = absoluteUrl(store.logoUrl || store.logo);
  const canonical = getStoreProductUrl(store, product);
  const description =
    product.description ||
    `View ${product.name} from ${store.name}${location ? ` in ${location}` : ""}.`;

  return {
    title,
    description,
    keywords: compactStrings([product.name, product.category, store.name, location, "online shopping"]),
    alternates: { canonical },
    icons: logo
      ? {
          icon: logo,
          shortcut: logo,
          apple: logo,
        }
      : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: store.name,
      images: image ? [{ url: image, alt: product.name }] : undefined,
      type: "website",
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
