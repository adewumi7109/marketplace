"use client";

import { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
};

export default function MetricCard({ label, value, helper, icon: Icon }: MetricCardProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-zinc-950">{value}</p>
          <p className="mt-1 text-sm text-zinc-500">{helper}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </section>
  );
}
