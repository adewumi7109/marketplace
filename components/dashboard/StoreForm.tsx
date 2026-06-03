"use client";

import { FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import type { StoreCategory, Template } from "@/lib/types";

export type StoreFormState = {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  categoryId: string;
  templateId: string;
  logo: File | null;
};

type StoreFormProps = {
  form: StoreFormState;
  categories: StoreCategory[];
  templates: Template[];
  categoriesLoading?: boolean;
  templatesLoading?: boolean;
  isSubmitting?: boolean;
  createdStoreName?: string;
  onChange: (form: StoreFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export const initialStoreForm: StoreFormState = {
  name: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  categoryId: "",
  templateId: "",
  logo: null,
};

export default function StoreForm({
  form,
  categories,
  templates,
  categoriesLoading,
  templatesLoading,
  isSubmitting,
  createdStoreName,
  onChange,
  onSubmit,
}: StoreFormProps) {
  return (
    <section id="create-store" className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-2 border-b border-zinc-200 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Create store</h2>
          <p className="mt-1 text-sm text-zinc-500">Set up a seller storefront with contact details buyers can trust.</p>
        </div>
      </div>

      {createdStoreName && (
        <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Store created: <strong>{createdStoreName}</strong>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-xs font-semibold text-zinc-600">Store name</span>
          <input
            required
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-zinc-600">Category</span>
          <select
            required
            value={form.categoryId}
            onChange={(event) => onChange({ ...form, categoryId: event.target.value })}
            disabled={categoriesLoading}
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-zinc-600">Template</span>
          <select
            required
            value={form.templateId}
            onChange={(event) => onChange({ ...form, templateId: event.target.value })}
            disabled={templatesLoading}
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
          >
            <option value="">Select template</option>
            {templates.map((template) => (
              <option key={template.id || template.code} value={template.id || ""}>
                {template.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-zinc-600">Phone</span>
          <input
            required
            value={form.phone}
            onChange={(event) => onChange({ ...form, phone: event.target.value })}
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-zinc-600">Store email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange({ ...form, email: event.target.value })}
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-xs font-semibold text-zinc-600">Address</span>
          <input
            value={form.address}
            onChange={(event) => onChange({ ...form, address: event.target.value })}
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-xs font-semibold text-zinc-600">Description</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-xs font-semibold text-zinc-600">Logo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => onChange({ ...form, logo: event.target.files?.[0] || null })}
            className="mt-1 w-full rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-800"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting || !form.categoryId || !form.templateId}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create store
          </button>
        </div>
      </form>
    </section>
  );
}
