"use client";

import { Pencil, Trash2 } from "lucide-react";
import { deleteProduct, formatPrice } from "@/lib/api";
import { useProducts } from "@/lib/hooks";
import type { Product } from "@/lib/types";
import DataTable, { type DataTableColumn } from "./DataTable";
import StatusBadge from "./StatusBadge";

type ProductTableProps = {
  storeSlug?: string;
  onChanged?: () => void;
  onError?: (message: string) => void;
};

export default function ProductTable({ storeSlug, onChanged, onError }: ProductTableProps) {
  const { products, isLoading, mutate } = useProducts(storeSlug, storeSlug ? { limit: 8 } : undefined);

  async function removeProduct(product: Product) {
    try {
      await deleteProduct(product.id);
      await mutate();
      onChanged?.();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Unable to delete product.");
    }
  }

  const columns: DataTableColumn<Product>[] = [
    {
      key: "product",
      header: "Product",
      render: (product) => (
        <div>
          <span className="block font-semibold text-zinc-950">{product.name}</span>
          <span className="mt-1 line-clamp-1 block max-w-xs text-xs text-zinc-500">
            {product.description || "No description yet"}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (product) => <span className="text-zinc-700">{product.category || "Uncategorized"}</span>,
    },
    {
      key: "price",
      header: "Price",
      render: (product) => (
        <span className="font-semibold text-zinc-950">
          {formatPrice(product.price, product.currency)}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (product) => (
        <StatusBadge
          active={product.inStock !== false && product.isActive !== false}
          label={product.inStock === false ? "Out" : product.isActive === false ? "Draft" : "Live"}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (product) => (
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:border-primary/30 hover:text-primary"
            aria-label={`Edit ${product.name}`}
            title="Edit product"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => removeProduct(product)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:border-red-200 hover:text-red-600"
            aria-label={`Delete ${product.name}`}
            title="Delete product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={storeSlug ? products : []}
      isLoading={!!storeSlug && isLoading}
      emptyTitle={storeSlug ? "No products in this store" : "Select a store"}
      emptyDescription={
        storeSlug
          ? "Add a product with the form below and it will appear here."
          : "Choose a store from the sidebar to view its products."
      }
    />
  );
}
