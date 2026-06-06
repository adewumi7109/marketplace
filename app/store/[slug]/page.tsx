import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStoreBySlug, getProductsByStore } from "@/lib/api";
import { storeMetadata } from "@/lib/storefront";
import StorePageClient from "./StorePageClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const store = await getStoreBySlug(slug);
    return storeMetadata(store);
  } catch {
    return { title: "Store" };
  }
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  let store;
  let products;

  try {
    const storeResult = await getStoreBySlug(slug);
    const productResult = await getProductsByStore(slug, { limit: 100 }).catch(() => ({
      data: storeResult.products ?? [],
    }));

    store = { ...storeResult, template: "general_v1" };
    products = productResult.data;
  } catch {
    notFound();
  }

  return <StorePageClient store={store} products={products} />;
}
