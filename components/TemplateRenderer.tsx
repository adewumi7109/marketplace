import type { Store, Product } from "@/lib/types";
import GeneralTemplate from "@/templates/GeneralTemplate";

interface TemplateRendererProps {
  store: Store;
  products: Product[];
  allProducts?: Product[];
  search?: string;
  selectedCategory?: string;
  onSearchChange?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
  onProductClick?: (product: Product) => void;
  onProductPrefetch?: (product: Product) => void;
}

export default function TemplateRenderer({
  store,
  products,
  allProducts,
  search = "",
  selectedCategory = "",
  onSearchChange,
  onCategoryChange,
  onProductClick,
  onProductPrefetch,
}: TemplateRendererProps) {
  return (
    <GeneralTemplate
      store={store}
      products={products}
      allProducts={allProducts}
      search={search}
      selectedCategory={selectedCategory}
      onSearchChange={onSearchChange}
      onCategoryChange={onCategoryChange}
      onProductClick={onProductClick}
      onProductPrefetch={onProductPrefetch}
    />
  );
}
