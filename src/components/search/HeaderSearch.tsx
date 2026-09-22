"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/Icons";

export type EventSearchHit = {
  id: string;
  title: string;
  image: string;
  venue: string;
  city: string;
  date: string;
};

const DEBOUNCE_MS = 350;
const MIN_QUERY = 2;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function useEventSearch(query: string) {
  const debounced = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const [results, setResults] = useState<EventSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const seq = useRef(0);

  useEffect(() => {
    if (debounced.length < MIN_QUERY) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    const id = ++seq.current;
    setLoading(true);
    setError("");

    void fetch(
      `/api/events/search?q=${encodeURIComponent(debounced)}&perPage=50`,
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Search failed");
        const json = (await res.json()) as { results?: EventSearchHit[] };
        if (id !== seq.current) return;
        setResults(Array.isArray(json.results) ? json.results : []);
      })
      .catch(() => {
        if (id !== seq.current) return;
        setResults([]);
        setError("Couldn’t search right now. Try again.");
      })
      .finally(() => {
        if (id === seq.current) setLoading(false);
      });
  }, [debounced]);

  return { results, loading, error, debounced };
}

function SearchResultRow({
  hit,
  onNavigate,
}: {
  hit: EventSearchHit;
  onNavigate?: () => void;
}) {
  const meta = [hit.date, hit.venue || hit.city].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/events/${hit.id}`}
      onClick={onNavigate}
      className="flex gap-3 rounded-xl px-2 py-2.5 no-underline transition hover:bg-accent-tint"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-line">
        <Image
          src={hit.image}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold text-ink">
          {hit.title}
        </div>
        {meta ? (
          <div className="mt-0.5 truncate text-[12px] text-ink-soft">{meta}</div>
        ) : null}
      </div>
    </Link>
  );
}

/**
 * Full-screen event search — opened from the header magnifying glass.
 * Debounced Typesense search (≥2 chars), suggestion rows → event detail.
 */
export function EventSearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, loading, error, debounced } = useEventSearch(query);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const showEmpty =
    debounced.length >= MIN_QUERY && !loading && !error && results.length === 0;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-bg">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-line bg-white px-3.5 py-2.5">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-soft" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-soft"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto w-full max-w-[720px] flex-1 overflow-y-auto px-4 py-3 lg:px-8">
        {query.trim().length > 0 && query.trim().length < MIN_QUERY ? (
          <p className="px-2 py-6 text-[13px] text-ink-soft">
            Type at least 2 characters to search.
          </p>
        ) : null}

        {loading ? (
          <p className="px-2 py-6 text-[13px] text-ink-soft">Searching…</p>
        ) : null}

        {error ? (
          <p className="px-2 py-6 text-[13px] text-accent-deep">{error}</p>
        ) : null}

        {showEmpty ? (
          <p className="px-2 py-6 text-[13px] text-ink-soft">
            No events match “{debounced}”.
          </p>
        ) : null}

        {results.length > 0 ? (
          <div className="flex flex-col">
            {results.map((hit) => (
              <SearchResultRow key={hit.id} hit={hit} onNavigate={onClose} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Header magnifying glass — opens the event search overlay. */
export default function HeaderSearch({
  className = "",
  iconClassName = "h-5 w-5 text-ink",
}: {
  className?: string;
  iconClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search events"
        className={`flex items-center justify-center ${className}`}
      >
        <SearchIcon className={iconClassName} />
      </button>
      <EventSearchOverlay open={open} onClose={close} />
    </>
  );
}

/**
 * Inline sticky search for the /events browse page — same API as the overlay.
 */
export function EventsPageSearch() {
  const [query, setQuery] = useState("");
  const { results, loading, error, debounced } = useEventSearch(query);
  const showPanel = query.trim().length >= MIN_QUERY;

  return (
    <div className="relative">
      <div className="flex items-center gap-2.5 rounded-full border border-line bg-white px-3.5 py-2.5">
        <SearchIcon className="h-4 w-4 shrink-0 text-ink-soft" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-soft"
        />
      </div>

      {showPanel ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-30 max-h-[min(60vh,420px)] overflow-y-auto rounded-2xl border border-line bg-bg p-2 shadow-[0_18px_40px_-12px_rgba(30,26,22,0.28)]">
          {loading ? (
            <p className="px-2 py-4 text-[13px] text-ink-soft">Searching…</p>
          ) : null}
          {error ? (
            <p className="px-2 py-4 text-[13px] text-accent-deep">{error}</p>
          ) : null}
          {!loading && !error && results.length === 0 ? (
            <p className="px-2 py-4 text-[13px] text-ink-soft">
              No events match “{debounced}”.
            </p>
          ) : null}
          {results.map((hit) => (
            <SearchResultRow key={hit.id} hit={hit} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
