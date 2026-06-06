"use client";

import useSWR from "swr";
import {
  getAccessToken,
  getMe,
  getSellerAnalytics,
  getLocations,
  getMarketplaceStores,
  getProducts,
  getProductsByStore,
  getSellerProducts,
  getProductCategories,
  getStoreCategories,
  getStores,
  getTemplates,
  swrFetcher,
} from "./api";
import type {
  PaginatedResponse,
  Location,
  LocationQueryParams,
  Product,
  ProductCategory,
  ProductQueryParams,
  SellerAnalytics,
  Store,
  StoreCategory,
  StoreQueryParams,
  Template,
  TemplateType,
  UserProfile,
} from "./types";

function marketplaceKey(params?: StoreQueryParams) {
  const query = new URLSearchParams();
  const q = params?.q ?? params?.search;
  const categoryId = params?.categoryId ?? params?.category;
  const city = params?.city ?? params?.location;
  const limit = params?.limit ?? params?.pageSize;

  if (q) query.set("q", q);
  if (categoryId) query.set("categoryId", categoryId);
  if (city) query.set("city", city);
  if (params?.country) query.set("country", params.country);
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.page) query.set("page", String(params.page));
  if (limit) query.set("limit", String(limit));

  const qs = query.toString();
  return `/api/marketplace${qs ? `?${qs}` : ""}`;
}

function storesKey(params?: StoreQueryParams) {
  const query = new URLSearchParams();
  const categoryId = params?.categoryId ?? params?.category;
  const limit = params?.limit ?? params?.pageSize;

  if (categoryId) query.set("categoryId", categoryId);
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.page) query.set("page", String(params.page));
  if (limit) query.set("limit", String(limit));

  const qs = query.toString();
  return `/api/stores${qs ? `?${qs}` : ""}`;
}

function productsKey(slug?: string, params?: ProductQueryParams) {
  const query = new URLSearchParams();
  const limit = params?.limit ?? params?.pageSize;
  const q = params?.q ?? params?.search;

  if (params?.categoryId) query.set("categoryId", params.categoryId);
  if (params?.storeId) query.set("storeId", params.storeId);
  if (q) query.set("search", q);
  if (params?.locationId) query.set("locationId", params.locationId);
  if (params?.city) query.set("city", params.city);
  if (params?.state) query.set("state", params.state);
  if (params?.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params?.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params?.inStock !== undefined) query.set("inStock", String(params.inStock));
  if (params?.page) query.set("page", String(params.page));
  if (limit) query.set("limit", String(limit));

  const qs = query.toString();
  if (slug) {
    return `/api/stores/${encodeURIComponent(slug)}/products${qs ? `?${qs}` : ""}`;
  }

  return `/api/products${qs ? `?${qs}` : ""}`;
}

function sellerProductsKey(params?: ProductQueryParams) {
  const query = new URLSearchParams();
  const limit = params?.limit ?? params?.pageSize;
  const q = params?.q ?? params?.search;

  if (params?.categoryId) query.set("categoryId", params.categoryId);
  if (params?.storeId) query.set("storeId", params.storeId);
  if (q) query.set("search", q);
  if (params?.inStock !== undefined) query.set("inStock", String(params.inStock));
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.page) query.set("page", String(params.page));
  if (limit) query.set("limit", String(limit));

  const qs = query.toString();
  return `/api/me/products${qs ? `?${qs}` : ""}`;
}

function locationsKey(params?: LocationQueryParams) {
  const query = new URLSearchParams();
  const limit = params?.limit ?? params?.pageSize;
  const q = params?.q ?? params?.search;

  if (q) query.set("q", q);
  if (params?.state) query.set("state", params.state);
  if (params?.city) query.set("city", params.city);
  if (params?.country) query.set("country", params.country);
  if (params?.lga) query.set("lga", params.lga);
  if (params?.hasProducts !== undefined) query.set("hasProducts", String(params.hasProducts));
  if (params?.page) query.set("page", String(params.page));
  if (limit) query.set("limit", String(limit));

  const qs = query.toString();
  return `/api/locations${qs ? `?${qs}` : ""}`;
}

export function useSellerAnalytics() {
  const token = getAccessToken();
  const key = token ? (["/api/me/analytics", token] as const) : null;
  const { data, error, isLoading, mutate } = useSWR<SellerAnalytics>(
    key,
    getSellerAnalytics,
    { keepPreviousData: true }
  );

  return {
    analytics: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useStores(params?: StoreQueryParams) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Store>>(
    marketplaceKey(params),
    () => getMarketplaceStores(params),
    { keepPreviousData: true }
  );

  return {
    stores: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? params?.page ?? 1,
    limit: data?.limit ?? data?.pageSize ?? params?.limit ?? params?.pageSize ?? 24,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useOwnerStores(params?: StoreQueryParams) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Store>>(
    storesKey(params),
    () => getStores(params),
    { keepPreviousData: true }
  );

  return {
    stores: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useStore(slug: string) {
  const { data, error, isLoading, mutate } = useSWR<Store>(
    slug ? `/api/stores/${encodeURIComponent(slug)}` : null,
    swrFetcher
  );

  return {
    store: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useProducts(slug?: string, params?: ProductQueryParams) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Product>>(
    productsKey(slug, params),
    () => (slug ? getProductsByStore(slug, params) : getProducts(params)),
    { keepPreviousData: true }
  );

  return {
    products: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useSellerProducts(params?: ProductQueryParams) {
  const token = getAccessToken();
  const key = token ? ([sellerProductsKey(params), token] as const) : null;
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Product>>(
    key,
    () => getSellerProducts(params),
    { keepPreviousData: true }
  );

  return {
    products: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useLocations(params?: LocationQueryParams) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Location>>(
    locationsKey(params),
    () => getLocations(params),
    { keepPreviousData: true }
  );

  return {
    locations: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<StoreCategory[]>(
    "/api/categories/stores",
    getStoreCategories
  );

  return {
    categories: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useProductCategories() {
  const { data, error, isLoading, mutate } = useSWR<ProductCategory[]>(
    "/api/categories/products",
    getProductCategories
  );

  return {
    categories: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useTemplates(type?: TemplateType) {
  const { data, error, isLoading, mutate } = useSWR<Template[]>(
    `/api/templates${type ? `?type=${type}` : ""}`,
    () => getTemplates(type)
  );

  return {
    templates: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useMe() {
  const token = getAccessToken();
  const key = token ? (["/api/me", token] as const) : null;
  const { data, error, isLoading, mutate } = useSWR<UserProfile>(
    key,
    ([, accessToken]) => getMe(typeof accessToken === "string" ? accessToken : null)
  );

  return {
    user: data,
    isAuthenticated: !!token && !error,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
