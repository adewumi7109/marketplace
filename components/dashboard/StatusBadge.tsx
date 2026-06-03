"use client";

import { CheckCircle2, Clock } from "lucide-react";

type StatusBadgeProps = {
  active?: boolean;
  label?: string;
};

export default function StatusBadge({ active = true, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
          : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200"
      }`}
    >
      {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
      {label ?? (active ? "Active" : "Inactive")}
    </span>
  );
}
