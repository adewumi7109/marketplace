export type TemplateType =
  | "STORE"
  | "CHURCH"
  | "TEAM"
  | "PORTFOLIO"
  | "RESTAURANT";

export type TemplateCode =
  | "fashion_v1"
  | "food_v1"
  | "electronics_v1"
  | "general_v1"
  | "church_v1"
  | "team_v1"
  | "sports_v1"
  | string;

export interface StoreCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  isActive?: boolean;
  storeCount?: number;
  productCount?: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  slug?: string | null;
  storeId?: string | null;
  isActive?: boolean;
  storeCount?: number;
  productCount?: number;
}

export type Category = StoreCategory | ProductCategory;

export interface ProductLocation {
  id: string;
  city: string;
  state?: string | null;
  country?: string | null;
  lga?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type Location = ProductLocation;

export type ProductCondition = "NEW" | "USED" | "REFURBISHED";

export interface Template {
  id?: string;
  name: string;
  code: string;
  type: TemplateType;
  description?: string | null;
  previewUrl?: string | null;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  bannerText?: string | null;
  primaryColor?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  storeAddress?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  locationId?: string | null;
  locationData?: ProductLocation | null;
  category: string;
  categoryId?: string | null;
  storeCategory?: StoreCategory | null;
  location: string;
  template: TemplateCode;
  templateId?: string | null;
  templateData?: Template | null;
  templateConfig?: Record<string, unknown> | null;
  isActive?: boolean;
  isVerified?: boolean;
  rating?: number;
  productCount?: number;
  storeViewCount?: number;
  products?: Product[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  comparePrice?: number;
  condition?: ProductCondition | null;
  currency?: string;
  images?: string[];
  imageUrl?: string | null;
  storeId?: string;
  store?: Store;
  inStock?: boolean;
  isActive?: boolean;
  pushToMarketplace?: boolean;
  isNegotiable?: boolean;
  category?: string;
  categoryId?: string | null;
  productCategory?: ProductCategory | null;
  marketplaceCategory?: ProductCategory | null;
  marketplaceCategoryId?: string | null;
  locationId?: string | null;
  location?: ProductLocation | null;
  viewCount?: number;
  whatsappClickCount?: number;
  whatsappOrderLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name?: string | null;
  email: string;
  role?: string;
  stores?: Store[];
  createdAt?: string;
}

export interface AuthResponse {
  user?: UserProfile;
  profile?: UserProfile;
  access_token?: string;
  accessToken?: string;
  token?: string;
  session?: {
    access_token?: string;
    refresh_token?: string;
  };
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleAuthInput {
  idToken?: string;
  token?: string;
  accessToken?: string;
  access_token?: string;
  nonce?: string;
}

export interface CreateStoreInput {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  banner?: string;
  bannerText?: string;
  primaryColor?: string;
  phone: string;
  email?: string;
  address?: string;
  storeAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  locationId?: string;
  categoryId?: string;
  templateId?: string;
}

export type UpdateStoreInput = Partial<CreateStoreInput> & {
  isActive?: boolean;
};

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  condition: ProductCondition;
  images?: string[];
  inStock?: boolean;
  isNegotiable?: boolean;
  pushToMarketplace?: boolean;
  categoryId?: string;
  marketplaceCategoryId?: string;
  locationId?: string;
  storeId?: string;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface CreateCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  storeId?: string;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface CreateTemplateInput {
  name: string;
  code: string;
  type: TemplateType;
  description?: string;
  previewUrl?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export type UpdateTemplateInput = Partial<Omit<CreateTemplateInput, "code" | "type">>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageSize: number;
  totalPages?: number;
}

export interface SellerActivity {
  id: string;
  type?: string | null;
  createdAt?: string;
  product?: {
    id: string;
    name: string;
    slug?: string | null;
  };
  store?: {
    id: string;
    name: string;
    slug?: string | null;
  };
}

export interface SellerAnalytics {
  totalProducts: number;
  storeViewsThisWeek: number;
  whatsappClicks: number;
  recentActivity: SellerActivity[];
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface StoreQueryParams {
  q?: string;
  search?: string;
  categoryId?: string;
  category?: string;
  city?: string;
  country?: string;
  location?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  pageSize?: number;
}

export interface ProductQueryParams {
  q?: string;
  categoryId?: string;
  storeId?: string;
  search?: string;
  locationId?: string;
  city?: string;
  state?: string;
  country?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  inStock?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
  pageSize?: number;
}

export interface LocationQueryParams {
  q?: string;
  search?: string;
  state?: string;
  city?: string;
  country?: string;
  lga?: string;
  hasProducts?: boolean;
  page?: number;
  limit?: number;
  pageSize?: number;
}

export interface CreateLocationInput {
  city: string;
  state: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}
