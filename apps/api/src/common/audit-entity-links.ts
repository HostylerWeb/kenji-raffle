type RaffleLookup = Map<string, string>;

export function resolveAuditEntityHref(
  entityType: string,
  entityId: string | null,
  raffleByChildId?: RaffleLookup,
): string | null {
  if (!entityId) return null;

  switch (entityType) {
    case "raffles":
      return `/admin/raffles/${entityId}`;
    case "orders":
      return `/admin/orders/${entityId}`;
    case "users":
      return `/admin/players/${entityId}`;
    case "withdrawals":
      return `/admin/withdrawals/${entityId}`;
    case "prize_claims":
      return `/admin/prize-claims/${entityId}`;
    case "operator_staff":
      return `/admin/staff?member=${entityId}`;
    case "categories":
      return "/admin/categories";
    case "coupons":
      return "/admin/coupons";
    case "operator_domains":
      return "/admin/domains";
    case "operator_settings":
      return "/admin/settings";
    case "prizes":
    case "instant_win_prizes":
    case "instant_win_groups":
    case "quantity_discounts":
    case "raffle_quantity_discounts":
    case "raffle_gallery": {
      const raffleId = raffleByChildId?.get(entityId);
      return raffleId ? `/admin/raffles/${raffleId}` : null;
    }
    default:
      return null;
  }
}

export async function buildRaffleLookupForAudit(
  client: {
    prizes: {
      findMany: (args: {
        where: { id: { in: string[] } };
        select: { id: true; raffle_id: true };
      }) => Promise<{ id: string; raffle_id: string }[]>;
    };
    instant_win_prizes: {
      findMany: (args: {
        where: { id: { in: string[] } };
        select: { id: true; raffle_id: true };
      }) => Promise<{ id: string; raffle_id: string }[]>;
    };
    instant_win_groups: {
      findMany: (args: {
        where: { id: { in: string[] } };
        select: { id: true; raffle_id: true };
      }) => Promise<{ id: string; raffle_id: string }[]>;
    };
    raffle_quantity_discounts: {
      findMany: (args: {
        where: { id: { in: string[] } };
        select: { id: true; raffle_id: true };
      }) => Promise<{ id: string; raffle_id: string }[]>;
    };
    raffle_gallery: {
      findMany: (args: {
        where: { id: { in: string[] } };
        select: { id: true; raffle_id: true };
      }) => Promise<{ id: string; raffle_id: string }[]>;
    };
  },
  rows: { entity_type: string; entity_id: string | null }[],
): Promise<RaffleLookup> {
  const prizeIds: string[] = [];
  const iwIds: string[] = [];
  const groupIds: string[] = [];
  const discountIds: string[] = [];
  const galleryIds: string[] = [];

  for (const row of rows) {
    if (!row.entity_id) continue;
    switch (row.entity_type) {
      case "prizes":
        prizeIds.push(row.entity_id);
        break;
      case "instant_win_prizes":
        iwIds.push(row.entity_id);
        break;
      case "instant_win_groups":
        groupIds.push(row.entity_id);
        break;
      case "quantity_discounts":
      case "raffle_quantity_discounts":
        discountIds.push(row.entity_id);
        break;
      case "raffle_gallery":
        galleryIds.push(row.entity_id);
        break;
    }
  }

  const lookup: RaffleLookup = new Map();
  const [prizes, iw, groups, discounts, gallery] = await Promise.all([
    prizeIds.length
      ? client.prizes.findMany({
          where: { id: { in: prizeIds } },
          select: { id: true, raffle_id: true },
        })
      : [],
    iwIds.length
      ? client.instant_win_prizes.findMany({
          where: { id: { in: iwIds } },
          select: { id: true, raffle_id: true },
        })
      : [],
    groupIds.length
      ? client.instant_win_groups.findMany({
          where: { id: { in: groupIds } },
          select: { id: true, raffle_id: true },
        })
      : [],
    discountIds.length
      ? client.raffle_quantity_discounts.findMany({
          where: { id: { in: discountIds } },
          select: { id: true, raffle_id: true },
        })
      : [],
    galleryIds.length
      ? client.raffle_gallery.findMany({
          where: { id: { in: galleryIds } },
          select: { id: true, raffle_id: true },
        })
      : [],
  ]);

  for (const row of [...prizes, ...iw, ...groups, ...discounts, ...gallery]) {
    lookup.set(row.id, row.raffle_id);
  }
  return lookup;
}
