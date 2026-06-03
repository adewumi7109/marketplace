import type { LocationSelection } from "@/components/SearchBar";
import { slugify } from "@/lib/slug";

const FILTER_QUERY_KEYS = ["query", "q", "minPrice", "maxPrice"];
const LOCATION_QUERY_KEYS = ["city", "state", "location", "category"];

export function locationPathSlug(location: LocationSelection) {
  return slugify(location.type === "city" ? location.city : location.state);
}

export function filterQueryString(
  searchParams: URLSearchParams | string,
  next: Record<string, string | undefined> = {}
) {
  const source = typeof searchParams === "string" ? new URLSearchParams(searchParams) : searchParams;
  const params = new URLSearchParams();

  FILTER_QUERY_KEYS.forEach((key) => {
    const value = source.get(key);
    if (value) params.set(key, value);
  });

  Object.entries(next).forEach(([key, value]) => {
    if (value) params.set(key, value);
    else params.delete(key);
  });

  return params.toString();
}

export function legacyLocationFromQuery(searchParams: URLSearchParams) {
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";

  if (city) return slugify(city);
  if (state) return slugify(state);
  return "";
}

export function hasLocationQuery(searchParams: URLSearchParams) {
  return LOCATION_QUERY_KEYS.some((key) => searchParams.has(key));
}
