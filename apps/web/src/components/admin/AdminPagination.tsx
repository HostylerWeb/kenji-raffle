export function AdminPagination({
  page,
  total,
  limit,
  onPage,
}: {
  page: number;
  total: number;
  limit: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div className="admin-pagination">
      <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <span className="admin-pagination__info">
        Page {page} of {pages} · {total} total
      </span>
      <button type="button" className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </div>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export { formatDate };
