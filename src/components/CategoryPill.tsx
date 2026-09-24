"use client";

/**
 * Pill chip with optional cyan→purple oval selection ring (Explore Events /
 * This Month). Ring size is always present via padding so layout never shifts.
 */
export default function CategoryPill({
  selected,
  onClick,
  children,
  compact = false,
  categoryId,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  compact?: boolean;
  /** Optional — used for scroll-into-view on Explore. */
  categoryId?: string;
}) {
  return (
    <button
      type="button"
      data-category-id={categoryId}
      onClick={onClick}
      aria-pressed={selected}
      className="shrink-0 rounded-full p-[2px] outline-none"
      style={{
        background: selected
          ? "linear-gradient(to bottom, #00E5FF, #6A1B9A)"
          : "transparent",
      }}
    >
      <span
        className={`inline-flex h-10 items-center rounded-full border bg-white text-[13px] font-medium whitespace-nowrap ${
          compact ? "w-10 justify-center" : "px-3.5"
        }`}
        style={{
          borderColor: selected ? "transparent" : "#E5E5E5",
          color: selected ? "#3B7FE8" : "#111827",
        }}
      >
        {children}
      </span>
    </button>
  );
}
