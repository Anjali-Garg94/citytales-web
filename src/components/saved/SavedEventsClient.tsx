"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import {
  BookmarkIcon,
  ClockIcon,
  PinIcon,
  ShareIcon,
} from "@/components/Icons";

type SavedRow = {
  id: string;
  title: string;
  image: string;
  venue: string;
  city: string;
  startTimeLabel?: string;
  urgencyChip?: string;
};

type DateGroup = {
  dateKey: string;
  label: string;
  today: boolean;
  events: SavedRow[];
};

type StatusFilter = "active" | "expired";

function SkeletonCard() {
  return (
    <div className="flex animate-pulse gap-3.5">
      <div className="h-[84px] w-[84px] shrink-0 rounded-[12px] bg-[#EFEFEF]" />
      <div className="flex-1 py-1">
        <div className="h-3 w-16 rounded bg-[#EFEFEF]" />
        <div className="mt-2 h-4 w-[80%] rounded bg-[#EFEFEF]" />
        <div className="mt-2 h-3 w-[55%] rounded bg-[#EFEFEF]" />
      </div>
    </div>
  );
}

async function shareEvent(event: SavedRow) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${event.id}`
      : "";
  try {
    if (navigator.share) {
      await navigator.share({ title: event.title, url });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      window.alert("Link copied");
    }
  } catch {
    // cancelled
  }
}

function SavedEventRow({
  event,
  ended = false,
}: {
  event: SavedRow;
  ended?: boolean;
}) {
  const place = [event.venue, event.city].filter(Boolean).join(", ");

  return (
    <div className="flex gap-3.5">
      <Link
        href={`/events/${event.id}`}
        className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[12px] bg-[#F4F3F1] no-underline"
      >
        <Image
          src={event.image}
          alt=""
          fill
          sizes="84px"
          className={`object-cover ${ended ? "opacity-55" : ""}`}
        />
        {ended ? (
          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            Ended
          </span>
        ) : null}
      </Link>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/events/${event.id}`} className="min-w-0 no-underline">
            {event.urgencyChip && !ended ? (
              <span className="inline-block rounded-full bg-[#FFF1E0] px-2 py-0.5 text-[10px] font-semibold tracking-[0.02em] text-[#C46A1B]">
                {event.urgencyChip}
              </span>
            ) : null}
            <div
              className={`line-clamp-2 text-[15px] leading-[1.3] font-semibold text-ink ${
                event.urgencyChip && !ended ? "mt-0.5" : ""
              }`}
            >
              {event.title}
            </div>
          </Link>
          <button
            type="button"
            onClick={() => void shareEvent(event)}
            aria-label="Share event"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-[#F4F3F1] hover:text-ink"
          >
            <ShareIcon className="h-4 w-4" />
          </button>
        </div>

        {event.startTimeLabel ? (
          <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#8A8A8A]">
            <ClockIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.startTimeLabel}</span>
          </div>
        ) : null}
        {place ? (
          <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[#8A8A8A]">
            <PinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{place}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Saved Events — Active (grouped by day) / Expired (paginated flat list).
 * Mirrors the app FavouriteEvents flow.
 */
export default function SavedEventsClient() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [status, setStatus] = useState<StatusFilter>("active");
  const [filterOpen, setFilterOpen] = useState(false);

  const [groups, setGroups] = useState<DateGroup[]>([]);
  const [activeTotal, setActiveTotal] = useState(0);

  const [expired, setExpired] = useState<SavedRow[]>([]);
  const [expiredTotal, setExpiredTotal] = useState(0);
  const [expiredPage, setExpiredPage] = useState(0);
  const [expiredLast, setExpiredLast] = useState(true);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  const pullStartY = useRef<number | null>(null);
  const pullDistanceRef = useRef(0);
  const refreshingRef = useRef(false);
  const loadingRef = useRef(false);

  const PULL_THRESHOLD = 72;
  const PULL_MAX = 112;

  const cityId = user?.cityId || "";

  useEffect(() => {
    refreshingRef.current = refreshing;
  }, [refreshing]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  /** Session is gone after failed refresh — clear client auth and go to login. */
  async function handleAuthExpired() {
    try {
      await logout();
    } catch {
      // cookies may already be cleared by the API
    }
    router.replace("/login");
  }

  const fetchActive = useCallback(async () => {
    const res = await fetch(
      `/api/user/saved-events/grouped?cityId=${encodeURIComponent(cityId)}`,
      { cache: "no-store" },
    );
    if (res.status === 401) {
      await handleAuthExpired();
      return;
    }
    const data = (await res.json()) as {
      groups?: DateGroup[];
      totalEvents?: number;
      message?: string;
    };
    if (!res.ok) throw new Error(data.message || "Could not load saved events");
    setGroups(Array.isArray(data.groups) ? data.groups : []);
    setActiveTotal(
      typeof data.totalEvents === "number" ? data.totalEvents : 0,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId, router]);

  const fetchExpired = useCallback(
    async (page: number, append: boolean) => {
      const res = await fetch(
        `/api/user/saved-events?cityId=${encodeURIComponent(
          cityId,
        )}&page=${page}&size=50&status=EXPIRED`,
        { cache: "no-store" },
      );
      if (res.status === 401) {
        await handleAuthExpired();
        return;
      }
      const data = (await res.json()) as {
        events?: SavedRow[];
        totalElements?: number;
        last?: boolean;
        page?: number;
        message?: string;
      };
      if (!res.ok) throw new Error(data.message || "Could not load saved events");
      const next = Array.isArray(data.events) ? data.events : [];
      setExpired((prev) => (append ? [...prev, ...next] : next));
      setExpiredTotal(
        typeof data.totalElements === "number" ? data.totalElements : next.length,
      );
      setExpiredLast(data.last !== false);
      setExpiredPage(typeof data.page === "number" ? data.page : page);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cityId, router],
  );

  const load = useCallback(
    async (mode: StatusFilter, opts?: { soft?: boolean }) => {
      if (!opts?.soft) setLoading(true);
      setError("");
      try {
        if (mode === "active") {
          await fetchActive();
        } else {
          await fetchExpired(0, false);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load saved events");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchActive, fetchExpired],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    void load(status);
    // Intentionally keyed on status + user — load is stable enough per cityId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id, user?.cityId, status]);

  function switchStatus(next: StatusFilter) {
    if (next === status) {
      setFilterOpen(false);
      return;
    }
    setFilterOpen(false);
    setStatus(next);
    setGroups([]);
    setExpired([]);
  }

  async function onRefresh() {
    if (refreshingRef.current || loadingRef.current) return;
    setRefreshing(true);
    await load(status, { soft: true });
  }

  useEffect(() => {
    function atTop() {
      return (
        (typeof window !== "undefined" ? window.scrollY : 0) <= 2 &&
        (document.documentElement.scrollTop || document.body.scrollTop) <= 2
      );
    }

    function onTouchStart(e: TouchEvent) {
      if (refreshingRef.current || loadingRef.current) return;
      if (!atTop()) {
        pullStartY.current = null;
        return;
      }
      pullStartY.current = e.touches[0]?.clientY ?? null;
    }

    function onTouchMove(e: TouchEvent) {
      if (pullStartY.current == null) return;
      if (!atTop() && pullDistanceRef.current === 0) {
        pullStartY.current = null;
        return;
      }
      const y = e.touches[0]?.clientY ?? 0;
      const dy = y - pullStartY.current;
      if (dy <= 0) {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }
      const damped = Math.min(dy * 0.42, PULL_MAX);
      pullDistanceRef.current = damped;
      setPullDistance(damped);
    }

    function onTouchEnd() {
      if (pullStartY.current == null) return;
      const shouldRefresh = pullDistanceRef.current >= PULL_THRESHOLD;
      pullStartY.current = null;
      pullDistanceRef.current = 0;
      setPullDistance(0);
      if (shouldRefresh) void onRefresh();
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, load]);

  async function loadMoreExpired() {
    if (loadingMore || expiredLast) return;
    setLoadingMore(true);
    try {
      await fetchExpired(expiredPage + 1, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load more");
    } finally {
      setLoadingMore(false);
    }
  }

  async function clearAllExpired() {
    if (expired.length === 0 || clearing) return;
    const ok = window.confirm(
      `Remove all ${expiredTotal || expired.length} expired saved events?`,
    );
    if (!ok) return;

    setClearing(true);
    setError("");
    try {
      await Promise.all(
        expired.map((event) =>
          fetch("/api/user/saved-events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId: event.id,
              cityId,
              save: false,
            }),
          }),
        ),
      );
      setExpired([]);
      setExpiredTotal(0);
      setExpiredLast(true);
    } catch {
      setError("Could not clear expired events");
    } finally {
      setClearing(false);
    }
  }

  const filterCount = status === "active" ? activeTotal : expiredTotal;
  const filterLabel = status === "active" ? "Active" : "Expired";

  if (authLoading || (!user && loading)) {
    return (
      <div className="mt-8 flex flex-col gap-5">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Pull-to-refresh indicator */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center overflow-hidden"
        style={{
          height: refreshing ? 40 : pullDistance,
          transition: pullDistance === 0 && !refreshing ? "height 180ms ease" : undefined,
        }}
      >
        <div
          className={`mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_-4px_rgba(30,26,22,0.28)] ring-1 ring-line ${
            refreshing || pullDistance >= PULL_THRESHOLD ? "opacity-100" : "opacity-70"
          }`}
          style={{
            transform: `scale(${refreshing ? 1 : Math.min(0.55 + pullDistance / PULL_MAX, 1)})`,
          }}
        >
          <span
            className={`block h-4 w-4 rounded-full border-2 border-ink/15 border-t-accent ${
              refreshing || pullDistance >= PULL_THRESHOLD ? "animate-spin" : ""
            }`}
            style={
              refreshing
                ? undefined
                : {
                    transform: `rotate(${(pullDistance / PULL_MAX) * 270}deg)`,
                  }
            }
          />
        </div>
      </div>

      <div
        style={{
          transform:
            pullDistance > 0 || refreshing
              ? `translateY(${refreshing ? 36 : pullDistance * 0.85}px)`
              : undefined,
          transition:
            pullDistance === 0 && !refreshing ? "transform 180ms ease" : undefined,
        }}
      >
      {/* Status filter */}
      <div className="relative mt-6">
        <button
          type="button"
          onClick={() => setFilterOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-[14px] border border-line bg-white px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2.5 text-[14px] font-semibold text-ink">
            <span
              className={`h-2 w-2 rounded-full ${
                status === "active" ? "bg-[#2F9B5B]" : "bg-[#C23B3B]"
              }`}
            />
            {filterLabel}
            <span className="font-medium text-ink-soft">· {filterCount}</span>
          </span>
          <span className="text-[12px] text-ink-soft">
            {filterOpen ? "Close" : "Change"}
          </span>
        </button>

        {filterOpen ? (
          <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-[14px] border border-line bg-white shadow-[0_12px_32px_-12px_rgba(30,26,22,0.28)]">
            {(
              [
                { id: "active" as const, label: "Active", color: "bg-[#2F9B5B]" },
                {
                  id: "expired" as const,
                  label: "Expired",
                  color: "bg-[#C23B3B]",
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => switchStatus(opt.id)}
                className={`flex w-full items-center gap-2.5 px-4 py-3 text-left text-[14px] font-medium transition hover:bg-[#F7F7FA] ${
                  status === opt.id ? "bg-[#F7F7FA] text-ink" : "text-ink"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${opt.color}`} />
                {opt.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {status === "expired" && expired.length > 0 ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => void clearAllExpired()}
            disabled={clearing}
            className="text-[13px] font-semibold text-[#C23B3B] disabled:opacity-50"
          >
            {clearing ? "Clearing…" : "Clear all expired"}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="mt-6 text-[14px] text-[#C23B3B]">{error}</p>
      ) : null}

      {loading ? (
        <div className="mt-8 flex flex-col gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : status === "active" ? (
        groups.length === 0 ? (
          <div className="mt-12 text-center">
            <BookmarkIcon className="mx-auto h-8 w-8 text-ink-soft" />
            <p className="mt-4 text-[15px] font-semibold text-ink">
              Nothing saved yet
            </p>
            <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-[1.55] text-ink-soft">
              Bookmark events to keep them here.
            </p>
            <Link
              href="/explore-events"
              className="mt-6 inline-block text-[13px] font-semibold text-accent no-underline hover:text-accent-deep"
            >
              Browse events →
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            {groups.map((group) => (
              <section key={group.dateKey || group.label} className="mb-7">
                <h2 className="sticky top-0 z-10 mb-4 bg-bg/95 py-1 text-[14px] font-medium text-[#8A8A8A] backdrop-blur-sm">
                  {group.label}
                </h2>
                <ul className="flex flex-col gap-5">
                  {group.events.map((event) => (
                    <li key={`${group.dateKey}-${event.id}-${event.startTimeLabel}`}>
                      <SavedEventRow event={event} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )
      ) : expired.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-[15px] font-semibold text-ink">
            No past saved events
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <ul className="flex flex-col gap-5">
            {expired.map((event) => (
              <li key={event.id}>
                <SavedEventRow event={event} ended />
              </li>
            ))}
          </ul>
          {!expiredLast ? (
            <button
              type="button"
              onClick={() => void loadMoreExpired()}
              disabled={loadingMore}
              className="mt-8 w-full rounded-full border border-line py-3 text-[13px] font-semibold text-ink disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          ) : null}
        </div>
      )}
      </div>
    </div>
  );
}
