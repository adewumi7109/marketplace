"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Globe, MapPin, SlidersHorizontal, X } from "lucide-react";
import Dialog from "./Dialog";
import { getLocations } from "@/lib/api";
import type { Category } from "@/lib/types";
import type { LocationSelection } from "./SearchBar";

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string;
  selectedLocation?: LocationSelection | null;
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (category: Category | null) => void;
  onLocationChange?: (location: LocationSelection | null) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onClear: () => void;
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  selectedLocation = null,
  minPrice,
  maxPrice,
  onCategoryChange,
  onLocationChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClear,
}: FilterSidebarProps) {
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [mode, setMode] = useState<"states" | "cities">("states");
  const hasFilters = selectedCategory || selectedLocation || minPrice || maxPrice;

  useEffect(() => {
    if (!locationOpen || locations.length > 0) return;

    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const res = await getLocations({ country: "Nigeria", hasProducts: true, limit: 100 });
        setLocations(res.data);
      } catch (err) {
        console.error("Failed to load locations", err);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [locationOpen, locations.length]);

  const groupedLocations = useMemo(() => {
    return locations.reduce((acc: Record<string, any[]>, loc: any) => {
      if (!loc.state) return acc;
      if (!acc[loc.state]) acc[loc.state] = [];
      acc[loc.state].push(loc);
      return acc;
    }, {});
  }, [locations]);

  const states = useMemo(() => Object.keys(groupedLocations).sort(), [groupedLocations]);

  const locationLabel = selectedLocation
    ? selectedLocation.type === "city"
      ? `${selectedLocation.city}, ${selectedLocation.state}`
      : `All ${selectedLocation.state}`
    : "All Nigeria";

  const closeLocation = useCallback(() => {
    setLocationOpen(false);
    setMode("states");
    setSelectedState(null);
  }, []);

  const selectLocation = useCallback(
    (location: LocationSelection | null) => {
      onLocationChange?.(location);
      closeLocation();
    },
    [closeLocation, onLocationChange]
  );

  return (
    <aside className="w-full shrink-0 space-y-5 lg:w-60">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-800">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          Filters
        </div>

        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-primary transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {onLocationChange && (
        <div>
          <button
            type="button"
            onClick={() => setLocationOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg border border-primary/20 bg-white px-3 py-2.5 text-left text-sm transition hover:border-primary/40 hover:bg-primary/5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Location
              </span>
              <span className="block truncate font-medium text-zinc-800">{locationLabel}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </button>

          <Dialog
            open={locationOpen}
            onClose={closeLocation}
            title={mode === "cities" && selectedState ? `${selectedState} - Select City` : "Select Location"}
          >
            {loadingLocations ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-zinc-500">Loading locations...</p>
              </div>
            ) : (
              <div className="flex max-h-[68vh] min-h-[360px] flex-col sm:h-[480px]">
                {mode === "states" && (
                  <>
                    <button
                      onClick={() => selectLocation(null)}
                      className="flex items-center gap-3 border-b border-zinc-100 px-5 py-3.5 text-left transition-colors hover:bg-primary/5"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Globe className="h-4 w-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-zinc-800">All Nigeria</span>
                        <span className="block text-xs text-zinc-400">Browse from everywhere</span>
                      </span>
                      {!selectedLocation && <Check className="h-4 w-4 text-primary" />}
                    </button>

                    <div className="px-5 pb-2 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                        Select a State
                      </p>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {states.map((state) => (
                          <button
                            key={state}
                            onClick={() => {
                              setSelectedState(state);
                              setMode("cities");
                            }}
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-zinc-800 transition hover:border-primary/40 hover:bg-primary/5"
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {mode === "cities" && selectedState && (
                  <>
                    <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
                      <button
                        onClick={() => {
                          setMode("states");
                          setSelectedState(null);
                        }}
                        className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition hover:text-primary"
                      >
                        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                        States
                      </button>
                      <span className="text-zinc-300">/</span>
                      <span className="text-xs font-semibold text-zinc-700">{selectedState}</span>
                    </div>

                    <button
                      onClick={() => selectLocation({ type: "state", state: selectedState })}
                      className="flex items-center gap-3 border-b border-zinc-100 px-5 py-3.5 text-left transition-colors hover:bg-primary/5"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-zinc-800">All {selectedState}</span>
                        <span className="block text-xs text-zinc-400">Browse all cities in {selectedState}</span>
                      </span>
                    </button>

                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {(groupedLocations[selectedState] ?? []).map((loc: any) => (
                          <button
                            key={loc.id}
                            onClick={() =>
                              selectLocation({
                                type: "city",
                                state: selectedState,
                                city: loc.city,
                                id: loc.id,
                              })
                            }
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-zinc-800 transition hover:border-primary/40 hover:bg-primary/5"
                          >
                            {loc.city}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </Dialog>
        </div>
      )}

      {/* Categories */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          Category
        </p>

        <div className="max-h-72 space-y-1 overflow-y-auto pr-1 lg:max-h-none lg:overflow-visible lg:pr-0">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
              !selectedCategory
                ? "bg-primary/10 text-primary font-medium"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-primary/10"
            }`}
          >
            All Categories
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-primary/10"
              }`}
            >
              <span className="flex items-center gap-2">
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </span>

              {(cat.storeCount !== undefined ||
                cat.productCount !== undefined) && (
                <span className="text-xs text-zinc-500">
                  {cat.productCount ?? cat.storeCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          Price
        </p>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-zinc-500">
              Min price
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
              placeholder="0"
              className="h-10 w-full rounded-lg border border-primary/20 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-zinc-500">
              Max price
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              placeholder="Any"
              className="h-10 w-full rounded-lg border border-primary/20 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
            />
          </label>
        </div>
      </div>
    </aside>
  );
}
