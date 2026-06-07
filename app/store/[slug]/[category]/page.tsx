import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductsByStore, getStoreBySlug } from "@/lib/api";
import { storeMetadata } from "@/lib/storefront";
import StorePageClient from "../StorePageClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; category: string }>;
}

function titleFromSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() || ""}${part.slice(1)}`)
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, category } = await params;

  try {
    const store = await getStoreBySlug(slug);
    const base = storeMetadata(store);
    const categoryTitle = titleFromSlug(category);
    return {
      ...base,
      title: `${categoryTitle} | ${store.name}`,
      description: `Shop ${categoryTitle.toLowerCase()} products from ${store.name}.`,
    };
  } catch {
    return { title: "Store category" };
  }
}

export default async function StoreCategoryPage({ params }: Props) {
  const { slug, category } = await params;

  try {
    const storeResult = await getStoreBySlug(slug);
    const productResult = await getProductsByStore(slug, { limit: 100 }).catch(() => ({
      data: storeResult.products ?? [],
    }));

    return (
      <StorePageClient
        store={{ ...storeResult, template: "general_v1" }}
        products={productResult.data}
        initialCategory={category}
      />
    );
  } catch {
    notFound();
  }
}
