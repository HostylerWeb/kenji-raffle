import Link from "next/link";
import { headers } from "next/headers";
import { CategoryPills } from "@/components/CategoryPills";
import { EmptyState } from "@/components/EmptyState";
import { RaffleCard, type RaffleCardData } from "@/components/RaffleCard";
import { SitePageIntro } from "@/components/SitePageIntro";
import { getSiteCopy } from "@/lib/site-copy";
import { getRequestHost, getTenantContext, publicFetch } from "@/lib/tenant";

type Category = { id: string; name: string; slug: string };

function filterQuery(params: {
  category?: string;
  ending_soon?: string;
  featured?: string;
  sort?: string;
}) {
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.ending_soon) q.set("ending_soon", "true");
  if (params.featured) q.set("featured", "true");
  if (params.sort) q.set("sort", params.sort);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export default async function RafflesPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    ending_soon?: string;
    featured?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);

  if (!tenant) {
    return <h1 className="site-page-title">Site not found</h1>;
  }

  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.ending_soon) query.set("ending_soon", "true");
  if (params.featured) query.set("featured", "true");

  const [rafflesRaw, categories] = await Promise.all([
    publicFetch<RaffleCardData[]>(`/v1/raffles?${query.toString()}`, host).catch(
      () => [] as RaffleCardData[],
    ),
    publicFetch<Category[]>("/v1/categories", host).catch(() => [] as Category[]),
  ]);

  const raffles = [...rafflesRaw];
  if (params.sort === "price_asc") {
    raffles.sort((a, b) => a.ticket_price - b.ticket_price);
  } else if (params.sort === "price_desc") {
    raffles.sort((a, b) => b.ticket_price - a.ticket_price);
  }

  const baseFilters = {
    category: params.category,
    ending_soon: params.ending_soon,
    featured: params.featured,
  };

  return (
    <>
      <SitePageIntro
        breadcrumb="← Home"
        title={getSiteCopy(tenant, "raffles.page.title")}
        lead={getSiteCopy(tenant, "raffles.page.lead", { tenantName: tenant.name })}
        titleCopyKey="raffles.page.title"
        leadCopyKey="raffles.page.lead"
      />

      {categories.length > 0 && (
        <div className="site-page-block">
          <CategoryPills categories={categories} activeSlug={params.category} />
        </div>
      )}

      <div className="site-raffles-toolbar site-page-block">
        <Link
          href={`/raffles${filterQuery(baseFilters)}`}
          className={`site-filter-chip${!params.category && !params.ending_soon && !params.featured && !params.sort ? " site-filter-chip--active" : ""}`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/raffles${filterQuery({ ...baseFilters, category: cat.slug })}`}
            className={`site-filter-chip${params.category === cat.slug ? " site-filter-chip--active" : ""}`}
          >
            {cat.name}
          </Link>
        ))}
        <Link
          href={`/raffles${filterQuery({ ...baseFilters, ending_soon: "true" })}`}
          className={`site-filter-chip${params.ending_soon ? " site-filter-chip--active" : ""}`}
        >
          Ending soon
        </Link>
        <Link
          href={`/raffles${filterQuery({ ...baseFilters, featured: "true" })}`}
          className={`site-filter-chip${params.featured ? " site-filter-chip--active" : ""}`}
        >
          Featured
        </Link>
        <Link
          href={`/raffles${filterQuery({ ...baseFilters, sort: "price_asc" })}`}
          className={`site-filter-chip${params.sort === "price_asc" ? " site-filter-chip--active" : ""}`}
        >
          Price ↑
        </Link>
        <Link
          href={`/raffles${filterQuery({ ...baseFilters, sort: "price_desc" })}`}
          className={`site-filter-chip${params.sort === "price_desc" ? " site-filter-chip--active" : ""}`}
        >
          Price ↓
        </Link>
      </div>

      {raffles.length === 0 ? (
        <EmptyState
          title={getSiteCopy(tenant, "raffles.empty.title")}
          description={getSiteCopy(tenant, "raffles.empty.body")}
          actionHref="/raffles"
          actionLabel="View all raffles"
          titleCopyKey="raffles.empty.title"
          descriptionCopyKey="raffles.empty.body"
        />
      ) : (
        <div className="site-raffle-grid site-raffle-grid--commerce">
          {raffles.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </div>
      )}
    </>
  );
}
