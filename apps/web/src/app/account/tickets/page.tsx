"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { playerFetch } from "@/lib/player-api";

type Ticket = {
  id: string;
  raffle_title: string;
  raffle_slug: string;
  ticket_number: number;
  raffle_status: string;
};

type TicketsResponse = {
  items: Ticket[];
  page: number;
  limit: number;
  total: number;
};

type RaffleGroup = {
  slug: string;
  title: string;
  status: string;
  tickets: Ticket[];
};

const PAGE_SIZE = 500;
const INITIAL_VISIBLE = 60;
const SHOW_MORE_STEP = 60;

function RaffleTicketGroup({ group }: { group: RaffleGroup }) {
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const shown = group.tickets.slice(0, visible);
  const hasMore = visible < group.tickets.length;

  return (
    <section className="site-ticket-group">
      <div className="site-ticket-group__header">
        <div>
          <Link href={`/raffles/${group.slug}`} className="site-ticket-group__title">
            {group.title}
          </Link>
          <p className="site-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
            {group.tickets.length} ticket{group.tickets.length === 1 ? "" : "s"} · {group.status}
          </p>
        </div>
      </div>
      <div className="site-ticket-number-grid" aria-label={`Ticket numbers for ${group.title}`}>
        {shown.map((t) => (
          <span key={t.id} className="site-ticket-number">#{t.ticket_number}</span>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          className="site-btn site-btn--ghost site-btn--sm"
          style={{ marginTop: 12 }}
          onClick={() => setVisible((v) => Math.min(v + SHOW_MORE_STEP, group.tickets.length))}
        >
          Show {Math.min(SHOW_MORE_STEP, group.tickets.length - visible)} more
          ({group.tickets.length - visible} remaining)
        </button>
      )}
    </section>
  );
}

export default function AccountTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const hasMore = tickets.length < total;

  const loadPage = useCallback(async (nextPage: number, replace: boolean) => {
    const response = await playerFetch<TicketsResponse>(
      `/v1/account/tickets?page=${nextPage}&limit=${PAGE_SIZE}`,
    );
    setTotal(response.total);
    setPage(response.page);
    setTickets((prev) =>
      replace ? response.items : [...prev, ...response.items],
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    loadPage(1, true)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load tickets");
        setTickets([]);
      })
      .finally(() => setLoading(false));
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    loadPage(page + 1, false)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load more tickets");
      })
      .finally(() => setLoadingMore(false));
  }, [hasMore, loadPage, loading, loadingMore, page]);

  const sentinelRef = useInfiniteScroll(loadMore, {
    enabled: hasMore && !loading,
    loading: loadingMore,
  });

  const groups = useMemo(() => {
    const map = new Map<string, RaffleGroup>();
    for (const ticket of tickets) {
      const existing = map.get(ticket.raffle_slug);
      if (existing) {
        existing.tickets.push(ticket);
      } else {
        map.set(ticket.raffle_slug, {
          slug: ticket.raffle_slug,
          title: ticket.raffle_title,
          status: ticket.raffle_status,
          tickets: [ticket],
        });
      }
    }
    return Array.from(map.values());
  }, [tickets]);

  return (
    <>
      <AccountPageHeader
        title="My tickets"
        description="Your entry numbers grouped by raffle."
      />
      {error && <p className="site-error">{error}</p>}

      {loading ? (
        <div className="site-skeleton" style={{ height: 120 }} />
      ) : tickets.length === 0 && !error ? (
        <div className="site-empty site-card">
          <p className="site-empty__title">No tickets yet</p>
          <p className="site-muted">Purchase tickets from any live raffle to see them here.</p>
          <Link href="/raffles" className="site-btn site-btn--primary site-btn--sm" style={{ marginTop: 12 }}>
            Browse raffles
          </Link>
        </div>
      ) : (
        <>
          <p className="site-muted" style={{ fontSize: 13, margin: "0 0 16px" }}>
            {total} ticket{total === 1 ? "" : "s"} across {groups.length} raffle
            {groups.length === 1 ? "" : "s"}
          </p>
          <div className="site-card site-ticket-groups">
            {groups.map((group) => (
              <RaffleTicketGroup key={group.slug} group={group} />
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="site-load-more">
              {loadingMore ? "Loading more tickets…" : "Scroll for more"}
            </div>
          )}
        </>
      )}
    </>
  );
}
