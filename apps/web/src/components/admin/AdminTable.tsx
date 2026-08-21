import type { ReactNode } from "react";
import { AdminEmptyState } from "./AdminEmptyState";

export function AdminTable({
  columns,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
}: {
  columns: string[];
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="admin-table-wrap">
      {!isEmpty && (
        <table className="table admin-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      )}
      {isEmpty && emptyTitle ? (
        <AdminEmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : null}
    </div>
  );
}
