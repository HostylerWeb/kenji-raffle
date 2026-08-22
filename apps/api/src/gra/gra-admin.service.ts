import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { enqueueProcessGraOutbound } from "@kenji-raffle/shared";
import type { Prisma } from "@kenji-raffle/database-tenant";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { paginate } from "../common/pagination";

const STUCK_PENDING_HOURS = 6;

@Injectable()
export class GraAdminService {
  constructor(private readonly tenantConnection: TenantConnectionService) {}

  async listEvents(
    operatorId: string,
    options?: { status?: string; page?: number; limit?: number },
  ) {
    const client = await this.tenantConnection.getClient(operatorId);
    const { take, skip, page, limit } = paginate(options?.page, options?.limit, 50);

    const where: Prisma.gra_outbound_eventsWhereInput = {};
    if (options?.status) {
      where.status = options.status as Prisma.gra_outbound_eventsWhereInput["status"];
    }

    const [rows, total] = await Promise.all([
      client.gra_outbound_events.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      client.gra_outbound_events.count({ where }),
    ]);

    return {
      items: rows.map((r) => ({
        id: r.id,
        event_type: r.event_type,
        status: r.status,
        retry_count: r.retry_count,
        last_error: r.last_error,
        next_attempt_at: r.next_attempt_at?.toISOString() ?? null,
        created_at: r.created_at.toISOString(),
        processed_at: r.processed_at?.toISOString() ?? null,
        payload: r.payload,
      })),
      total,
      page,
      limit,
    };
  }

  async retryEvent(operatorId: string, eventId: string) {
    const client = await this.tenantConnection.getClient(operatorId);
    const event = await client.gra_outbound_events.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException("Event not found");

    const stuckPending =
      event.status === "pending" &&
      event.created_at.getTime() <
        Date.now() - STUCK_PENDING_HOURS * 60 * 60 * 1000;

    if (event.status !== "failed" && !stuckPending) {
      throw new BadRequestException(
        "Only failed events (or pending events stuck over 6 hours) can be retried",
      );
    }

    await client.gra_outbound_events.update({
      where: { id: eventId },
      data: {
        status: "pending",
        last_error: null,
        retry_count: 0,
        next_attempt_at: null,
        processed_at: null,
      },
    });

    await enqueueProcessGraOutbound(operatorId);
    return { ok: true, event_id: eventId, status: "pending" };
  }
}
