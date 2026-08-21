import { Injectable, NotFoundException } from "@nestjs/common";
import { processGraOutboundForOperator } from "@kenji-raffle/shared";
import { TenantConnectionService } from "../tenant/tenant-connection.service";

@Injectable()
export class GraAdminService {
  constructor(private readonly tenantConnection: TenantConnectionService) {}

  async listEvents(operatorId: string, status?: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const rows = await client.gra_outbound_events.findMany({
      where: status
        ? { status: status as "pending" | "sent" | "failed" }
        : undefined,
      orderBy: { created_at: "desc" },
      take: 100,
    });

    return rows.map((r) => ({
      id: r.id,
      event_type: r.event_type,
      status: r.status,
      retry_count: r.retry_count,
      last_error: r.last_error,
      created_at: r.created_at.toISOString(),
      processed_at: r.processed_at?.toISOString() ?? null,
      payload: r.payload,
    }));
  }

  async retryEvent(operatorId: string, eventId: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const event = await client.gra_outbound_events.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException("Event not found");

    await client.gra_outbound_events.update({
      where: { id: eventId },
      data: { status: "pending", last_error: null, retry_count: 0 },
    });

    await processGraOutboundForOperator(operatorId);
    return { ok: true, event_id: eventId };
  }
}
