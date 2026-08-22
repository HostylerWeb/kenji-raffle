import type { ReactNode } from "react";
import { AdminEmptyState } from "./AdminEmptyState";

function SkeletonRows({ cols, rows }: { cols: number; rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="admin-table__skeleton-row">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j}>
              <span className="admin-skeleton admin-skeleton--cell" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function AdminTable({
  columns,
  isEmpty,
  loading,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
}: {
  columns: string[];
  isEmpty?: boolean;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
}) {
  const colCount = columns.length;

  return (
    <div className="admin-table-wrap">
      <table className="table admin-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? <SkeletonRows cols={colCount} rows={5} /> : !isEmpty ? children : null}
        </tbody>
      </table>
      {!loading && isEmpty && emptyTitle ? (
        <AdminEmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : null}
    </div>
  );
}
