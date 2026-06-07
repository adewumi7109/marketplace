import type {
  AuthResponse,
  CreateCategoryInput,
  CreateProductInput,
  CreateStoreInput,
  CreateTemplateInput,
  Location,
  LocationQueryParams,
  LoginInput,
  GoogleAuthInput,
  PaginatedResponse,
  Product,
  ProductCategory,
  ProductLocation,
  ProductQueryParams,
  RegisterInput,
  SellerAnalytics,
  Store,
  StoreCategory,
  StoreQueryParams,
  Template,
  TemplateType,
  UpdateCategoryInput,
  UpdateProductInput,
  UpdateStoreInput,
  UpdateTemplateInput,
  UserProfile,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://marketplaceapi1.netlify.app/api";
const TOKEN_STORAGE_KEY = "marketplace_access_token";

type ApiFetchOptions = RequestInit & {
  token?: string | null;
  requireAuth?: boolean;
};

type UnknownRecord = Record<string, unknown>;

export class ApiRequestError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.payload = payload;
  }
}

function cleanBaseUrl() {
  return API_BASE_URL.replace(/\/+$/, "");
}

function toApiPath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = cleanBaseUrl();

  if (base.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return normalizedPath.replace(/^\/api/, "");
  }

  return normalizedPath;
}

function apiUrl(path: string) {
  return `${cleanBaseUrl()}${toApiPath(path)}`;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function valueAsString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function valueAsNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function valueAsBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeProductCondition(value: unknown) {
  const condition = valueAsString(value).trim().toLowerCase();

  if (!condition) return null;
  if (condition === "new" || condition === "brand new") return "NEW";
  if (condition === "refurbished") return "REFURBISHED";
  if (condition.startsWith("used")) return "USED";

  return null;
}

function payloadMessage(payload: unknown): string | null {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (!isRecord(payload)) return null;

  for (const key of ["message", "error", "detail", "statusText"]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value;
    if (isRecord(value)) {
      const nested = payloadMessage(value);
      if (nested) return nested;
    }
  }

  const data = payload.data;
  if (isRecord(data)) return payloadMessage(data);

  return null;
}

function appendQuery(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>
) {
  const query = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;

  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getAccessToken() {
  return getStoredAccessToken();
}

export function clearAccessToken() {
  setAccessToken(null);
}

function redirectToLoginOnAuthFailure() {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;

  clearAccessToken();
  window.location.replace("/login");
}

function extractAccessToken(response: AuthResponse) {
  return (
    response.access_token ||
    response.accessToken ||
    response.token ||
    response.session?.access_token ||
    null
  );
}

function normalizeAuthResponse(payload: unknown): AuthResponse {
  const source = unwrapOne(payload, ["data", "auth"]);
  return (isRecord(source) ? source : payload) as AuthResponse;
}

async function parseJsonResponse(res: Response) {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  { token, requireAuth, headers, body, ...options }: ApiFetchOptions = {}
): Promise<T> {
  const accessToken = token ?? getStoredAccessToken();
  const isFormDataBody =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (requireAuth && !accessToken) {
    throw new ApiRequestError("Please sign in to continue.", 401);
  }

  let res: Response;

  try {
    res = await fetch(apiUrl(path), {
      ...options,
      body,
      headers: {
        ...(body && !isFormDataBody ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
    });
  } catch (error) {
    throw new ApiRequestError("No network. Check your connection and try again.", 0, error);
  }

  const payload = await parseJsonResponse(res);

  if (!res.ok) {
    const message = payloadMessage(payload) ?? res.statusText ?? `API error ${res.status}`;
    if (requireAuth && res.status === 401) {
      redirectToLoginOnAuthFailure();
    }

    throw new ApiRequestError(message, res.status, payload);
  }

  return payload as T;
}

function storeLocation(source: UnknownRecord) {
  const city = valueAsString(source.city);
  const state = valueAsString(source.state);
  const country = valueAsString(source.country);
  const explicit = valueAsString(source.location);
  const parts = [city, state || country].filter(Boolean);

  return explicit || parts.join(", ") || country;
}

function storeCategoryName(source: UnknownRecord) {
  const direct = valueAsString(source.category);
  const category = isRecord(source.category) ? source.category : source.storeCategory;

  if (direct) return direct;
  if (isRecord(category)) return valueAsString(category.name, "Store");

  return "Store";
}

function templateCode(source: UnknownRecord) {
  const direct = valueAsString(source.template);
  const template = isRecord(source.template) ? source.template : source.templateData;
  const code = isRecord(template) ? valueAsString(template.code) : "";

  return direct || code || "general_v1";
}

export function normalizeStore(input: unknown): Store {
  const source = isRecord(input) ? input : {};
  const category = isRecord(source.category) ? source.category : source.storeCategory;
  const template = isRecord(source.template) ? source.template : source.templateData;
  const location = isRecord(source.location) ? source.location : null;
  const count = isRecord(source._count) ? source._count : {};
  const products = Array.isArray(source.products)
    ? source.products.map(normalizeProduct)
    : undefined;

  return {
    ...(source as Partial<Store>),
    id: valueAsString(source.id),
    name: valueAsString(source.name, "Untitled Store"),
    slug: valueAsString(source.slug, valueAsString(source.id)),
    description: valueAsString(source.description) || null,
    logo: valueAsString(source.logo) || valueAsString(source.logoUrl) || null,
    banner: valueAsString(source.banner) || valueAsString(source.bannerUrl) || null,
    logoUrl: valueAsString(source.logoUrl) || valueAsString(source.logo) || null,
    bannerUrl: valueAsString(source.bannerUrl) || valueAsString(source.banner) || null,
    bannerText: valueAsString(source.bannerText) || null,
    primaryColor: valueAsString(source.primaryColor) || null,
    phone: valueAsString(source.phone),
    email: valueAsString(source.email) || null,
    address:
      valueAsString(source.address) ||
      valueAsString(source.storeAddress) ||
      valueAsString(source.store_address) ||
      null,
    storeAddress:
      valueAsString(source.storeAddress) ||
      valueAsString(source.store_address) ||
      valueAsString(source.address) ||
      null,
    city: valueAsString(source.city) || (location ? valueAsString(location.city) : null),
    state: valueAsString(source.state) || (location ? valueAsString(location.state) : null),
    country: valueAsString(source.country) || (location ? valueAsString(location.country) : null),
    locationId:
      valueAsString(source.locationId) ||
      (location ? valueAsString(location.id) : null),
    locationData: location ? (location as unknown as ProductLocation) : null,
    category: storeCategoryName(source),
    categoryId:
      valueAsString(source.categoryId) ||
      (isRecord(category) ? valueAsString(category.id) : null),
    storeCategory: isRecord(category) ? (category as unknown as StoreCategory) : null,
    location: storeLocation(source),
    template: templateCode(source),
    templateId:
      valueAsString(source.templateId) ||
      (isRecord(template) ? valueAsString(template.id) : null),
    templateData: isRecord(template) ? (template as unknown as Template) : null,
    templateConfig: isRecord(source.templateConfig) ? source.templateConfig : null,
    isActive: valueAsBoolean(source.isActive, true),
    isVerified: valueAsBoolean(source.isVerified, false),
    rating: valueAsNumber(source.rating, 0),
    productCount: valueAsNumber(
      source.productCount,
      valueAsNumber(count.products, products?.length ?? 0)
    ),
    storeViewCount: valueAsNumber(source.storeViewCount, valueAsNumber(count.storeViews)),
    products,
    createdAt: valueAsString(source.createdAt),
    updatedAt: valueAsString(source.updatedAt),
  };
}

export function normalizeProduct(input: unknown): Product {
  const source = isRecord(input) ? input : {};
  const images = Array.isArray(source.images)
    ? source.images.filter((image): image is string => typeof image === "string")
    : [];
  const category = isRecord(source.category) ? source.category : source.productCategory;
  const marketplaceCategory = isRecord(source.marketplaceCategory) ? source.marketplaceCategory : null;
  const location = isRecord(source.location) ? source.location : null;

  return {
    ...(source as Partial<Product>),
    id: valueAsString(source.id),
    name: valueAsString(source.name, "Untitled Product"),
    slug: valueAsString(source.slug),
    description: valueAsString(source.description) || null,
    price: valueAsNumber(source.price),
    condition: normalizeProductCondition(source.condition),
    currency: valueAsString(source.currency, "NGN"),
    images,
    imageUrl: valueAsString(source.imageUrl) || images[0] || null,
    storeId: valueAsString(source.storeId),
    store: isRecord(source.store) ? normalizeStore(source.store) : undefined,
    inStock: valueAsBoolean(source.inStock, true),
    isActive: valueAsBoolean(source.isActive, true),
    pushToMarketplace: valueAsBoolean(source.pushToMarketplace, true),
    isNegotiable: valueAsBoolean(source.isNegotiable, false),
    category:
      valueAsString(source.category) ||
      (isRecord(category) ? valueAsString(category.name) : "") ||
      (marketplaceCategory ? valueAsString(marketplaceCategory.name) : ""),
    categoryId:
      valueAsString(source.categoryId) ||
      (isRecord(category) ? valueAsString(category.id) : null),
    productCategory: isRecord(category) ? (category as unknown as ProductCategory) : null,
    marketplaceCategory: marketplaceCategory ? (marketplaceCategory as unknown as ProductCategory) : null,
    marketplaceCategoryId:
      valueAsString(source.marketplaceCategoryId) ||
      (marketplaceCategory ? valueAsString(marketplaceCategory.id) : null),
    locationId:
      valueAsString(source.locationId) ||
      (location ? valueAsString(location.id) : null),
    location: location ? (location as unknown as ProductLocation) : null,
    viewCount: valueAsNumber(source.viewCount),
    whatsappClickCount: valueAsNumber(source.whatsappClickCount),
    whatsappOrderLink: valueAsString(source.whatsappOrderLink),
    createdAt: valueAsString(source.createdAt),
    updatedAt: valueAsString(source.updatedAt),
  };
}

export function normalizeLocation(input: unknown): Location {
  const source = isRecord(input) ? input : {};

  return {
    id: valueAsString(source.id),
    city: valueAsString(source.city),
    state: valueAsString(source.state) || null,
    country: valueAsString(source.country) || null,
    lga: valueAsString(source.lga) || null,
    latitude: source.latitude === null ? null : valueAsNumber(source.latitude),
    longitude: source.longitude === null ? null : valueAsNumber(source.longitude),
  };
}

function unwrapArray<T>(payload: unknown, keys: string[], normalizer: (item: unknown) => T) {
  if (Array.isArray(payload)) return payload.map(normalizer);

  if (isRecord(payload)) {
    for (const key of keys) {
      const value = payload[key];
      if (Array.isArray(value)) return value.map(normalizer);
    }
  }

  return [];
}

function unwrapOne(payload: unknown, keys: string[]) {
  if (isRecord(payload)) {
    for (const key of keys) {
      const value = payload[key];
      if (value !== undefined && value !== null) return value;
    }
  }

  return payload;
}

function unwrapPaginated<T>(
  payload: unknown,
  keys: string[],
  normalizer: (item: unknown) => T
): PaginatedResponse<T> {
  const data = unwrapArray(payload, keys, normalizer);
  const source = isRecord(payload) ? payload : {};
  const pagination = isRecord(source.pagination) ? source.pagination : {};
  const meta = isRecord(source.meta) ? source.meta : {};
  const page = valueAsNumber(source.page, valueAsNumber(pagination.page, valueAsNumber(meta.page, 1)));
  const limit = valueAsNumber(
    source.limit,
    valueAsNumber(source.pageSize, valueAsNumber(pagination.limit, valueAsNumber(meta.limit, data.length)))
  );

  return {
    data,
    total: valueAsNumber(
      source.total,
      valueAsNumber(pagination.total, valueAsNumber(meta.total, data.length))
    ),
    page,
    limit,
    pageSize: limit,
    totalPages: valueAsNumber(source.totalPages, valueAsNumber(pagination.totalPages)),
  };
}

function storeQueryParams(params?: StoreQueryParams) {
  return {
    q: params?.q ?? params?.search,
    categoryId: params?.categoryId ?? params?.category,
    city: params?.city ?? params?.location,
    country: params?.country,
    isActive: params?.isActive,
    page: params?.page,
    limit: params?.limit ?? params?.pageSize,
  };
}

function productQueryParams(params?: ProductQueryParams) {
  const q = params?.q ?? params?.search;

  return {
    categoryId: params?.categoryId,
    storeId: params?.storeId,
    search: q,
    locationId: params?.locationId,
    city: params?.city,
    state: params?.state,
    minPrice: params?.minPrice,
    maxPrice: params?.maxPrice,
    inStock: params?.inStock,
    isActive: params?.isActive,
    page: params?.page,
    limit: params?.limit ?? params?.pageSize,
  };
}

function locationQueryParams(params?: LocationQueryParams) {
  return {
    q: params?.q ?? params?.search,
    state: params?.state,
    city: params?.city,
    country: params?.country,
    hasProducts: params?.hasProducts,
    page: params?.page,
    limit: params?.limit ?? params?.pageSize,
  };
}

function normalizeSellerAnalytics(input: unknown): SellerAnalytics {
  const source = isRecord(input) ? input : {};
  const activity = Array.isArray(source.recentActivity) ? source.recentActivity : [];

  return {
    totalProducts: valueAsNumber(source.totalProducts),
    storeViewsThisWeek: valueAsNumber(source.storeViewsThisWeek),
    whatsappClicks: valueAsNumber(source.whatsappClicks),
    recentActivity: activity.filter(isRecord).map((item) => ({
      id: valueAsString(item.id),
      type: typeof item.type === "string" ? item.type : null,
      createdAt: valueAsString(item.createdAt),
      product: isRecord(item.product)
        ? {
            id: valueAsString(item.product.id),
            name: valueAsString(item.product.name, "Product"),
            slug: valueAsString(item.product.slug),
          }
        : undefined,
      store: isRecord(item.store)
        ? {
            id: valueAsString(item.store.id),
            name: valueAsString(item.store.name, "Store"),
            slug: valueAsString(item.store.slug),
          }
        : undefined,
    })),
  };
}

export async function getProducts(
  params?: ProductQueryParams
): Promise<PaginatedResponse<Product>> {
  const payload = await apiFetch<unknown>(
    appendQuery("/api/products", productQueryParams(params))
  );

  return unwrapPaginated(payload, ["data", "products", "items"], normalizeProduct);
}

export async function getLocations(
  params?: LocationQueryParams
): Promise<PaginatedResponse<Location>> {
  const payload = await apiFetch<unknown>(
    appendQuery("/api/locations", locationQueryParams(params))
  );

  return unwrapPaginated(payload, ["data", "locations", "items"], normalizeLocation);
}

export async function healthCheck() {
  return apiFetch<unknown>("/api/health");
}

export async function register(input: RegisterInput) {
  const payload = await apiFetch<unknown>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const response = normalizeAuthResponse(payload);
  const token = extractAccessToken(response);
  if (token) setAccessToken(token);
  return response;
}

export async function login(input: LoginInput) {
  const payload = await apiFetch<unknown>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const response = normalizeAuthResponse(payload);
  const token = extractAccessToken(response);
  if (token) setAccessToken(token);
  return response;
}

export async function continueWithGoogle(input: GoogleAuthInput) {
  const payload = await apiFetch<unknown>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const response = normalizeAuthResponse(payload);
  const token = extractAccessToken(response);
  if (token) setAccessToken(token);
  return response;
}

export async function getMe(token?: string | null) {
  const payload = await apiFetch<unknown>("/api/me", { token, requireAuth: true });
  const response = unwrapOne(payload, ["data", "user", "profile"]) as UserProfile;

  return {
    ...response,
    stores: Array.isArray(response.stores) ? response.stores.map(normalizeStore) : [],
  };
}

export async function getSellerAnalytics() {
  const payload = await apiFetch<unknown>("/api/me/analytics", { requireAuth: true });
  return normalizeSellerAnalytics(unwrapOne(payload, ["data", "analytics"]));
}

export async function getMarketplaceStores(
  params?: StoreQueryParams
): Promise<PaginatedResponse<Store>> {
  const payload = await apiFetch<unknown>(
    appendQuery("/api/marketplace", storeQueryParams(params))
  );

  return unwrapPaginated(payload, ["data", "stores", "items"], normalizeStore);
}

export async function getStores(
  params?: StoreQueryParams
): Promise<PaginatedResponse<Store>> {
  const payload = await apiFetch<unknown>(
    appendQuery("/api/stores", storeQueryParams(params))
  );

  return unwrapPaginated(payload, ["data", "stores", "items"], normalizeStore);
}

export async function createStore(input: CreateStoreInput | FormData, token?: string | null) {
  const isFormDataInput = typeof FormData !== "undefined" && input instanceof FormData;
  const payload = await apiFetch<unknown>("/api/stores", {
    method: "POST",
    body: isFormDataInput ? input : JSON.stringify(input),
    token,
    requireAuth: true,
  });

  return normalizeStore(unwrapOne(payload, ["data", "store"]));
}

export async function checkStoreSlug(slug: string) {
  const payload = await apiFetch<unknown>(
    appendQuery("/api/stores/check-slug", { slug })
  );
  const result = unwrapOne(payload, ["data"]) as {
    slug?: string;
    exists?: boolean;
    available?: boolean;
  };

  return {
    slug: valueAsString(result.slug),
    exists: valueAsBoolean(result.exists),
    available: valueAsBoolean(result.available),
  };
}

export async function getStoreBySlug(slug: string): Promise<Store> {
  const payload = await apiFetch<unknown>(`/api/stores/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  return normalizeStore(unwrapOne(payload, ["data", "store"]));
}

export async function updateStore(
  slug: string,
  input: UpdateStoreInput | FormData,
  token?: string | null
) {
  const isFormDataInput = typeof FormData !== "undefined" && input instanceof FormData;
  const payload = await apiFetch<unknown>(`/api/stores/${encodeURIComponent(slug)}/edit`, {
    method: "PATCH",
    body: isFormDataInput ? input : JSON.stringify(input),
    token,
    requireAuth: true,
  });

  return normalizeStore(unwrapOne(payload, ["data", "store"]));
}

export async function deleteStore(slug: string, token?: string | null) {
  return apiFetch<unknown>(`/api/stores/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    token,
    requireAuth: true,
  });
}

export async function updateStoreTemplate(
  slug: string,
  templateId: string,
  token?: string | null
) {
  const payload = await apiFetch<unknown>(
    `/api/stores/${encodeURIComponent(slug)}/template`,
    {
      method: "PUT",
      body: JSON.stringify({ templateId }),
      token,
      requireAuth: true,
    }
  );

  return normalizeStore(unwrapOne(payload, ["data", "store"]));
}

export async function updateStoreTemplateConfig(
  slug: string,
  input: { templateId?: string; config?: Record<string, unknown> },
  token?: string | null
) {
  const payload = await apiFetch<unknown>(
    `/api/stores/${encodeURIComponent(slug)}/template`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
      token,
      requireAuth: true,
    }
  );

  return normalizeStore(unwrapOne(payload, ["data", "store"]));
}

export async function getProductsByStore(
  slug: string,
  params?: ProductQueryParams
): Promise<PaginatedResponse<Product>> {
  const payload = await apiFetch<unknown>(
    appendQuery(`/api/stores/${encodeURIComponent(slug)}/products`, productQueryParams(params))
  );

  return unwrapPaginated(payload, ["data", "products", "items"], normalizeProduct);
}

export async function getSellerProducts(
  params?: ProductQueryParams
): Promise<PaginatedResponse<Product>> {
  const payload = await apiFetch<unknown>(
    appendQuery("/api/me/products", productQueryParams(params)),
    { requireAuth: true }
  );

  return unwrapPaginated(payload, ["data", "products", "items"], normalizeProduct);
}

export async function getStoreProductBySlug(slug: string, productSlug: string) {
  const payload = await apiFetch<unknown>(
    `/api/stores/${encodeURIComponent(slug)}/products/${encodeURIComponent(productSlug)}`,
    { cache: "no-store" }
  );

  return normalizeProduct(unwrapOne(payload, ["data", "product"]));
}

export async function createSellerProduct(input: CreateProductInput | FormData, token?: string | null) {
  const isFormDataInput = typeof FormData !== "undefined" && input instanceof FormData;
  const payload = await apiFetch<unknown>("/api/me/products", {
    method: "POST",
    body: isFormDataInput ? input : JSON.stringify(input),
    token,
    requireAuth: true,
  });

  return normalizeProduct(unwrapOne(payload, ["data", "product"]));
}

export async function createProduct(
  slug: string,
  input: CreateProductInput,
  token?: string | null
) {
  const payload = await apiFetch<unknown>(
    `/api/stores/${encodeURIComponent(slug)}/products`,
    {
      method: "POST",
      body: JSON.stringify(input),
      token,
      requireAuth: true,
    }
  );

  return normalizeProduct(unwrapOne(payload, ["data", "product"]));
}

export async function getProduct(id: string) {
  const payload = await apiFetch<unknown>(`/api/products/${encodeURIComponent(id)}`);
  return normalizeProduct(unwrapOne(payload, ["data", "product"]));
}

export async function trackProductView(id: string) {
  return apiFetch<unknown>(`/api/products/${encodeURIComponent(id)}/view`, {
    method: "POST",
  });
}

export async function trackProductWhatsAppClick(id: string) {
  return apiFetch<unknown>(`/api/products/${encodeURIComponent(id)}/whatsapp-click`, {
    method: "POST",
  });
}

export async function trackStoreView(slug: string) {
  return apiFetch<unknown>(`/api/stores/${encodeURIComponent(slug)}/view`, {
    method: "POST",
  });
}

export async function getSellerProduct(id: string, token?: string | null) {
  const payload = await apiFetch<unknown>(`/api/me/products/${encodeURIComponent(id)}`, {
    token,
    requireAuth: true,
  });
  return normalizeProduct(unwrapOne(payload, ["data", "product"]));
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput | FormData,
  token?: string | null
) {
  const isFormDataInput = typeof FormData !== "undefined" && input instanceof FormData;
  const payload = await apiFetch<unknown>(`/api/me/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: isFormDataInput ? input : JSON.stringify(input),
    token,
    requireAuth: true,
  });

  return normalizeProduct(unwrapOne(payload, ["data", "product"]));
}

export async function deleteProduct(id: string, token?: string | null) {
  return apiFetch<unknown>(`/api/me/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
    requireAuth: true,
  });
}

export async function getStoreCategories() {
  const payload = await apiFetch<unknown>("/api/categories/stores");
  return unwrapArray(payload, ["data", "categories", "storeCategories"], (item) => item as StoreCategory);
}

export async function createStoreCategory(input: CreateCategoryInput, token?: string | null) {
  return apiFetch<StoreCategory>("/api/categories/stores", {
    method: "POST",
    body: JSON.stringify(input),
    token,
    requireAuth: true,
  });
}

export async function updateStoreCategory(
  id: string,
  input: UpdateCategoryInput,
  token?: string | null
) {
  return apiFetch<StoreCategory>(`/api/categories/stores/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    token,
    requireAuth: true,
  });
}

export async function deleteStoreCategory(id: string, token?: string | null) {
  return apiFetch<unknown>(`/api/categories/stores/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
    requireAuth: true,
  });
}

export async function getProductCategories(storeId?: string) {
  const payload = await apiFetch<unknown>(appendQuery("/api/categories/products", { storeId }));
  return unwrapArray(payload, ["data", "categories", "productCategories"], (item) => item as ProductCategory);
}

export async function createProductCategory(input: CreateCategoryInput, token?: string | null) {
  return apiFetch<ProductCategory>("/api/categories/products", {
    method: "POST",
    body: JSON.stringify(input),
    token,
    requireAuth: true,
  });
}

export async function updateProductCategory(
  id: string,
  input: UpdateCategoryInput,
  token?: string | null
) {
  return apiFetch<ProductCategory>(`/api/categories/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    token,
    requireAuth: true,
  });
}

export async function deleteProductCategory(id: string, token?: string | null) {
  return apiFetch<unknown>(`/api/categories/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
    requireAuth: true,
  });
}

export async function getTemplates(type?: TemplateType) {
  const payload = await apiFetch<unknown>(appendQuery("/api/templates", { type }));
  return unwrapArray(payload, ["data", "templates", "items"], (item) => item as Template);
}

export async function createTemplate(input: CreateTemplateInput, token?: string | null) {
  return apiFetch<Template>("/api/templates", {
    method: "POST",
    body: JSON.stringify(input),
    token,
    requireAuth: true,
  });
}

export async function getTemplate(code: string) {
  const payload = await apiFetch<unknown>(`/api/templates/${encodeURIComponent(code)}`);
  return unwrapOne(payload, ["data", "template"]) as Template;
}

export async function updateTemplate(
  code: string,
  input: UpdateTemplateInput,
  token?: string | null
) {
  const payload = await apiFetch<unknown>(`/api/templates/${encodeURIComponent(code)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    token,
    requireAuth: true,
  });
  return unwrapOne(payload, ["data", "template"]) as Template;
}

export async function getCurrentLocation(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "marketplace-app/1.0",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Reverse geocoding failed: ${res.status}`);
    }

    const data = await res.json();

 return {
  displayName: data.display_name || "",
  city:
    data.address?.city ||
    data.address?.town ||
    data.address?.village ||
    data.address?.suburb ||
    data.address?.city_district ||
    "",

  state: data.address?.state || data.address?.state_district || "",
  country: data.address?.country || "",
  raw: data,
};
  } catch (error) {
    console.error("getCurrentLocation error:", error);
    return null;
  }
}

export const swrFetcher = async <T>(url: string) => apiFetch<T>(url);

export function buildWhatsAppLink(
  phone: string,
  productName: string,
  price: number,
  currency = "NGN",
  apiWhatsappOrderLink?: string
): string {
  if (apiWhatsappOrderLink) return apiWhatsappOrderLink;

  const text = encodeURIComponent(
    `Hi! I want to order *${productName}* - ${currency} ${price.toLocaleString("en-NG")}`
  );
  const cleaned = phone.replace(/\D/g, "");
  return `https://wa.me/${cleaned}?text=${text}`;
}

export function formatPrice(price: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatProductCondition(condition?: string | null) {
  if (condition === "NEW") return "New";
  if (condition === "USED") return "Used";
  if (condition === "REFURBISHED") return "Refurbished";
  return condition || "";
}
