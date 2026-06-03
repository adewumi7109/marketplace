import type { Store, Product, TemplateCode } from "@/lib/types";
import GeneralTemplate from "@/templates/GeneralTemplate";
import FashionTemplate from "@/templates/FashionTemplate";
import FoodTemplate from "@/templates/FoodTemplate";
import ElectronicsTemplate from "@/templates/ElectronicsTemplate";

interface TemplateRendererProps {
  store: Store;
  products: Product[];
  onProductClick?: (product: Product) => void;
}

/**
 * Routes a store's template code to the correct layout component.
 * Adding new templates: create a new file in /templates and add a case here.
 */
export default function TemplateRenderer({
  store,
  products,
  onProductClick,
}: TemplateRendererProps) {
  const template: TemplateCode = store.template || "general_v1";

  switch (template) {
    case "fashion_v1":
      return <FashionTemplate store={store} products={products} onProductClick={onProductClick} />;

    case "food_v1":
      return <FoodTemplate store={store} products={products} onProductClick={onProductClick} />;

    case "electronics_v1":
      return <ElectronicsTemplate store={store} products={products} onProductClick={onProductClick} />;

    case "church_v1":
    case "team_v1":
    case "sports_v1":
      return <GeneralTemplate store={store} products={products} onProductClick={onProductClick} />;

    case "general_v1":
    default:
      return <GeneralTemplate store={store} products={products} onProductClick={onProductClick} />;
  }
}
