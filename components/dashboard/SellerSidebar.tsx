"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Layers3,
  LogOut,
  Package,
  Settings,
  X,
} from "lucide-react";
import type { UserProfile } from "@/lib/types";

export type DashboardView = "overview" | "products" | "categories" | "settings";

type SellerSidebarProps = {
  user?: UserProfile;
  activeView: DashboardView;
  collapsed: boolean;
  mobileOpen: boolean;
  onChangeView: (view: DashboardView) => void;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
  onLogout: () => void;
};

const navItems: Array<{
  id: DashboardView;
  label: string;
  icon: typeof BarChart3;
  href: string;
}> = [
  { id: "overview", label: "Overview", icon: BarChart3, href: "/dashboard" },
  { id: "products", label: "Products", icon: Package, href: "/dashboard/products" },
  { id: "categories", label: "Categories", icon: Layers3, href: "/dashboard/categories" },
  { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function SellerSidebar({
  user,
  activeView,
  collapsed,
  mobileOpen,
  onChangeView,
  onToggleCollapsed,
  onCloseMobile,
  onLogout,
}: SellerSidebarProps) {
  return (
    <>
      <button
        type="button"
        onClick={onCloseMobile}
        className={`fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label="Close dashboard menu"
        aria-hidden={!mobileOpen}
        tabIndex={mobileOpen ? 0 : -1}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,20rem)] border-r border-zinc-200 bg-white shadow-2xl shadow-zinc-950/10 transition-transform duration-300 ease-out lg:z-30 lg:w-auto lg:shadow-none lg:transition-[width] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-20" : "lg:w-72"} lg:translate-x-0`}
      >
        <div className="flex min-h-0 w-full flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/logoo.png"
                alt="Kombomart"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </span>
            <span className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
                <span className="block truncate font-display text-lg font-bold tracking-tight">
                  Seller dashboard
                </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onToggleCollapsed}
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950 lg:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 lg:hidden"
            aria-label="Close dashboard menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  onChangeView(item.id);
                  onCloseMobile();
                }}
                className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="border-t border-zinc-200 p-4">
          <div className={collapsed ? "lg:hidden" : ""}>
            <div className="mb-3 min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-950">{user?.name || "Seller"}</p>
              <p className="truncate text-xs text-zinc-500">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-4 w-4" />
            <span className={collapsed ? "lg:hidden" : ""}>Sign out</span>
          </button>
        </div>
        </div>
      </aside>
    </>
  );
}
