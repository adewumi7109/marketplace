"use client";

import Link from "next/link";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Package,
  Settings,
  Store as StoreIcon,
} from "lucide-react";
import type { UserProfile } from "@/lib/types";

export type DashboardView = "overview" | "products" | "settings";

type SellerSidebarProps = {
  user?: UserProfile;
  activeView: DashboardView;
  collapsed: boolean;
  onChangeView: (view: DashboardView) => void;
  onToggleCollapsed: () => void;
  onLogout: () => void;
};

const navItems: Array<{
  id: DashboardView;
  label: string;
  icon: typeof BarChart3;
}> = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function SellerSidebar({
  user,
  activeView,
  collapsed,
  onChangeView,
  onToggleCollapsed,
  onLogout,
}: SellerSidebarProps) {
  return (
    <aside
      className={`flex border-r border-zinc-200 bg-white lg:sticky lg:top-0 lg:min-h-screen ${
        collapsed ? "lg:w-20" : "lg:w-72"
      }`}
    >
      <div className="flex w-full flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <StoreIcon className="h-5 w-5" />
            </span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate font-display text-lg font-bold tracking-tight">
                  Seller Desk
                </span>
                <span className="block truncate text-xs text-zinc-500">WhatsApp commerce</span>
              </span>
            )}
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
            onClick={onLogout}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 lg:hidden"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <nav className="grid grid-cols-3 gap-2 border-b border-zinc-200 p-3 lg:block lg:space-y-1 lg:border-b-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeView(item.id)}
                className={`flex h-11 items-center justify-center gap-3 rounded-lg px-3 text-sm font-semibold transition lg:w-full lg:justify-start ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="hidden lg:inline">{item.label}</span>}
                <span className="lg:hidden">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden flex-1 lg:block" />

        <div className="hidden border-t border-zinc-200 p-4 lg:block">
          {!collapsed && (
            <div className="mb-3 min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-950">{user?.name || "Seller"}</p>
              <p className="truncate text-xs text-zinc-500">{user?.email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && "Sign out"}
          </button>
        </div>
      </div>
    </aside>
  );
}
