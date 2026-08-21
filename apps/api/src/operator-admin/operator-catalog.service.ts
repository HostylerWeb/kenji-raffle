import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { OperatorAuthUser, TenantContext } from "@kenji-raffle/shared";
import { slugify } from "@kenji-raffle/shared";
import type { Prisma } from "@kenji-raffle/database-tenant";
import { publicRaffleVisibilityFilter } from "../cart/raffle-purchase.helper";
import { TenantConnectionService } from "../tenant/tenant-connection.service";
import { TenantAuditService } from "../tenant/tenant-audit.service";

type RaffleStatus =
  | "draft"
  | "listed"
  | "active"
  | "to_be_drawn"
  | "drawn"
  | "cancelled"
  | "failed";

const PUBLIC_STATUSES: RaffleStatus[] = ["listed", "active"];

function decimal(value: Prisma.Decimal | number | string): number {
  return Number(value);
}

function serializeRaffle(
  row: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    category_id: string | null;
    start_date: Date | null;
    end_date: Date | null;
    ticket_price: Prisma.Decimal;
    max_entries: number;
    min_tickets: number;
    ticket_limit_per_user: number | null;
    draw_type: string;
    number_of_winners: number;
    status: string;
    is_featured: boolean;
    featured_image_url: string | null;
    cash_alternative_amount: Prisma.Decimal | null;
    created_at: Date;
    updated_at: Date;
    category?: { id: string; name: string; slug: string } | null;
    gallery?: { id: string; image_url: string; sort_order: number }[];
    prizes?: {
      id: string;
      name: string;
      prize_type: string;
      value_kes: Prisma.Decimal | null;
      image_url: string | null;
      sort_order: number;
    }[];
    instant_win_prizes?: {
      id: string;
      name: string;
      prize_type: string;
      prize_value: Prisma.Decimal;
      win_frequency: number;
      total_available: number;
      total_awarded: number;
      status: string;
      group_id: string | null;
    }[];
  },
  counts?: { available: number; reserved: number; purchased: number; total: number },
) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    category_id: row.category_id,
    category: row.category
      ? { id: row.category.id, name: row.category.name, slug: row.category.slug }
      : null,
    start_date: row.start_date?.toISOString() ?? null,
    end_date: row.end_date?.toISOString() ?? null,
    ticket_price: decimal(row.ticket_price),
    max_entries: row.max_entries,
    min_tickets: row.min_tickets,
    ticket_limit_per_user: row.ticket_limit_per_user,
    draw_type: row.draw_type,
    number_of_winners: row.number_of_winners,
    status: row.status,
    is_featured: row.is_featured,
    featured_image_url: row.featured_image_url,
    cash_alternative_amount: row.cash_alternative_amount
      ? decimal(row.cash_alternative_amount)
      : null,
    scheduled_draw_at: (row as { scheduled_draw_at?: Date | null }).scheduled_draw_at?.toISOString() ?? null,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    gallery: row.gallery?.map((g) => ({
      id: g.id,
      image_url: g.image_url,
      sort_order: g.sort_order,
    })),
    prizes: row.prizes?.map((p) => ({
      id: p.id,
      name: p.name,
      prize_type: p.prize_type,
      value_kes: p.value_kes ? decimal(p.value_kes) : null,
      image_url: p.image_url,
      sort_order: p.sort_order,
    })),
    instant_win_prizes: row.instant_win_prizes?.map((p) => ({
      id: p.id,
      name: p.name,
      prize_type: p.prize_type,
      prize_value: decimal(p.prize_value),
      win_frequency: p.win_frequency,
      total_available: p.total_available,
      total_awarded: p.total_awarded,
      status: p.status,
      group_id: (p as { group_id?: string | null }).group_id ?? null,
    })),
    ticket_counts: counts,
    tickets_available: counts?.available,
  };
}

@Injectable()
export class OperatorCatalogService {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly audit: TenantAuditService,
  ) {}

  private async client(operatorId: string) {
    return this.tenantConnection.getClient(operatorId);
  }

  async listCategories(operatorId: string) {
    const client = await this.client(operatorId);
    const rows = await client.categories.findMany({
      orderBy: [{ sort_order: "asc" }, { name: "asc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      image_url: row.image_url,
      sort_order: row.sort_order,
      created_at: row.created_at.toISOString(),
    }));
  }

  async createCategory(
    actor: OperatorAuthUser,
    operatorId: string,
    input: { name: string; slug?: string; image_url?: string; sort_order?: number },
  ) {
    const client = await this.client(operatorId);
    const slug = input.slug?.trim() || slugify(input.name);
    const existing = await client.categories.findUnique({ where: { slug } });
    if (existing) throw new ConflictException("Category slug already exists");

    const row = await client.categories.create({
      data: {
        name: input.name.trim(),
        slug,
        image_url: input.image_url,
        sort_order: input.sort_order ?? 0,
      },
    });

    await this.audit.log(
      operatorId,
      actor,
      "category.created",
      "categories",
      row.id,
    );

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      image_url: row.image_url,
      sort_order: row.sort_order,
    };
  }

  async updateCategory(
    actor: OperatorAuthUser,
    operatorId: string,
    id: string,
    input: { name?: string; slug?: string; image_url?: string; sort_order?: number },
  ) {
    const client = await this.client(operatorId);
    const current = await client.categories.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Category not found");

    if (input.slug && input.slug !== current.slug) {
      const clash = await client.categories.findUnique({
        where: { slug: input.slug },
      });
      if (clash) throw new ConflictException("Category slug already exists");
    }

    const row = await client.categories.update({
      where: { id },
      data: {
        name: input.name?.trim(),
        slug: input.slug?.trim(),
        image_url: input.image_url,
        sort_order: input.sort_order,
      },
    });

    await this.audit.log(operatorId, actor, "category.updated", "categories", id);
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      image_url: row.image_url,
      sort_order: row.sort_order,
    };
  }

  async deleteCategory(actor: OperatorAuthUser, operatorId: string, id: string) {
    const client = await this.client(operatorId);
    const current = await client.categories.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Category not found");

    const linked = await client.raffles.count({ where: { category_id: id } });
    if (linked > 0) {
      throw new BadRequestException("Category is used by raffles");
    }

    await client.categories.delete({ where: { id } });
    await this.audit.log(operatorId, actor, "category.deleted", "categories", id);
    return { ok: true };
  }

  async listRaffles(operatorId: string, status?: string) {
    const client = await this.client(operatorId);
    const rows = await client.raffles.findMany({
      where: status ? { status: status as RaffleStatus } : undefined,
      orderBy: { created_at: "desc" },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return rows.map((row) => serializeRaffle(row));
  }

  async getRaffle(operatorId: string, id: string) {
    const client = await this.client(operatorId);
    const row = await client.raffles.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        gallery: { orderBy: { sort_order: "asc" } },
        prizes: { orderBy: { sort_order: "asc" } },
        instant_win_prizes: { orderBy: { name: "asc" } },
      },
    });
    if (!row) throw new NotFoundException("Raffle not found");

    const counts = await this.ticketCounts(client, id);
    return serializeRaffle(row, counts);
  }

  async createRaffle(
    actor: OperatorAuthUser,
    operatorId: string,
    input: {
      title: string;
      slug?: string;
      description?: string;
      category_id?: string;
      ticket_price: number;
      max_entries: number;
      min_tickets?: number;
      ticket_limit_per_user?: number;
      draw_type?: string;
      number_of_winners?: number;
      start_date?: string;
      end_date?: string;
      is_featured?: boolean;
      featured_image_url?: string;
      cash_alternative_amount?: number;
      scheduled_draw_at?: string;
    },
  ) {
    const client = await this.client(operatorId);
    const slug = input.slug?.trim() || slugify(input.title);
    const clash = await client.raffles.findUnique({ where: { slug } });
    if (clash) throw new ConflictException("Raffle slug already exists");

    if (input.category_id) {
      const cat = await client.categories.findUnique({
        where: { id: input.category_id },
      });
      if (!cat) throw new BadRequestException("Invalid category");
    }

    const row = await client.raffles.create({
      data: {
        title: input.title.trim(),
        slug,
        description: input.description,
        category_id: input.category_id,
        ticket_price: input.ticket_price,
        max_entries: input.max_entries,
        min_tickets: input.min_tickets ?? 0,
        ticket_limit_per_user: input.ticket_limit_per_user,
        draw_type: (input.draw_type as "manual" | "automatic" | "scheduled") ?? "manual",
        number_of_winners: input.number_of_winners ?? 1,
        status: "draft",
        is_featured: input.is_featured ?? false,
        featured_image_url: input.featured_image_url,
        cash_alternative_amount: input.cash_alternative_amount,
        start_date: input.start_date ? new Date(input.start_date) : null,
        end_date: input.end_date ? new Date(input.end_date) : null,
        scheduled_draw_at: input.scheduled_draw_at
          ? new Date(input.scheduled_draw_at)
          : null,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    await this.audit.log(operatorId, actor, "raffle.created", "raffles", row.id);
    return serializeRaffle(row);
  }

  async updateRaffle(
    actor: OperatorAuthUser,
    operatorId: string,
    id: string,
    input: Record<string, unknown>,
  ) {
    const client = await this.client(operatorId);
    const current = await client.raffles.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Raffle not found");

    if (input.slug && input.slug !== current.slug) {
      const clash = await client.raffles.findUnique({
        where: { slug: String(input.slug) },
      });
      if (clash) throw new ConflictException("Raffle slug already exists");
    }

    const row = await client.raffles.update({
      where: { id },
      data: {
        title: input.title ? String(input.title).trim() : undefined,
        slug: input.slug ? String(input.slug).trim() : undefined,
        description: input.description as string | undefined,
        category_id: input.category_id as string | null | undefined,
        ticket_price: input.ticket_price as number | undefined,
        max_entries: input.max_entries as number | undefined,
        min_tickets: input.min_tickets as number | undefined,
        ticket_limit_per_user: input.ticket_limit_per_user as number | null | undefined,
        draw_type: input.draw_type as "manual" | "automatic" | "scheduled" | undefined,
        number_of_winners: input.number_of_winners as number | undefined,
        is_featured: input.is_featured as boolean | undefined,
        featured_image_url: input.featured_image_url as string | undefined,
        cash_alternative_amount: input.cash_alternative_amount as number | null | undefined,
        start_date: input.start_date
          ? new Date(String(input.start_date))
          : undefined,
        end_date: input.end_date ? new Date(String(input.end_date)) : undefined,
        scheduled_draw_at: input.scheduled_draw_at
          ? new Date(String(input.scheduled_draw_at))
          : undefined,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        gallery: { orderBy: { sort_order: "asc" } },
        prizes: { orderBy: { sort_order: "asc" } },
        instant_win_prizes: true,
      },
    });

    await this.audit.log(operatorId, actor, "raffle.updated", "raffles", id);
    const counts = await this.ticketCounts(client, id);
    return serializeRaffle(row, counts);
  }

  async updateRaffleStatus(
    actor: OperatorAuthUser,
    operatorId: string,
    id: string,
    status: RaffleStatus,
  ) {
    const client = await this.client(operatorId);
    const current = await client.raffles.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Raffle not found");

    if (status === "active" || status === "listed") {
      const ticketCount = await client.tickets.count({ where: { raffle_id: id } });
      if (ticketCount === 0) {
        throw new BadRequestException("Generate ticket pool before publishing");
      }
      if (!current.end_date) {
        throw new BadRequestException("End date is required to publish");
      }
    }

    const row = await client.raffles.update({
      where: { id },
      data: { status },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    await this.audit.log(
      operatorId,
      actor,
      "raffle.status_changed",
      "raffles",
      id,
      { status },
    );

    const counts = await this.ticketCounts(client, id);
    return serializeRaffle(row, counts);
  }

  async deleteRaffle(
    actor: OperatorAuthUser,
    operatorId: string,
    id: string,
  ) {
    const client = await this.client(operatorId);
    const current = await client.raffles.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Raffle not found");

    if (current.status !== "draft") {
      throw new BadRequestException(
        "Only draft raffles can be deleted. Cancel published raffles instead.",
      );
    }

    const purchased = await client.tickets.count({
      where: { raffle_id: id, status: "purchased" },
    });
    if (purchased > 0) {
      throw new BadRequestException("Cannot delete raffle with purchased tickets");
    }

    await client.raffles.delete({ where: { id } });
    await this.audit.log(operatorId, actor, "raffle.deleted", "raffles", id);
    return { ok: true };
  }

  async createPrize(
    actor: OperatorAuthUser,
    operatorId: string,
    raffleId: string,
    input: {
      name: string;
      prize_type: string;
      value_kes?: number;
      image_url?: string;
      sort_order?: number;
    },
  ) {
    const client = await this.client(operatorId);
    await this.ensureRaffle(client, raffleId);

    const row = await client.prizes.create({
      data: {
        raffle_id: raffleId,
        name: input.name.trim(),
        prize_type: input.prize_type as "physical" | "cash" | "site_credit",
        value_kes: input.value_kes,
        image_url: input.image_url,
        sort_order: input.sort_order ?? 0,
      },
    });

    await this.audit.log(operatorId, actor, "prize.created", "prizes", row.id);
    return {
      id: row.id,
      name: row.name,
      prize_type: row.prize_type,
      value_kes: row.value_kes ? decimal(row.value_kes) : null,
      image_url: row.image_url,
      sort_order: row.sort_order,
    };
  }

  async updatePrize(
    actor: OperatorAuthUser,
    operatorId: string,
    raffleId: string,
    prizeId: string,
    input: {
      name?: string;
      prize_type?: string;
      value_kes?: number;
      image_url?: string;
      sort_order?: number;
    },
  ) {
    const client = await this.client(operatorId);
    const prize = await client.prizes.findFirst({
      where: { id: prizeId, raffle_id: raffleId },
    });
    if (!prize) throw new NotFoundException("Prize not found");

    const row = await client.prizes.update({
      where: { id: prizeId },
      data: {
        name: input.name?.trim(),
        prize_type: input.prize_type as "physical" | "cash" | "site_credit" | undefined,
        value_kes: input.value_kes,
        image_url: input.image_url,
        sort_order: input.sort_order,
      },
    });

    await this.audit.log(operatorId, actor, "prize.updated", "prizes", prizeId);
    return {
      id: row.id,
      name: row.name,
      prize_type: row.prize_type,
      value_kes: row.value_kes ? decimal(row.value_kes) : null,
      image_url: row.image_url,
      sort_order: row.sort_order,
    };
  }

  async deletePrize(
    actor: OperatorAuthUser,
    operatorId: string,
    raffleId: string,
    prizeId: string,
  ) {
    const client = await this.client(operatorId);
    const prize = await client.prizes.findFirst({
      where: { id: prizeId, raffle_id: raffleId },
    });
    if (!prize) throw new NotFoundException("Prize not found");
    await client.prizes.delete({ where: { id: prizeId } });
    await this.audit.log(operatorId, actor, "prize.deleted", "prizes", prizeId);
    return { ok: true };
  }

  async createInstantWinPrize(
    actor: OperatorAuthUser,
    operatorId: string,
    raffleId: string,
    input: {
      name: string;
      prize_type: string;
      prize_value: number;
      win_frequency: number;
      total_available: number;
      group_id?: string;
    },
  ) {
    const client = await this.client(operatorId);
    await this.ensureRaffle(client, raffleId);

    const row = await client.instant_win_prizes.create({
      data: {
        raffle_id: raffleId,
        group_id: input.group_id,
        name: input.name.trim(),
        prize_type: input.prize_type as "physical" | "cash" | "site_credit",
        prize_value: input.prize_value,
        win_frequency: input.win_frequency,
        total_available: input.total_available,
        status: "active",
      },
    });

    await this.audit.log(
      operatorId,
      actor,
      "instant_win_prize.created",
      "instant_win_prizes",
      row.id,
    );

    return {
      id: row.id,
      name: row.name,
      prize_type: row.prize_type,
      prize_value: decimal(row.prize_value),
      win_frequency: row.win_frequency,
      total_available: row.total_available,
      total_awarded: row.total_awarded,
      status: row.status,
    };
  }

  async updateInstantWinPrize(
    actor: OperatorAuthUser,
    operatorId: string,
    raffleId: string,
    prizeId: string,
    input: {
      name?: string;
      prize_type?: string;
      prize_value?: number;
      win_frequency?: number;
      total_available?: number;
      status?: string;
    },
  ) {
    const client = await this.client(operatorId);
    const prize = await client.instant_win_prizes.findFirst({
      where: { id: prizeId, raffle_id: raffleId },
    });
    if (!prize) throw new NotFoundException("Instant win prize not found");

    const row = await client.instant_win_prizes.update({
      where: { id: prizeId },
      data: {
        name: input.name?.trim(),
        prize_type: input.prize_type as "physical" | "cash" | "site_credit" | undefined,
        prize_value: input.prize_value,
        win_frequency: input.win_frequency,
        total_available: input.total_available,
        status: input.status as "active" | "paused" | "completed" | undefined,
      },
    });

    await this.audit.log(
      operatorId,
      actor,
      "instant_win_prize.updated",
      "instant_win_prizes",
      prizeId,
    );

    return {
      id: row.id,
      name: row.name,
      prize_type: row.prize_type,
      prize_value: decimal(row.prize_value),
      win_frequency: row.win_frequency,
      total_available: row.total_available,
      total_awarded: row.total_awarded,
      status: row.status,
    };
  }

  async deleteInstantWinPrize(
    actor: OperatorAuthUser,
    operatorId: string,
    raffleId: string,
    prizeId: string,
  ) {
    const client = await this.client(operatorId);
    const prize = await client.instant_win_prizes.findFirst({
      where: { id: prizeId, raffle_id: raffleId },
    });
    if (!prize) throw new NotFoundException("Instant win prize not found");
    await client.instant_win_prizes.delete({ where: { id: prizeId } });
    await this.audit.log(
      operatorId,
      actor,
      "instant_win_prize.deleted",
      "instant_win_prizes",
      prizeId,
    );
    return { ok: true };
  }

  async addGalleryImage(
    actor: OperatorAuthUser,
    operatorId: string,
    raffleId: string,
    input: { image_url: string; sort_order?: number },
  ) {
    const client = await this.client(operatorId);
    await this.ensureRaffle(client, raffleId);

    const row = await client.raffle_gallery.create({
      data: {
        raffle_id: raffleId,
        image_url: input.image_url,
        sort_order: input.sort_order ?? 0,
      },
    });

    await this.audit.log(
      operatorId,
      actor,
      "raffle_gallery.added",
      "raffle_gallery",
      row.id,
    );

    return {
      id: row.id,
      image_url: row.image_url,
      sort_order: row.sort_order,
    };
  }

  async deleteGalleryImage(
    actor: OperatorAuthUser,
    operatorId: string,
    raffleId: string,
    imageId: string,
  ) {
    const client = await this.client(operatorId);
    const image = await client.raffle_gallery.findFirst({
      where: { id: imageId, raffle_id: raffleId },
    });
    if (!image) throw new NotFoundException("Gallery image not found");
    await client.raffle_gallery.delete({ where: { id: imageId } });
    await this.audit.log(
      operatorId,
      actor,
      "raffle_gallery.deleted",
      "raffle_gallery",
      imageId,
    );
    return { ok: true };
  }

  async generateTickets(
    actor: OperatorAuthUser,
    operatorId: string,
    raffleId: string,
  ) {
    const client = await this.client(operatorId);
    const raffle = await this.ensureRaffle(client, raffleId);

    const existing = await client.tickets.count({ where: { raffle_id: raffleId } });
    if (existing > 0) {
      throw new BadRequestException("Ticket pool already generated");
    }

    const prizes = await client.instant_win_prizes.findMany({
      where: { raffle_id: raffleId, status: "active" },
      orderBy: { win_frequency: "asc" },
    });

    const groups = await client.instant_win_groups.findMany({
      where: { raffle_id: raffleId },
      orderBy: { sort_order: "asc" },
    });

    const assignments = new Map<number, string>();

    const assignPrizes = (
      pool: typeof prizes,
      allowedNumbers?: Set<number>,
    ) => {
      for (const prize of pool) {
        let assigned = 0;
        for (
          let n = 1;
          n <= raffle.max_entries && assigned < prize.total_available;
          n++
        ) {
          if (allowedNumbers && !allowedNumbers.has(n)) continue;
          if (prize.win_frequency <= 0) break;
          if (n % prize.win_frequency !== 0) continue;
          if (assignments.has(n)) continue;
          assignments.set(n, prize.id);
          assigned++;
        }
      }
    };

    for (const group of groups) {
      const groupPrizes = prizes.filter((p) => p.group_id === group.id);
      if (groupPrizes.length === 0) continue;
      const openNumbers = new Set<number>();
      for (let n = 1; n <= raffle.max_entries; n++) {
        if (!assignments.has(n)) openNumbers.add(n);
      }
      assignPrizes(groupPrizes, openNumbers);
    }

    const ungrouped = prizes.filter((p) => !p.group_id);
    assignPrizes(ungrouped);

    const batchSize = 500;
    let created = 0;
    for (let start = 1; start <= raffle.max_entries; start += batchSize) {
      const end = Math.min(start + batchSize - 1, raffle.max_entries);
      const data = [];
      for (let n = start; n <= end; n++) {
        data.push({
          raffle_id: raffleId,
          ticket_number: n,
          status: "available" as const,
          instant_win_prize_id: assignments.get(n) ?? null,
        });
      }
      await client.tickets.createMany({ data });
      created += data.length;
    }

    await this.audit.log(
      operatorId,
      actor,
      "tickets.generated",
      "raffles",
      raffleId,
      { count: created },
    );

    return { generated: created };
  }

  async ticketSummary(operatorId: string, raffleId: string) {
    const client = await this.client(operatorId);
    await this.ensureRaffle(client, raffleId);

    const groups = await client.tickets.groupBy({
      by: ["status"],
      where: { raffle_id: raffleId },
      _count: { status: true },
    });

    const summary = {
      available: 0,
      reserved: 0,
      purchased: 0,
      cancelled: 0,
      winning: 0,
      total: 0,
    };

    for (const g of groups) {
      const count = g._count.status;
      summary.total += count;
      if (g.status in summary) {
        summary[g.status as keyof typeof summary] = count;
      }
    }

    return summary;
  }

  async listTickets(
    operatorId: string,
    raffleId: string,
    status?: string,
    page = 1,
    limit = 50,
  ) {
    const client = await this.client(operatorId);
    await this.ensureRaffle(client, raffleId);

    const where = {
      raffle_id: raffleId,
      ...(status ? { status: status as "available" | "reserved" | "purchased" } : {}),
    };

    const [rows, total] = await Promise.all([
      client.tickets.findMany({
        where,
        orderBy: { ticket_number: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          ticket_number: true,
          status: true,
          user_id: true,
          reserved_until: true,
        },
      }),
      client.tickets.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        ticket_number: row.ticket_number,
        status: row.status,
        user_id: row.user_id,
        reserved_until: row.reserved_until?.toISOString() ?? null,
      })),
      total,
      page,
      limit,
    };
  }

  async listPublicRaffles(
    tenant: TenantContext,
    filters: {
      category?: string;
      featured?: boolean;
      ending_soon?: boolean;
    },
  ) {
    const client = await this.client(tenant.operatorId);
    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const where: Prisma.rafflesWhereInput = {
      status: { in: PUBLIC_STATUSES },
      ...publicRaffleVisibilityFilter(now),
      ...(filters.featured ? { is_featured: true } : {}),
      ...(filters.category
        ? { category: { slug: filters.category } }
        : {}),
      ...(filters.ending_soon
        ? { end_date: { gte: now, lte: weekAhead } }
        : {}),
    };

    const rows = await client.raffles.findMany({
      where,
      orderBy: [{ is_featured: "desc" }, { end_date: "asc" }, { created_at: "desc" }],
      include: {
        category: { select: { id: true, name: true, slug: true } },
        gallery: { orderBy: { sort_order: "asc" }, take: 1 },
      },
    });

    const withCounts = await Promise.all(
      rows.map(async (row) => {
        const available = await client.tickets.count({
          where: { raffle_id: row.id, status: "available" },
        });
        return serializeRaffle(row, {
          available,
          reserved: 0,
          purchased: 0,
          total: row.max_entries,
        });
      }),
    );

    return withCounts;
  }

  async getPublicRaffleBySlug(tenant: TenantContext, slug: string) {
    const client = await this.client(tenant.operatorId);
    const now = new Date();
    const row = await client.raffles.findFirst({
      where: {
        slug,
        status: { in: PUBLIC_STATUSES },
        ...publicRaffleVisibilityFilter(now),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        gallery: { orderBy: { sort_order: "asc" } },
        prizes: { orderBy: { sort_order: "asc" } },
        instant_win_prizes: {
          where: { status: "active" },
          orderBy: { name: "asc" },
        },
      },
    });
    if (!row) throw new NotFoundException("Raffle not found");

    const counts = await this.ticketCounts(client, row.id);
    const discounts = await client.raffle_quantity_discounts.findMany({
      where: { raffle_id: row.id },
      orderBy: { min_quantity: "asc" },
    });
    const serialized = serializeRaffle(row, counts);
    return {
      ...serialized,
      quantity_discounts: discounts.map((d) => ({
        min_quantity: d.min_quantity,
        discount_type: d.discount_type,
        discount_value: decimal(d.discount_value),
      })),
    };
  }

  async listPublicCategories(tenant: TenantContext) {
    const client = await this.client(tenant.operatorId);
    const rows = await client.categories.findMany({
      orderBy: [{ sort_order: "asc" }, { name: "asc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      image_url: row.image_url,
      sort_order: row.sort_order,
    }));
  }

  private async ticketCounts(
    client: Awaited<ReturnType<TenantConnectionService["getClient"]>>,
    raffleId: string,
  ) {
    const groups = await client.tickets.groupBy({
      by: ["status"],
      where: { raffle_id: raffleId },
      _count: { status: true },
    });

    const counts = {
      available: 0,
      reserved: 0,
      purchased: 0,
      total: 0,
    };

    for (const g of groups) {
      counts.total += g._count.status;
      if (g.status === "available") counts.available = g._count.status;
      if (g.status === "reserved") counts.reserved = g._count.status;
      if (g.status === "purchased") counts.purchased = g._count.status;
    }

    return counts;
  }

  private async ensureRaffle(
    client: Awaited<ReturnType<TenantConnectionService["getClient"]>>,
    raffleId: string,
  ) {
    const raffle = await client.raffles.findUnique({ where: { id: raffleId } });
    if (!raffle) throw new NotFoundException("Raffle not found");
    return raffle;
  }

  async listInstantWinGroups(operatorId: string, raffleId: string) {
    const client = await this.client(operatorId);
    await this.ensureRaffle(client, raffleId);
    const rows = await client.instant_win_groups.findMany({
      where: { raffle_id: raffleId },
      orderBy: { sort_order: "asc" },
    });
    return rows.map((g) => ({
      id: g.id,
      name: g.name,
      sort_order: g.sort_order,
    }));
  }

  async createInstantWinGroup(
    actor: OperatorAuthUser,
    operatorId: string,
    raffleId: string,
    input: { name: string; sort_order?: number },
  ) {
    const client = await this.client(operatorId);
    await this.ensureRaffle(client, raffleId);
    const row = await client.instant_win_groups.create({
      data: {
        raffle_id: raffleId,
        name: input.name.trim(),
        sort_order: input.sort_order ?? 0,
      },
    });
    await this.audit.log(
      operatorId,
      actor,
      "instant_win_group.created",
      "instant_win_groups",
      row.id,
    );
    return { id: row.id, name: row.name, sort_order: row.sort_order };
  }

  async deleteInstantWinGroup(
    actor: OperatorAuthUser,
    operatorId: string,
    raffleId: string,
    groupId: string,
  ) {
    const client = await this.client(operatorId);
    const group = await client.instant_win_groups.findFirst({
      where: { id: groupId, raffle_id: raffleId },
    });
    if (!group) throw new NotFoundException("Group not found");
    await client.instant_win_prizes.updateMany({
      where: { group_id: groupId },
      data: { group_id: null },
    });
    await client.instant_win_groups.delete({ where: { id: groupId } });
    await this.audit.log(
      operatorId,
      actor,
      "instant_win_group.deleted",
      "instant_win_groups",
      groupId,
    );
    return { ok: true };
  }

  async listQuantityDiscounts(operatorId: string, raffleId: string) {
    const client = await this.client(operatorId);
    await this.ensureRaffle(client, raffleId);
    const rows = await client.raffle_quantity_discounts.findMany({
      where: { raffle_id: raffleId },
      orderBy: { min_quantity: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      min_quantity: r.min_quantity,
      discount_type: r.discount_type,
      discount_value: decimal(r.discount_value),
    }));
  }

  async createQuantityDiscount(
    actor: OperatorAuthUser,
    operatorId: string,
    raffleId: string,
    input: {
      min_quantity: number;
      discount_type: string;
      discount_value: number;
    },
  ) {
    const client = await this.client(operatorId);
    await this.ensureRaffle(client, raffleId);
    const row = await client.raffle_quantity_discounts.create({
      data: {
        raffle_id: raffleId,
        min_quantity: input.min_quantity,
        discount_type: input.discount_type as "percent" | "fixed",
        discount_value: input.discount_value,
      },
    });
    await this.audit.log(
      operatorId,
      actor,
      "quantity_discount.created",
      "raffle_quantity_discounts",
      row.id,
    );
    return {
      id: row.id,
      min_quantity: row.min_quantity,
      discount_type: row.discount_type,
      discount_value: decimal(row.discount_value),
    };
  }

  async deleteQuantityDiscount(
    actor: OperatorAuthUser,
    operatorId: string,
    raffleId: string,
    tierId: string,
  ) {
    const client = await this.client(operatorId);
    const tier = await client.raffle_quantity_discounts.findFirst({
      where: { id: tierId, raffle_id: raffleId },
    });
    if (!tier) throw new NotFoundException("Discount tier not found");
    await client.raffle_quantity_discounts.delete({ where: { id: tierId } });
    await this.audit.log(
      operatorId,
      actor,
      "quantity_discount.deleted",
      "raffle_quantity_discounts",
      tierId,
    );
    return { ok: true };
  }
}
