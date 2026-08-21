import type { ReactNode } from "react";

export function AdminFilters({
  search,
  onSearch,
  searchPlaceholder = "Search…",
  children,
  onClear,
  hasActive,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  onClear?: () => void;
  hasActive?: boolean;
}) {
  return (
    <div className="admin-filters">
      {onSearch ? (
        <input
          className="admin-filters__search"
          value={search ?? ""}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
        />
      ) : null}
      {children}
      {onClear && hasActive ? (
        <button type="button" className="btn btn-secondary" onClick={onClear}>
          Clear
        </button>
      ) : null}
    </div>
  );
}
