"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, X, MapPin, ChevronRight, Check, Globe } from "lucide-react";
import Dialog from "./Dialog";
import { getLocations } from "@/lib/api";

interface SearchBarProps {
  value?: string;
  onChange: (value: string) => void;
  onLocationChange?: (value: LocationSelection | null) => void;
  placeholder?: string;
  className?: string;
}

type SelectionMode = "states" | "cities";
export type LocationSelection =
  | { type: "state"; state: string }
  | { type: "city"; state: string; city: string; id: string };

export default function SearchBar({
  value = "",
  onChange,
  onLocationChange,
  placeholder = "Search stores, products...",
  className = "",
}: SearchBarProps) {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [local, setLocal] = useState(value);
  const [open, setOpen] = useState(false);

  const [mode, setMode] = useState<SelectionMode>("states");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<LocationSelection | null>(null);
  const [locationLabel, setLocationLabel] = useState("All Nigeria");

  // ================= SEARCH INPUT SYNC =================
  useEffect(() => {
    const t = setTimeout(() => onChange(local), 350);
    return () => clearTimeout(t);
  }, [local, onChange]);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  // ================= FETCH LOCATIONS =================
  useEffect(() => {
    if (!open) return;
    if (locations.length > 0) return;

    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await getLocations({ country: "Nigeria", hasProducts: true, limit: 100 });
        setLocations(res.data);
      } catch (err) {
        console.error("Failed to load locations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [open]);

  // ================= GROUP BY STATE =================
  const grouped = useMemo(() => {
    return locations.reduce((acc: Record<string, any[]>, loc: any) => {
      if (!acc[loc.state]) acc[loc.state] = [];
      acc[loc.state].push(loc);
      return acc;
    }, {});
  }, [locations]);

  const states = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setMode("states");
    setSelectedState(null);
  }, []);

  const handleSelectAllNigeria = useCallback(() => {
    setSelectedValue(null);
    setLocationLabel("All Nigeria");
    onLocationChange?.(null);
    handleClose();
  }, [onLocationChange, handleClose]);

  const handleSelectState = useCallback((state: string) => {
    setSelectedState(state);
    setMode("cities");
  }, []);

  const handleSelectAllState = useCallback(
    (state: string) => {
      const val: LocationSelection = { type: "state", state };
      setSelectedValue(val);
      setLocationLabel(`All ${state}`);
      onLocationChange?.(val);
      handleClose();
    },
    [onLocationChange, handleClose]
  );

  const handleSelectCity = useCallback(
    (loc: any) => {
      const val: LocationSelection = {
        type: "city",
        state: selectedState ?? "",
        city: loc.city,
        id: loc.id,
      };
      setSelectedValue(val);
      setLocationLabel(`${loc.city}, ${selectedState}`);
      onLocationChange?.(val);
      handleClose();
    },
    [onLocationChange, handleClose, selectedState]
  );

  const handleBackToStates = useCallback(() => {
    setMode("states");
    setSelectedState(null);
  }, []);

  return (
    <div className={`flex items-center gap-3 ${className}`}>

      {/* ================= LOCATION BUTTON (standalone, left) ================= */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs font-medium text-zinc-700 shadow-sm hover:border-primary/40 hover:text-primary transition-all shrink-0 max-w-[10rem] h-full"
        title={locationLabel}
      >
        <MapPin className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate">{locationLabel}</span>
      </button>

      {/* ================= SEARCH INPUT (right) ================= */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none z-10" />

        <input
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-primary/20 bg-white py-3 pl-11 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        {local && (
          <button
            onClick={() => {
              setLocal("");
              onChange("");
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ================= DIALOG ================= */}
      <Dialog
        open={open}
        onClose={handleClose}
        title={
          mode === "cities" && selectedState
            ? `${selectedState} — Select City`
            : "Select Location"
        }
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-zinc-500">Loading locations…</p>
          </div>
        ) : (
          <div className="flex flex-col" style={{ height: 480 }}>

            {/* ── STATES VIEW ── */}
            {mode === "states" && (
              <>
                {/* All Nigeria option */}
                <button
                  onClick={handleSelectAllNigeria}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-100 hover:bg-primary/5 transition-colors group/allng"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Globe className="h-4 w-4" />
                  </span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-zinc-800 group-hover/allng:text-primary transition-colors">
                      All Nigeria
                    </p>
                    <p className="text-xs text-zinc-400">Browse from everywhere</p>
                  </div>
                  {!selectedValue && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>

                {/* States label */}
                <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Select a State
                  </p>
                  <span className="text-xs text-zinc-400">{states.length} states</span>
                </div>

                {/* States grid */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
                  <div className="grid grid-cols-3 gap-2">
                    {states.map((state) => {
                      const isActive = selectedValue?.state === state;
                      return (
                        <button
                          key={state}
                          onClick={() => handleSelectState(state)}
                          className={`relative flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5 ${
                            isActive
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-zinc-200 bg-white"
                          }`}
                        >
                          <span className="text-sm font-medium text-zinc-800 leading-tight">
                            {state}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {grouped[state]?.length ?? 0} cities
                          </span>
                          {isActive && (
                            <span className="absolute top-2 right-2">
                              <Check className="h-3 w-3 text-primary" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ── CITIES VIEW ── */}
            {mode === "cities" && selectedState && (
              <>
                {/* Back + breadcrumb */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-100">
                  <button
                    onClick={handleBackToStates}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-primary transition-colors font-medium"
                  >
                    <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                    States
                  </button>
                  <span className="text-zinc-300">/</span>
                  <span className="text-xs font-semibold text-zinc-700">{selectedState}</span>
                </div>

                {/* All [State] option */}
                <button
                  onClick={() => handleSelectAllState(selectedState)}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-100 hover:bg-primary/5 transition-colors group/allstate"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-zinc-800 group-hover/allstate:text-primary transition-colors">
                      All {selectedState}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Browse all cities in {selectedState}
                    </p>
                  </div>
                  {selectedValue?.type === "state" &&
                    selectedValue?.state === selectedState && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                </button>

                {/* Cities label */}
                <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Cities in {selectedState}
                  </p>
                  <span className="text-xs text-zinc-400">
                    {grouped[selectedState]?.length ?? 0} cities
                  </span>
                </div>

                {/* Cities grid */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
                  <div className="grid grid-cols-3 gap-2">
                    {(grouped[selectedState] ?? []).map((loc: any) => {
                      const isActive =
                        selectedValue?.type === "city" &&
                        selectedValue?.id === loc.id;
                      return (
                        <button
                          key={loc.id}
                          onClick={() => handleSelectCity(loc)}
                          className={`relative flex items-start rounded-xl border px-3 py-2.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5 ${
                            isActive
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-zinc-200 bg-white"
                          }`}
                        >
                          <span className="text-sm font-medium text-zinc-800 leading-tight">
                            {loc.city}
                          </span>
                          {isActive && (
                            <span className="absolute top-2 right-2">
                              <Check className="h-3 w-3 text-primary" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

          </div>
        )}
      </Dialog>
    </div>
  );
}
