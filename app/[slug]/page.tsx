import { titleFromSlug } from "@/lib/slug";
import CategoryProductsPage from "./CategoryProductsPage";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const title = `${titleFromSlug(slug)} products in Nigeria`;

  return {
    title,
    description: `Browse ${titleFromSlug(slug).toLowerCase()} products from Nigerian stores.`,
  };
}

export default function CategoryPage({ params }: Props) {
  return <CategoryProductsPage params={params} />;
}
