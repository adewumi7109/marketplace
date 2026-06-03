"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Package, Plus, Store as StoreIcon } from "lucide-react";
import type { Store, UserProfile } from "@/lib/types";

type SellerSidebarProps = {
  user?: UserProfile;
  stores: Store[];
  selectedSlug?: string;
  onSelectStore: (slug: string) => void;
  onLogout: () => void;
};

export default function SellerSidebar({
  user,
  stores,
  selectedSlug,
  onSelectStore,
  onLogout,
}: SellerSidebarProps) {
  return (
    <aside className="flex min-h-screen flex-col border-r border-zinc-200 bg-white lg:sticky lg:top-0">
      <div className="border-b border-zinc-200 px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
            <StoreIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-lg font-bold tracking-tight">Seller Desk</span>
            <span className="block text-xs text-zinc-500">MarktPlace</span>
          </span>
        </Link>
      </div>

      <nav className="space-y-1 px-3 py-4">
        <a className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary">
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </a>
        <a href="#stores" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950">
          <StoreIcon className="h-4 w-4" />
          Stores
        </a>
        <a href="#products" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950">
          <Package className="h-4 w-4" />
          Products
        </a>
      </nav>

      <div className="flex-1 px-3 pb-4">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Your stores</p>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-zinc-800 ring-1 ring-zinc-200">
              {stores.length}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {stores.slice(0, 6).map((store) => (
              <button
                key={store.id}
                type="button"
                onClick={() => onSelectStore(store.slug)}
                className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                  selectedSlug === store.slug
                    ? "border-primary/30 bg-white shadow-sm"
                    : "border-transparent hover:border-zinc-200 hover:bg-white"
                }`}
              >
                <span className="block truncate text-sm font-semibold text-zinc-950">{store.name}</span>
                <span className="mt-1 block text-xs text-zinc-500">{store.productCount ?? 0} products</span>
              </button>
            ))}

            {stores.length === 0 && (
              <a href="#create-store" className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-3 text-sm font-semibold text-zinc-600">
                <Plus className="h-4 w-4" />
                Create a store
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 p-4">
        <div className="mb-3 min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-950">{user?.name || "Seller"}</p>
          <p className="truncate text-xs text-zinc-500">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
