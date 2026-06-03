import { titleFromSlug } from "@/lib/slug";
import LocationSearchPage from "./LocationSearchPage";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const place = titleFromSlug(slug);

  return {
    title: `Search products in ${place}`,
    description: `Find products for sale in ${place}, Nigeria.`,
  };
}

export default function SearchPage({ params }: Props) {
  return <LocationSearchPage params={params} />;
}
