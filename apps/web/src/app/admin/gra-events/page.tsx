"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Event = {
  id: string;
  event_type: string;
  status: string;
  retry_count: number;
  last_error: string | null;
  created_at: string;
};

export default function GraEventsPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    operatorFetch<Event[]>("/v1/admin/gra-events").then(setEvents);
  }, [router]);

  async function retry(id: string) {
    await operatorFetch(`/v1/admin/gra-events/${id}/retry`, { method: "POST" });
    setEvents(await operatorFetch<Event[]>("/v1/admin/gra-events"));
    toast("Retry queued");
  }

  return (
    <OperatorAdminShell title="GRA events" description="Outbound compliance events and retries.">
      <div className="admin-panel">
        <AdminTable
          columns={["Type", "Status", "Retries", "Error", ""]}
          isEmpty={events.length === 0}
          emptyTitle="No GRA events"
        >
          {events.map((e) => (
            <tr key={e.id}>
              <td>{e.event_type}</td>
              <td>
                <AdminStatusBadge status={e.status} />
              </td>
              <td>{e.retry_count}</td>
              <td className="muted">{e.last_error ?? "—"}</td>
              <td>
                {e.status !== "sent" && (
                  <button type="button" className="btn btn-secondary" onClick={() => retry(e.id)}>
                    Retry
                  </button>
                )}
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </OperatorAdminShell>
  );
}
