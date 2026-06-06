import type { Store, Product } from "@/lib/types";
import GeneralTemplate from "@/templates/GeneralTemplate";

interface TemplateRendererProps {
  store: Store;
  products: Product[];
  search?: string;
  onSearchChange?: (value: string) => void;
  onProductClick?: (product: Product) => void;
}

export default function TemplateRenderer({
  store,
  products,
  search = "",
  onSearchChange,
  onProductClick,
}: TemplateRendererProps) {
  return (
    <GeneralTemplate
      store={store}
      products={products}
      search={search}
      onSearchChange={onSearchChange}
      onProductClick={onProductClick}
    />
  );
}
