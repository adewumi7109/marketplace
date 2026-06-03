import { titleFromSlug } from "@/lib/slug";
import LocationCategoryProductsPage from "./LocationCategoryProductsPage";

interface Props {
  params: Promise<{ slug: string; category: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug, category } = await params;
  const place = titleFromSlug(slug);
  const categoryName = titleFromSlug(category);

  return {
    title: `${categoryName} in ${place}`,
    description: `Browse ${categoryName.toLowerCase()} products in ${place}, Nigeria.`,
  };
}

export default function Page({ params }: Props) {
  return <LocationCategoryProductsPage params={params} />;
}
