"use client";

import { FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import type { ProductCategory, ProductCondition, Store } from "@/lib/types";

export type ProductFormState = {
  name: string;
  description: string;
  price: string;
  condition: ProductCondition | "";
  categoryId: string;
};

type ProductFormProps = {
  form: ProductFormState;
  selectedStore?: Store;
  categories: ProductCategory[];
  isSubmitting?: boolean;
  successMessage?: string;
  onChange: (form: ProductFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export const initialProductForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  condition: "",
  categoryId: "",
};

export default function ProductForm({
  form,
  selectedStore,
  categories,
  isSubmitting,
  successMessage,
  onChange,
  onSubmit,
}: ProductFormProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-2 border-b border-zinc-200 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Add product</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {selectedStore ? `Publishing to ${selectedStore.name}` : "Create or select a store before adding products."}
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-xs font-semibold text-zinc-600">Product name</span>
          <input
            required
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            disabled={!selectedStore}
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-zinc-600">Price</span>
          <input
            required
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={(event) => onChange({ ...form, price: event.target.value })}
            disabled={!selectedStore}
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-zinc-600">Category</span>
          <select
            value={form.categoryId}
            onChange={(event) => onChange({ ...form, categoryId: event.target.value })}
            disabled={!selectedStore}
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-zinc-600">Product condition</span>
          <select
            required
            value={form.condition}
            onChange={(event) =>
              onChange({
                ...form,
                condition: event.target.value as ProductCondition | "",
              })
            }
            disabled={!selectedStore}
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
          >
            <option value="">Select condition</option>
            <option value="NEW">New</option>
            <option value="USED">Used</option>
            <option value="REFURBISHED">Refurbished</option>
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="text-xs font-semibold text-zinc-600">Description</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            disabled={!selectedStore}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-3 text-sm outline-none transition disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={!selectedStore || isSubmitting || !form.price}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add product
          </button>
        </div>
      </form>
    </section>
  );
}
