"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { City } from "@/lib/api";

/**
 * Searchable city picker — mirrors the app's DropDownSelection (label=name, value=id).
 */
export default function CityPicker({
  cities,
  value,
  onChange,
  onRetry,
  loading = false,
  error = false,
}: {
  cities: City[];
  value: string;
  onChange: (cityId: string) => void;
  onRetry?: () => void;
  loading?: boolean;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = cities.find((c) => c.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.name.toLowerCase().includes(q));
  }, [cities, query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (error) {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-left text-[14px] text-[#C23B3B]"
      >
        Could not load cities. Tap to retry.
      </button>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => !loading && setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-full border border-line bg-white px-4 py-2.5 text-left text-[14px] text-ink"
      >
        <span className={selected ? "text-ink" : "text-ink-soft"}>
          {loading
            ? "Loading cities…"
            : selected?.name ?? "Select your city"}
        </span>
        <span className="text-ink-soft" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl border border-line bg-bg shadow-[0_18px_40px_-12px_rgba(30,26,22,0.28)]">
          <div className="border-b border-line p-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              autoFocus
              className="w-full rounded-full border border-line bg-white px-3.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-[13px] text-ink-soft">No cities found</li>
            ) : (
              filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full px-4 py-2.5 text-left text-[14px] transition hover:bg-accent-tint ${
                      c.id === value ? "font-semibold text-accent-deep" : "text-ink"
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
