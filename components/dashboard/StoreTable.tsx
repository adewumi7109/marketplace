"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Store } from "@/lib/types";
import { getStoreUrl } from "@/lib/storefront";
import DataTable, { type DataTableColumn } from "./DataTable";
import StatusBadge from "./StatusBadge";

type StoreTableProps = {
  stores: Store[];
  selectedSlug?: string;
  onSelect: (slug: string) => void;
};

export default function StoreTable({ stores, selectedSlug, onSelect }: StoreTableProps) {
  const columns: DataTableColumn<Store>[] = [
    {
      key: "store",
      header: "Store",
      render: (store) => (
        <button
          type="button"
          onClick={() => onSelect(store.slug)}
          className="text-left"
        >
          <span className="block font-semibold text-zinc-950">{store.name}</span>
          <span className="mt-1 block text-xs text-zinc-500">/{store.slug}</span>
          {selectedSlug === store.slug && (
            <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Selected
            </span>
          )}
        </button>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (store) => <span className="text-zinc-700">{store.category || "Store"}</span>,
    },
    {
      key: "products",
      header: "Products",
      render: (store) => <span className="font-semibold text-zinc-950">{store.productCount ?? 0}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (store) => <StatusBadge active={store.isActive !== false} />,
    },
    {
      key: "action",
      header: "",
      className: "text-right",
      render: (store) => (
        <Link
          href={getStoreUrl(store.slug)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 transition hover:border-primary/30 hover:text-primary"
        >
          Open
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={stores}
      emptyTitle="No stores yet"
      emptyDescription="Create your first store to start selling from this dashboard."
    />
  );
}
