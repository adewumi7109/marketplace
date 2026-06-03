import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStoreBySlug, getProductsByStore, getTemplates } from "@/lib/api";
import type { Store, Template } from "@/lib/types";
import StorePageClient from "./StorePageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

function applyTemplateFromCatalog(store: Store, templates: Template[]) {
  if (!store.templateId || store.templateData) return store;

  const template = templates.find((item) => item.id === store.templateId);
  if (!template) return store;

  return {
    ...store,
    template: template.code,
    templateData: template,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const store = await getStoreBySlug(slug);

    return {
      title: store.name,
      description: store.description || `Shop at ${store.name}`,
      keywords: [store.name, store.category, "shop", "products"],
      openGraph: {
        title: store.name,
        description: store.description || undefined,
        images: store.bannerUrl ? [store.bannerUrl] : undefined,
      },
    };
  } catch {
    return { title: "Store" };
  }
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  let store;
  let products;

  try {
    const [storeResult, productResult, templates] = await Promise.all([
      getStoreBySlug(slug),
      getProductsByStore(slug, { limit: 100 }),
      getTemplates().catch(() => []),
    ]);
    store = applyTemplateFromCatalog(storeResult, templates);
    products = productResult.data;
  } catch {
    notFound();
  }

  return <StorePageClient store={store} products={products} />;
}
