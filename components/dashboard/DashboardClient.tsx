"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Copy,
  Edit3,
  Eye,
  Loader2,
  MessageCircle,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  checkStoreSlug,
  clearAccessToken,
  createSellerProduct,
  createStore,
  deleteProduct,
  formatPrice,
  getAccessToken,
  updateProduct,
  updateStore,
} from "@/lib/api";
import { useCategories, useLocations, useMe, useProductCategories, useSellerAnalytics, useSellerProducts, useTemplates } from "@/lib/hooks";
import type { Location, Product, Store } from "@/lib/types";
import MetricCard from "./MetricCard";
import SellerSidebar, { type DashboardView } from "./SellerSidebar";

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  locationId: string;
  state: string;
  city: string;
  country: string;
  images: File[];
};

type SettingsFormState = {
  name: string;
  slug: string;
  phone: string;
  primaryColor: string;
  state: string;
  city: string;
  locationId: string;
  country: string;
  description: string;
  messageTemplate: string;
  logo: File | null;
  banner: File | null;
};

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const initialProductForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  locationId: "",
  state: "",
  city: "",
  country: "Nigeria",
  images: [],
};

const defaultMessageTemplate = "I want to buy {product}";

function cleanPhone(phone?: string) {
  return (phone || "").replace(/\D/g, "");
}

function toStoreSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isHexColor(value: string) {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function whatsappLink(phone: string | undefined, productName: string, template = defaultMessageTemplate) {
  const text = template.replace("{product}", productName).trim() || `I want to buy ${productName}`;
  return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(text)}`;
}

function emptySettings(store?: Store): SettingsFormState {
  return {
    name: store?.name || "",
    slug: store?.slug || "",
    phone: store?.phone || "",
    primaryColor: store?.primaryColor || "#2563eb",
    state: store?.locationData?.state || store?.state || "",
    city: store?.locationData?.city || store?.city || "",
    locationId: store?.locationId || store?.locationData?.id || "",
    country: store?.locationData?.country || store?.country || "Nigeria",
    description: store?.description || "",
    messageTemplate: defaultMessageTemplate,
    logo: null,
    banner: null,
  };
}

function initials(name?: string) {
  return (name || "Store")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function productFormData(
  form: ProductFormState,
  options: { storeId?: string; includeStoreId?: boolean }
) {
  const data = new FormData();
  data.set("name", form.name.trim());
  data.set("description", form.description.trim());
  data.set("price", String(Number(form.price)));
  data.set("categoryId", form.categoryId);
  data.set("inStock", "true");
  if (form.locationId) data.set("locationId", form.locationId);

  if (options.includeStoreId && options.storeId) {
    data.set("storeId", options.storeId);
  }

  form.images.slice(0, 3).forEach((image) => {
    data.append("images", image);
  });

  return data;
}

function productDefaults(store?: Store, categoryId = ""): ProductFormState {
  return {
    ...initialProductForm,
    categoryId,
    locationId: store?.locationId || store?.locationData?.id || "",
    state: store?.locationData?.state || store?.state || "",
    city: store?.locationData?.city || store?.city || "",
    country: store?.locationData?.country || store?.country || "Nigeria",
  };
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))))
    .sort((a, b) => a.localeCompare(b));
}

function sameText(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export default function DashboardClient() {
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedStoreSlug, setSelectedStoreSlug] = useState("");
  const [productForm, setProductForm] = useState<ProductFormState>(initialProductForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [settingsForm, setSettingsForm] = useState<SettingsFormState>(emptySettings());
  const [copiedProductId, setCopiedProductId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugMessage, setSlugMessage] = useState("");
  const [query, setQuery] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isDeletingProductId, setIsDeletingProductId] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const { user, isLoading: userLoading, mutate: refreshUser } = useMe();
  const { analytics } = useSellerAnalytics();
  const { categories } = useCategories();
  const { locations: allLocations } = useLocations({ country: "Nigeria" });
  const { locations: stateLocations, isLoading: locationsLoading } = useLocations(
    settingsForm.state
      ? {
          state: settingsForm.state,
          q: settingsForm.city || undefined,
          country: "Nigeria",
          limit: 20,
        }
      : undefined
  );
  const { locations: productLocationOptions, isLoading: productLocationsLoading } = useLocations(
    productForm.state
      ? {
          state: productForm.state,
          q: productForm.city || undefined,
          country: "Nigeria",
          limit: 20,
        }
      : undefined
  );
  const { categories: productCategories } = useProductCategories();
  const { templates } = useTemplates("STORE");

  const stores = user?.stores ?? [];
  const selectedStore = stores.find((store) => store.slug === selectedStoreSlug) ?? stores[0];
  const { products, isLoading: productsLoading, mutate: refreshProducts } = useSellerProducts(
    selectedStore ? { storeId: selectedStore.id, limit: 100 } : undefined
  );

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
  const stateOptions = useMemo(
    () => uniqueSorted(allLocations.map((location) => location.state)),
    [allLocations]
  );
  const cityOptions = useMemo(() => {
    const term = settingsForm.city.trim().toLowerCase();
    const options = stateLocations.filter((location) => {
      if (!settingsForm.state || location.state !== settingsForm.state) return false;
      if (!term) return true;
      return location.city.toLowerCase().includes(term);
    });

    return options.slice(0, 8);
  }, [settingsForm.city, settingsForm.state, stateLocations]);
  const exactCity = useMemo(
    () =>
      stateLocations.find(
        (location) =>
          location.state === settingsForm.state && sameText(location.city, settingsForm.city)
      ),
    [settingsForm.city, settingsForm.state, stateLocations]
  );
  const needsValidCity = Boolean(settingsForm.state && !exactCity);
  const hasValidPrimaryColor = isHexColor(settingsForm.primaryColor || "#2563eb");

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) =>
      [product.name, product.description, product.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [products, query]);

  const fallbackTotalProducts = stores.reduce((total, store) => total + (store.productCount ?? 0), 0);
  const totalProducts = analytics?.totalProducts ?? fallbackTotalProducts;
  const whatsappClicks = analytics?.whatsappClicks ?? 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!getAccessToken()) {
      window.location.replace("/login");
    }
  }, [mounted]);

  useEffect(() => {
    if (!selectedStoreSlug && stores[0]?.slug) {
      setSelectedStoreSlug(stores[0].slug);
    }
  }, [selectedStoreSlug, stores]);

  useEffect(() => {
    setSettingsForm(emptySettings(selectedStore));
    setEditingProduct(null);
    setProductForm(productDefaults(selectedStore, activeProductCategories[0]?.id || ""));
    setNotice("");
    setError("");
  }, [selectedStore?.id]);

  useEffect(() => {
    setProductForm((current) => ({
      ...current,
      categoryId: current.categoryId || activeProductCategories[0]?.id || "",
    }));
  }, [activeProductCategories]);

  useEffect(() => {
    const slug = settingsForm.slug.trim();

    if (!slug) {
      setSlugStatus("idle");
      setSlugMessage("");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setSlugStatus("invalid");
      setSlugMessage("Use lowercase letters, numbers, and hyphens.");
      return;
    }

    if (selectedStore?.slug === slug) {
      setSlugStatus("available");
      setSlugMessage("Current store URL.");
      return;
    }

    setSlugStatus("checking");
    setSlugMessage("Checking availability...");

    const timeout = window.setTimeout(() => {
      checkStoreSlug(slug)
        .then((result) => {
          const checkedSlug = result.slug || slug;
          if (selectedStore?.slug === checkedSlug) {
            setSlugStatus("available");
            setSlugMessage("Current store URL.");
            return;
          }

          if (result.available) {
            setSlugStatus("available");
            setSlugMessage(`${checkedSlug} is available.`);
          } else {
            setSlugStatus("taken");
            setSlugMessage(`${checkedSlug} is already taken.`);
          }
        })
        .catch((err) => {
          setSlugStatus("invalid");
          setSlugMessage(err instanceof Error ? err.message : "Unable to check slug.");
        });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [selectedStore?.slug, settingsForm.slug]);

  function logout() {
    clearAccessToken();
    window.location.replace("/login");
  }

  function selectStore(slug: string) {
    setSelectedStoreSlug(slug);
    setActiveView("overview");
  }

  function updateStoreName(name: string) {
    const currentNameSlug = toStoreSlug(settingsForm.name);
    const nextSlug = toStoreSlug(name);
    const shouldSyncSlug = !selectedStore || !settingsForm.slug || settingsForm.slug === currentNameSlug;

    setSettingsForm({
      ...settingsForm,
      name,
      slug: shouldSyncSlug ? nextSlug : settingsForm.slug,
    });
  }

  function updateStoreSlug(value: string) {
    setSettingsForm({ ...settingsForm, slug: toStoreSlug(value) });
  }

  function updateStoreState(state: string) {
    setSettingsForm({
      ...settingsForm,
      state,
      city: "",
      locationId: "",
      country: "Nigeria",
    });
  }

  function updateStoreCity(city: string) {
    const exact = stateLocations.find(
      (location) => location.state === settingsForm.state && sameText(location.city, city)
    );

    setSettingsForm({
      ...settingsForm,
      city,
      locationId: exact?.id || "",
      country: exact?.country || settingsForm.country || "Nigeria",
    });
  }

  function selectLocation(location: Location) {
    setSettingsForm({
      ...settingsForm,
      state: location.state || "",
      city: location.city,
      locationId: location.id,
      country: location.country || "Nigeria",
    });
  }

  function resolveStoreLocationId() {
    const state = settingsForm.state.trim();
    const city = settingsForm.city.trim();
    if (!state || !city) return "";

    if (settingsForm.locationId && exactCity?.id === settingsForm.locationId) {
      return settingsForm.locationId;
    }

    if (exactCity) return exactCity.id;

    return "";
  }

  function startEditProduct(product: Product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price || ""),
      categoryId: product.categoryId || "",
      locationId: product.locationId || selectedStore?.locationId || selectedStore?.locationData?.id || "",
      state: product.location?.state || selectedStore?.locationData?.state || selectedStore?.state || "",
      city: product.location?.city || selectedStore?.locationData?.city || selectedStore?.city || "",
      country: product.location?.country || selectedStore?.locationData?.country || selectedStore?.country || "Nigeria",
      images: [],
    });
    setActiveView("products");
  }

  function resetProductForm() {
    setEditingProduct(null);
    setProductForm({
      ...productDefaults(selectedStore, activeProductCategories[0]?.id || ""),
    });
  }

  function updateProductState(state: string) {
    setProductForm({
      ...productForm,
      state,
      city: "",
      locationId: "",
      country: "Nigeria",
    });
  }

  function updateProductCity(city: string) {
    const exact = productLocationOptions.find(
      (location) => location.state === productForm.state && sameText(location.city, city)
    );

    setProductForm({
      ...productForm,
      city,
      locationId: exact?.id || "",
      country: exact?.country || productForm.country || "Nigeria",
    });
  }

  function selectProductLocation(location: Location) {
    setProductForm({
      ...productForm,
      state: location.state || "",
      city: location.city,
      locationId: location.id,
      country: location.country || "Nigeria",
    });
  }

  function useStoreLocationForProduct() {
    setProductForm({
      ...productForm,
      locationId: selectedStore?.locationId || selectedStore?.locationData?.id || "",
      state: selectedStore?.locationData?.state || selectedStore?.state || "",
      city: selectedStore?.locationData?.city || selectedStore?.city || "",
      country: selectedStore?.locationData?.country || selectedStore?.country || "Nigeria",
    });
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStore?.id || !productForm.name.trim() || !productForm.price || !productForm.categoryId) return;

    setError("");
    setNotice("");
    setIsSavingProduct(true);

    try {
      if (editingProduct) {
        await updateProduct(
          editingProduct.id,
          productFormData(productForm, { includeStoreId: false })
        );
        setNotice("Product updated.");
      } else {
        await createSellerProduct(
          productFormData(productForm, { storeId: selectedStore.id, includeStoreId: true })
        );
        setNotice("Product added.");
      }

      resetProductForm();
      await Promise.all([refreshProducts(), refreshUser()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product.");
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function removeProduct(product: Product) {
    const confirmed = window.confirm(`Delete ${product.name}?`);
    if (!confirmed) return;

    setError("");
    setNotice("");
    setIsDeletingProductId(product.id);

    try {
      await deleteProduct(product.id);
      setNotice("Product deleted.");
      await Promise.all([refreshProducts(), refreshUser()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete product.");
    } finally {
      setIsDeletingProductId("");
    }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSavingSettings(true);

    try {
      const body = new FormData();
      body.set("name", settingsForm.name.trim());
      body.set("slug", settingsForm.slug.trim());
      body.set("phone", settingsForm.phone.trim());
      body.set("primaryColor", settingsForm.primaryColor || "#2563eb");
      body.set("description", settingsForm.description.trim());
      const locationId = resolveStoreLocationId();
      if (locationId) body.set("locationId", locationId);
      if (settingsForm.logo) body.set("logo", settingsForm.logo);
      if (settingsForm.banner) body.set("banner", settingsForm.banner);

      if (selectedStore?.slug) {
        await updateStore(selectedStore.slug, body);
        setNotice("Settings saved.");
      } else {
        body.set("email", user?.email || "");
        body.set("categoryId", activeStoreCategories[0]?.id || "");
        body.set("templateId", activeTemplates[0]?.id || "");

        const store = await createStore(body);
        setSelectedStoreSlug(store.slug);
        setNotice("Store created.");
      }

      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function copyOrderLink(product: Product) {
    const link =
      selectedStore && product.slug
        ? `${window.location.origin}/store/${selectedStore.slug}/products/${product.slug}`
        : `${window.location.origin}/store/${selectedStore?.slug || ""}`;
    await window.navigator.clipboard.writeText(link);
    setCopiedProductId(product.id);
    window.setTimeout(() => setCopiedProductId(""), 1800);
  }

  if (!mounted || userLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 lg:flex">
      <SellerSidebar
        user={user}
        activeView={activeView}
        collapsed={sidebarCollapsed}
        onChangeView={setActiveView}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
        onLogout={logout}
      />

      <div className="min-w-0 flex-1">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 xl:px-8 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">WhatsApp commerce</p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
                {activeView === "overview" && "Overview"}
                {activeView === "products" && "Products"}
                {activeView === "settings" && "Settings"}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {stores.length > 1 && (
                <select
                  value={selectedStore?.slug || ""}
                  onChange={(event) => selectStore(event.target.value)}
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.slug}>
                      {store.name}
                    </option>
                  ))}
                </select>
              )}
              {selectedStore && (
                <Link
                  href={`/store/${selectedStore.slug}`}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  View store
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setActiveView("products")}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add product
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 xl:px-8">
          {(error || notice) && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                error
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {error || notice}
            </div>
          )}

          {activeView === "overview" && (
            <>
              <section className="grid gap-4 md:grid-cols-2">
                <MetricCard label="Total Products" value={totalProducts} helper="Live catalog items" icon={Package} />
                <MetricCard label="WhatsApp Clicks" value={whatsappClicks} helper="Order button taps" icon={MessageCircle} />
              </section>
            </>
          )}

          {activeView === "products" && (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
              <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full md:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search products"
                      className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                  <p className="text-sm font-semibold text-zinc-500">{visibleProducts.length} products</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
                    <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Counts</th>
                        <th className="px-4 py-3">Product Link</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {productsLoading
                        ? Array.from({ length: 4 }).map((_, index) => (
                            <tr key={index}>
                              <td className="px-4 py-4"><div className="h-4 w-40 rounded bg-zinc-100" /></td>
                              <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-zinc-100" /></td>
                              <td className="px-4 py-4"><div className="h-4 w-36 rounded bg-zinc-100" /></td>
                              <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-zinc-100" /></td>
                              <td className="px-4 py-4"><div className="ml-auto h-9 w-24 rounded bg-zinc-100" /></td>
                            </tr>
                          ))
                        : visibleProducts.map((product) => (
                            <tr key={product.id} className="transition hover:bg-zinc-50">
                              <td className="px-4 py-4">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                                    {product.imageUrl || product.images?.[0] ? (
                                      <Image
                                        src={product.imageUrl || product.images?.[0] || ""}
                                        alt={product.name}
                                        fill
                                        sizes="44px"
                                        className="object-cover"
                                      />
                                    ) : (
                                      <span className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-500">
                                        {initials(product.name)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-zinc-950">{product.name}</p>
                                    <p className="mt-1 truncate text-xs text-zinc-500">
                                      {product.category || "Uncategorized"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 font-semibold text-zinc-950">
                                {formatPrice(product.price, product.currency)}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
                                  <span className="inline-flex items-center gap-1">
                                    <Eye className="h-3.5 w-3.5 text-primary" />
                                    {(product.viewCount ?? 0).toLocaleString()} views
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                                    {(product.whatsappClickCount ?? 0).toLocaleString()} clicks
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/store/${selectedStore?.slug}/products/${product.slug || product.id}`}
                                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                                  >
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                    View
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => copyOrderLink(product)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:border-primary/30 hover:text-primary"
                                    aria-label={`Copy order link for ${product.name}`}
                                    title={copiedProductId === product.id ? "Copied" : "Copy link"}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEditProduct(product)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:border-primary/30 hover:text-primary"
                                    aria-label={`Edit ${product.name}`}
                                    title="Edit"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeProduct(product)}
                                    disabled={isDeletingProductId === product.id}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:border-red-200 hover:text-red-600 disabled:opacity-60"
                                    aria-label={`Delete ${product.name}`}
                                    title="Delete"
                                  >
                                    {isDeletingProductId === product.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>

                {!productsLoading && visibleProducts.length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm font-semibold text-zinc-900">No products yet</p>
                  </div>
                )}
              </section>

              <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg font-bold tracking-tight">
                      {editingProduct ? "Edit product" : "Add product"}
                    </h2>
                  </div>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={saveProduct} className="mt-5 space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-600">Product name</span>
                    <input
                      required
                      value={productForm.name}
                      onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
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
                      value={productForm.price}
                      onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                      disabled={!selectedStore}
                      className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-600">Category</span>
                    <select
                      required
                      value={productForm.categoryId}
                      onChange={(event) => setProductForm({ ...productForm, categoryId: event.target.value })}
                      disabled={!selectedStore}
                      className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                    >
                      <option value="">No category</option>
                      {activeProductCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-zinc-700">Product location</span>
                        <p className="mt-1 text-xs text-zinc-500">
                          Defaults to the store location. Change it only when this item is in another city.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={useStoreLocationForProduct}
                        disabled={!selectedStore?.locationId && !selectedStore?.locationData?.id}
                        className="shrink-0 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Use store
                      </button>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold text-zinc-600">State</span>
                        <select
                          value={productForm.state}
                          onChange={(event) => updateProductState(event.target.value)}
                          disabled={!selectedStore}
                          className="mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition disabled:bg-zinc-100 disabled:text-zinc-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                        >
                          <option value="">Select state</option>
                          {stateOptions.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-xs font-semibold text-zinc-600">City</span>
                        <input
                          value={productForm.city}
                          onChange={(event) => updateProductCity(event.target.value)}
                          disabled={!selectedStore || !productForm.state}
                          placeholder={productForm.state ? "Search city" : "Select state first"}
                          className="mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition disabled:bg-zinc-100 disabled:text-zinc-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                        />
                      </label>
                    </div>

                    {productForm.state && (
                      <div className="mt-2 rounded-lg border border-zinc-200 bg-white p-2">
                        {productLocationsLoading ? (
                          <p className="px-2 py-1 text-xs text-zinc-500">Loading cities...</p>
                        ) : productLocationOptions.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {productLocationOptions.slice(0, 8).map((location) => (
                              <button
                                key={location.id}
                                type="button"
                                onClick={() => selectProductLocation(location)}
                                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                                  productForm.locationId === location.id
                                    ? "bg-primary text-white"
                                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                }`}
                              >
                                {location.city}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="px-2 py-1 text-xs text-zinc-500">No matching city.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-600">Description</span>
                    <textarea
                      rows={4}
                      value={productForm.description}
                      onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                      disabled={!selectedStore}
                      className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-3 text-sm outline-none transition disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-600">Product images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? []).slice(0, 3);
                        setProductForm({ ...productForm, images: files });
                      }}
                      disabled={!selectedStore}
                      className="mt-1 w-full rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
                    />
                    <span className="mt-1 block text-xs text-zinc-500">
                      Upload up to 3 images.
                    </span>
                    {productForm.images.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {productForm.images.map((image) => (
                          <span
                            key={`${image.name}-${image.size}`}
                            className="max-w-full truncate rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600"
                          >
                            {image.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </label>

                  <button
                    type="submit"
                    disabled={!selectedStore || isSavingProduct || !productForm.price || !productForm.categoryId}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSavingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {editingProduct ? "Save changes" : "Add product"}
                  </button>
                </form>
              </section>
            </div>
          )}

          {activeView === "settings" && (
            <section className="max-w-3xl rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Eye className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Store all-time views
                    </p>
                    <p className="text-2xl font-bold text-zinc-950">
                      {(selectedStore?.storeViewCount ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <form onSubmit={saveSettings} className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="text-xs font-semibold text-zinc-600">Store name</span>
                  <input
                    required
                    value={settingsForm.name}
                    onChange={(event) => updateStoreName(event.target.value)}
                    className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-xs font-semibold text-zinc-600">Store URL slug</span>
                  <div className="mt-1 flex overflow-hidden rounded-lg border border-zinc-200 bg-white focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10">
                    <span className="inline-flex shrink-0 items-center border-r border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500">
                      /store/
                    </span>
                    <input
                      required
                      value={settingsForm.slug}
                      onChange={(event) => updateStoreSlug(event.target.value)}
                      className="h-11 min-w-0 flex-1 px-3 text-sm outline-none"
                    />
                  </div>
                  {slugMessage && (
                    <span
                      className={`mt-1 block text-xs ${
                        slugStatus === "available"
                          ? "text-emerald-600"
                          : slugStatus === "checking"
                          ? "text-zinc-500"
                          : "text-red-600"
                      }`}
                    >
                      {slugMessage}
                    </span>
                  )}
                </label>

                <label className="block md:col-span-2">
                  <span className="text-xs font-semibold text-zinc-600">WhatsApp phone number</span>
                  <input
                    required
                    value={settingsForm.phone}
                    onChange={(event) => setSettingsForm({ ...settingsForm, phone: event.target.value })}
                    className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-xs font-semibold text-zinc-600">Store primary color</span>
                  <div className="mt-1 flex overflow-hidden rounded-lg border border-zinc-200 bg-white focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10">
                    <input
                      type="color"
                      value={settingsForm.primaryColor || "#2563eb"}
                      onChange={(event) =>
                        setSettingsForm({ ...settingsForm, primaryColor: event.target.value })
                      }
                      className="h-11 w-14 shrink-0 cursor-pointer border-0 bg-transparent p-1"
                      aria-label="Store primary color"
                    />
                    <input
                      value={settingsForm.primaryColor}
                      onChange={(event) =>
                        setSettingsForm({ ...settingsForm, primaryColor: event.target.value })
                      }
                      pattern="^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$"
                      placeholder="#2563eb"
                      className="h-11 min-w-0 flex-1 border-l border-zinc-200 px-3 text-sm font-semibold outline-none"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-zinc-600">State</span>
                  <select
                    value={settingsForm.state}
                    onChange={(event) => updateStoreState(event.target.value)}
                    className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="">Select state</option>
                    {stateOptions.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-zinc-600">City</span>
                  <input
                    value={settingsForm.city}
                    onChange={(event) => updateStoreCity(event.target.value)}
                    disabled={!settingsForm.state}
                    placeholder={settingsForm.state ? "Search city" : "Select state first"}
                    className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                  />
                  {settingsForm.state && (
                    <div className="mt-2 rounded-lg border border-zinc-200 bg-white p-2">
                      {locationsLoading ? (
                        <p className="px-2 py-1 text-xs text-zinc-500">Loading cities...</p>
                      ) : cityOptions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {cityOptions.map((location) => (
                            <button
                              key={location.id}
                              type="button"
                              onClick={() => selectLocation(location)}
                              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                                settingsForm.locationId === location.id
                                  ? "bg-primary text-white"
                                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                              }`}
                            >
                              {location.city}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="px-2 py-1 text-xs text-zinc-500">
                          No matching city.
                        </p>
                      )}
                    </div>
                  )}
                  {settingsForm.state && settingsForm.city && exactCity && (
                    <span className="mt-1 block text-xs text-emerald-600">
                      Using existing city: {exactCity.city}, {exactCity.state}
                    </span>
                  )}
                </label>

                <label className="block md:col-span-2">
                  <span className="text-xs font-semibold text-zinc-600">Store description</span>
                  <textarea
                    rows={4}
                    value={settingsForm.description}
                    onChange={(event) => setSettingsForm({ ...settingsForm, description: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-xs font-semibold text-zinc-600">Business logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setSettingsForm({ ...settingsForm, logo: event.target.files?.[0] || null })}
                    className="mt-1 w-full rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-800"
                  />
                  {settingsForm.logo && (
                    <span className="mt-1 block truncate text-xs text-zinc-500">
                      Selected: {settingsForm.logo.name}
                    </span>
                  )}
                </label>

                <label className="block md:col-span-2">
                  <span className="text-xs font-semibold text-zinc-600">Store banner</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setSettingsForm({ ...settingsForm, banner: event.target.files?.[0] || null })}
                    className="mt-1 w-full rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-800"
                  />
                  {settingsForm.banner && (
                    <span className="mt-1 block truncate text-xs text-zinc-500">
                      Selected: {settingsForm.banner.name}
                    </span>
                  )}
                </label>

                <label className="block md:col-span-2">
                  <span className="text-xs font-semibold text-zinc-600">Default WhatsApp message template</span>
                  <input
                    value={settingsForm.messageTemplate}
                    onChange={(event) => setSettingsForm({ ...settingsForm, messageTemplate: event.target.value })}
                    className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                  />
                </label>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={
                      isSavingSettings ||
                      !settingsForm.name ||
                      !settingsForm.slug ||
                      !settingsForm.phone ||
                      !hasValidPrimaryColor ||
                      needsValidCity ||
                      slugStatus === "checking" ||
                      slugStatus === "taken" ||
                      slugStatus === "invalid"
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save settings
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
