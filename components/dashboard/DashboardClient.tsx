"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2, Package, ShoppingBag, Store as StoreIcon } from "lucide-react";
import { clearAccessToken, createProduct, createStore, getAccessToken } from "@/lib/api";
import { useCategories, useMe, useProductCategories, useTemplates } from "@/lib/hooks";
import type { Store } from "@/lib/types";
import MetricCard from "./MetricCard";
import ProductForm, { initialProductForm, type ProductFormState } from "./ProductForm";
import ProductTable from "./ProductTable";
import SellerSidebar from "./SellerSidebar";
import StoreForm, { initialStoreForm, type StoreFormState } from "./StoreForm";
import StoreTable from "./StoreTable";

export default function DashboardClient() {
  const router = useRouter();
  const [selectedStoreSlug, setSelectedStoreSlug] = useState("");
  const [storeForm, setStoreForm] = useState<StoreFormState>(initialStoreForm);
  const [productForm, setProductForm] = useState<ProductFormState>(initialProductForm);
  const [createdStore, setCreatedStore] = useState<Store | null>(null);
  const [productMessage, setProductMessage] = useState("");
  const [isCreatingStore, setIsCreatingStore] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [error, setError] = useState("");

  const { user, isLoading: userLoading, mutate: refreshUser } = useMe();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { categories: productCategories } = useProductCategories();
  const { templates, isLoading: templatesLoading } = useTemplates("STORE");

  const stores = user?.stores ?? [];
  const selectedStore = stores.find((store) => store.slug === selectedStoreSlug) ?? stores[0];
  const totalProducts = stores.reduce((total, store) => total + (store.productCount ?? 0), 0);
  const liveStores = stores.filter((store) => store.isActive !== false).length;

  const activeStoreCategories = useMemo(
    () => categories.filter((category) => category.isActive !== false),
    [categories]
  );
  const activeProductCategories = useMemo(
    () => productCategories.filter((category) => category.isActive !== false),
    [productCategories]
  );
  const activeTemplates = useMemo(
    () => templates.filter((template) => template.isActive !== false),
    [templates]
  );

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!selectedStoreSlug && stores[0]?.slug) {
      setSelectedStoreSlug(stores[0].slug);
    }
  }, [selectedStoreSlug, stores]);

  useEffect(() => {
    setStoreForm((current) => ({
      ...current,
      email: current.email || user?.email || "",
      categoryId: current.categoryId || activeStoreCategories[0]?.id || "",
      templateId: current.templateId || activeTemplates[0]?.id || "",
    }));
  }, [user?.email, activeStoreCategories, activeTemplates]);

  useEffect(() => {
    setProductForm((current) => ({
      ...current,
      categoryId: current.categoryId || activeProductCategories[0]?.id || "",
    }));
  }, [activeProductCategories]);

  function logout() {
    clearAccessToken();
    router.replace("/login");
  }

  async function submitStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreatedStore(null);
    setIsCreatingStore(true);

    try {
      const body = new FormData();
      body.set("name", storeForm.name.trim());
      body.set("phone", storeForm.phone.trim());
      body.set("categoryId", storeForm.categoryId);
      body.set("templateId", storeForm.templateId);
      if (storeForm.description.trim()) body.set("description", storeForm.description.trim());
      body.set("email", (storeForm.email || user?.email || "").trim());
      if (storeForm.address.trim()) body.set("address", storeForm.address.trim());
      if (storeForm.logo) body.set("logo", storeForm.logo);

      const store = await createStore(body);
      setCreatedStore(store);
      setSelectedStoreSlug(store.slug);
      setStoreForm({
        ...initialStoreForm,
        email: user?.email || "",
        categoryId: activeStoreCategories[0]?.id || "",
        templateId: activeTemplates[0]?.id || "",
      });
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create store.");
    } finally {
      setIsCreatingStore(false);
    }
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStore?.slug) return;

    setError("");
    setProductMessage("");
    setIsCreatingProduct(true);

    try {
      await createProduct(selectedStore.slug, {
        name: productForm.name.trim(),
        description: productForm.description.trim() || undefined,
        price: Number(productForm.price),
        categoryId: productForm.categoryId || undefined,
        inStock: true,
      });
      setProductMessage(`Product added to ${selectedStore.name}.`);
      setProductForm({
        ...initialProductForm,
        categoryId: activeProductCategories[0]?.id || "",
      });
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create product.");
    } finally {
      setIsCreatingProduct(false);
    }
  }

  if (userLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading seller dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <SellerSidebar
        user={user}
        stores={stores}
        selectedSlug={selectedStore?.slug}
        onSelectStore={setSelectedStoreSlug}
        onLogout={logout}
      />

      <div className="min-w-0">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 xl:px-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Seller dashboard</p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Manage your stores and products
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Keep storefronts polished, publish inventory, and review your seller activity from one workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="inline-flex h-10 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                Marketplace
              </Link>
              {selectedStore && (
                <Link
                  href={`/store/${selectedStore.slug}`}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  View store
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 xl:px-8">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Stores" value={stores.length} helper={`${liveStores} live storefronts`} icon={StoreIcon} />
            <MetricCard label="Products" value={totalProducts} helper="Across all stores" icon={Package} />
            <MetricCard label="Selected" value={selectedStore?.name || "None"} helper={selectedStore?.email || user?.email || "No store selected"} icon={ShoppingBag} />
          </section>

          <section id="stores" className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight">Stores</h2>
                <p className="mt-1 text-sm text-zinc-500">Select a store to focus the products table and product form.</p>
              </div>
            </div>
            <StoreTable stores={stores} selectedSlug={selectedStore?.slug} onSelect={setSelectedStoreSlug} />
          </section>

          <section id="products" className="space-y-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Products</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {selectedStore ? `Current inventory for ${selectedStore.name}.` : "Select a store to view products."}
              </p>
            </div>
            <ProductTable
              storeSlug={selectedStore?.slug}
              onChanged={refreshUser}
              onError={setError}
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <StoreForm
              form={storeForm}
              categories={activeStoreCategories}
              templates={activeTemplates}
              categoriesLoading={categoriesLoading}
              templatesLoading={templatesLoading}
              isSubmitting={isCreatingStore}
              createdStoreName={createdStore?.name}
              onChange={setStoreForm}
              onSubmit={submitStore}
            />
            <ProductForm
              form={productForm}
              selectedStore={selectedStore}
              categories={activeProductCategories}
              isSubmitting={isCreatingProduct}
              successMessage={productMessage}
              onChange={setProductForm}
              onSubmit={submitProduct}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
