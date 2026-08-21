"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminConfirm } from "@/components/admin/AdminConfirm";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdminToast } from "@/components/admin/AdminToast";
import { InstantWinPrizesEditor } from "@/components/admin/InstantWinPrizesEditor";
import { RaffleWorkflowBanner } from "@/components/admin/RaffleWorkflowBanner";
import {
  syncInstantWinPrizes,
  validateInstantWinRows,
} from "@/components/admin/instant-win-api";
import {
  emptyInstantWinRow,
  instantWinFromApi,
  type InstantWinGroup,
  type InstantWinPrizeRow,
} from "@/components/admin/raffle-form-types";
import { getOperatorToken, operatorFetch, operatorUpload } from "@/lib/api";

type Prize = {
  id?: string;
  key: string;
  name: string;
  prize_type: string;
  value_kes: string;
};

type GalleryImage = { id: string; image_url: string };

type Category = { id: string; name: string };

type DiscountTier = {
  id?: string;
  key: string;
  min_quantity: number;
  discount_type: string;
  discount_value: number;
};

type Raffle = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  category_id: string | null;
  ticket_price: number;
  max_entries: number;
  min_tickets: number;
  ticket_limit_per_user?: number | null;
  draw_type?: string;
  number_of_winners?: number;
  scheduled_draw_at?: string | null;
  start_date: string | null;
  end_date: string | null;
  is_featured: boolean;
  featured_image_url: string | null;
  prizes?: { id: string; name: string; prize_type: string; value_kes: number | null }[];
  instant_win_prizes?: {
    id: string;
    name: string;
    prize_type: string;
    prize_value: number;
    win_frequency: number;
    total_available: number;
    status: string;
    group_id?: string | null;
  }[];
  gallery?: GalleryImage[];
  ticket_counts?: {
    available: number;
    reserved: number;
    purchased: number;
    total: number;
  };
};

type Settings = { name: string; branding: { primary_color?: string } };

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function newKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function RaffleEditor({ raffleId }: { raffleId?: string }) {
  const isCreate = !raffleId;
  const router = useRouter();
  const { toast } = useAdminToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [tab, setTab] = useState("setup");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [ticketPrice, setTicketPrice] = useState("100");
  const [maxEntries, setMaxEntries] = useState("1000");
  const [minTickets, setMinTickets] = useState("0");
  const [ticketLimitPerUser, setTicketLimitPerUser] = useState("");
  const [drawType, setDrawType] = useState("manual");
  const [numberOfWinners, setNumberOfWinners] = useState("1");
  const [scheduledDrawAt, setScheduledDrawAt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [prizeName, setPrizeName] = useState("");
  const [prizeType, setPrizeType] = useState("physical");
  const [prizeValue, setPrizeValue] = useState("");
  const [instantWinEnabled, setInstantWinEnabled] = useState(false);
  const [instantWinRows, setInstantWinRows] = useState<InstantWinPrizeRow[]>([]);
  const [removedInstantIds, setRemovedInstantIds] = useState<string[]>([]);
  const [groups, setGroups] = useState<InstantWinGroup[]>([]);
  const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>([]);
  const [tierMinQty, setTierMinQty] = useState("10");
  const [tierType, setTierType] = useState("percent");
  const [tierValue, setTierValue] = useState("10");
  const [featuredUrl, setFeaturedUrl] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const applyRaffle = useCallback((data: Raffle) => {
    setRaffle(data);
    setTitle(data.title);
    setSlug(data.slug);
    setDescription(data.description ?? "");
    setTicketPrice(String(data.ticket_price));
    setMaxEntries(String(data.max_entries));
    setMinTickets(String(data.min_tickets ?? 0));
    setTicketLimitPerUser(
      data.ticket_limit_per_user != null ? String(data.ticket_limit_per_user) : "",
    );
    setDrawType(data.draw_type ?? "manual");
    setNumberOfWinners(String(data.number_of_winners ?? 1));
    setScheduledDrawAt(toLocalInput(data.scheduled_draw_at ?? null));
    setCategoryId(data.category_id ?? "");
    setStartDate(toLocalInput(data.start_date));
    setEndDate(toLocalInput(data.end_date));
    setIsFeatured(data.is_featured);
    setFeaturedUrl(data.featured_image_url);
    setGallery(data.gallery ?? []);
    const iw = data.instant_win_prizes ?? [];
    setInstantWinEnabled(iw.length > 0);
    setInstantWinRows(iw.map((p, i) => instantWinFromApi(p, i)));
    setRemovedInstantIds([]);
    setPrizes(
      (data.prizes ?? []).map((p) => ({
        id: p.id,
        key: p.id,
        name: p.name,
        prize_type: p.prize_type,
        value_kes: p.value_kes != null ? String(p.value_kes) : "",
      })),
    );
  }, []);

  const load = useCallback(async (id: string) => {
    const data = await operatorFetch<Raffle>(`/v1/admin/raffles/${id}`);
    applyRaffle(data);
    setGroups(
      await operatorFetch<InstantWinGroup[]>(`/v1/admin/raffles/${id}/instant-win-groups`),
    );
    const tiers = await operatorFetch<
      { id: string; min_quantity: number; discount_type: string; discount_value: number }[]
    >(`/v1/admin/raffles/${id}/quantity-discounts`);
    setDiscountTiers(
      tiers.map((t) => ({
        ...t,
        key: t.id,
      })),
    );
  }, [applyRaffle]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    operatorFetch<Settings>("/v1/admin/settings").then(setSettings);
    operatorFetch<Category[]>("/v1/admin/categories").then(setCategories);
    if (raffleId) load(raffleId).catch(() => router.replace("/admin/raffles"));
  }, [router, raffleId, load]);

  const ticketsGenerated = (raffle?.ticket_counts?.total ?? 0) > 0;
  const status = raffle?.status ?? "draft";
  const instantWinCount = instantWinRows.filter((r) => r.name.trim()).length;

  function failTab(id: string, message: string) {
    setTab(id);
    setError(message);
    toast(message, "error");
  }

  function detailsPayload() {
    return {
      title,
      slug: slug || undefined,
      description,
      ticket_price: Number(ticketPrice),
      max_entries: Number(maxEntries),
      min_tickets: Number(minTickets),
      ticket_limit_per_user: ticketLimitPerUser ? Number(ticketLimitPerUser) : null,
      draw_type: drawType,
      number_of_winners: Number(numberOfWinners),
      scheduled_draw_at: scheduledDrawAt ? new Date(scheduledDrawAt).toISOString() : null,
      category_id: categoryId || null,
      is_featured: isFeatured,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
    };
  }

  async function persistRelated(id: string) {
    if (featuredUrl) {
      await operatorFetch(`/v1/admin/raffles/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ featured_image_url: featuredUrl }),
      });
    }

    for (const img of gallery) {
      if (img.id.startsWith("gal-")) {
        await operatorFetch(`/v1/admin/raffles/${id}/gallery`, {
          method: "POST",
          body: JSON.stringify({ image_url: img.image_url }),
        });
      }
    }
    if (instantWinEnabled) {
      const validation = validateInstantWinRows(instantWinRows, Number(maxEntries) || 1);
      if (validation) throw new Error(validation);
      setGroups(
        await syncInstantWinPrizes(
          id,
          instantWinRows.filter((r) => r.name.trim()),
          groups,
          removedInstantIds,
        ),
      );
      setRemovedInstantIds([]);
    } else if (removedInstantIds.length || instantWinRows.some((r) => r.id)) {
      setGroups(
        await syncInstantWinPrizes(
          id,
          [],
          groups,
          [...removedInstantIds, ...instantWinRows.filter((r) => r.id).map((r) => r.id!)],
        ),
      );
      setRemovedInstantIds([]);
    }

    for (const prize of prizes) {
      if (!prize.name.trim()) continue;
      const body = {
        name: prize.name,
        prize_type: prize.prize_type,
        value_kes: prize.value_kes ? Number(prize.value_kes) : undefined,
      };
      if (prize.id) {
        await operatorFetch(`/v1/admin/raffles/${id}/prizes/${prize.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: prize.name, value_kes: prize.value_kes ? Number(prize.value_kes) : null }),
        });
      } else {
        await operatorFetch(`/v1/admin/raffles/${id}/prizes`, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
    }

    for (const tier of discountTiers) {
      if (tier.id) continue;
      await operatorFetch(`/v1/admin/raffles/${id}/quantity-discounts`, {
        method: "POST",
        body: JSON.stringify({
          min_quantity: tier.min_quantity,
          discount_type: tier.discount_type,
          discount_value: tier.discount_value,
        }),
      });
    }
  }

  async function createRaffle() {
    if (!title.trim()) return failTab("setup", "Title is required.");
    if (instantWinEnabled) {
      const validation = validateInstantWinRows(instantWinRows, Number(maxEntries) || 1);
      if (validation) return failTab("instant-wins", validation);
    }
    setLoading(true);
    setError("");
    try {
      const created = await operatorFetch<{ id: string }>("/v1/admin/raffles", {
        method: "POST",
        body: JSON.stringify({
          title,
          ticket_price: Number(ticketPrice),
          max_entries: Number(maxEntries),
          end_date: endDate ? new Date(endDate).toISOString() : undefined,
          category_id: categoryId || undefined,
        }),
      });
      await operatorFetch(`/v1/admin/raffles/${created.id}`, {
        method: "PATCH",
        body: JSON.stringify(detailsPayload()),
      });
      await persistRelated(created.id);
      toast("Raffle created. Generate tickets when you are ready to go live.");
      router.push(`/admin/raffles/${created.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create raffle";
      setError(message);
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function saveAll() {
    if (!raffleId) return createRaffle();
    if (!title.trim()) return failTab("setup", "Title is required.");
    if (instantWinEnabled) {
      const validation = validateInstantWinRows(instantWinRows, Number(maxEntries) || 1);
      if (validation) return failTab("instant-wins", validation);
    }
    setLoading(true);
    setError("");
    try {
      await operatorFetch(`/v1/admin/raffles/${raffleId}`, {
        method: "PATCH",
        body: JSON.stringify(detailsPayload()),
      });
      await persistRelated(raffleId);
      await load(raffleId);
      toast("Saved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function generateTickets() {
    if (!raffleId) return;
    setLoading(true);
    try {
      await operatorFetch(`/v1/admin/raffles/${raffleId}/tickets/generate`, { method: "POST" });
      await load(raffleId);
      toast("Ticket pool generated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generate failed";
      toast(message, "error");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(next: string) {
    if (!raffleId) return;
    setLoading(true);
    try {
      await operatorFetch(`/v1/admin/raffles/${raffleId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      await load(raffleId);
      toast(`Status: ${next}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Status update failed";
      toast(message, "error");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function goLive() {
    if (!raffleId) return;
    setLoading(true);
    try {
      if (!ticketsGenerated) {
        await operatorFetch(`/v1/admin/raffles/${raffleId}/tickets/generate`, { method: "POST" });
      }
      try {
        await operatorFetch(`/v1/admin/raffles/${raffleId}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "listed" }),
        });
      } catch {
        /* already listed */
      }
      await operatorFetch(`/v1/admin/raffles/${raffleId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "active" }),
      });
      await load(raffleId);
      toast("Raffle is live");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not go live";
      toast(message, "error");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function uploadFeatured(file: File) {
    setLoading(true);
    try {
      const uploaded = await operatorUpload("/v1/admin/media/upload", file);
      if (raffleId) {
        await operatorFetch(`/v1/admin/raffles/${raffleId}`, {
          method: "PATCH",
          body: JSON.stringify({ featured_image_url: uploaded.url }),
        });
        await load(raffleId);
      } else {
        setFeaturedUrl(uploaded.url);
      }
      toast("Featured image uploaded");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function addGallery(file: File) {
    setLoading(true);
    try {
      const uploaded = await operatorUpload("/v1/admin/media/upload", file);
      if (raffleId) {
        await operatorFetch(`/v1/admin/raffles/${raffleId}/gallery`, {
          method: "POST",
          body: JSON.stringify({ image_url: uploaded.url }),
        });
        await load(raffleId);
      } else {
        setGallery((prev) => [...prev, { id: newKey("gal"), image_url: uploaded.url }]);
      }
      toast("Gallery image added");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setLoading(false);
    }
  }

  const editorTabs = [
    { id: "setup", label: "Setup" },
    {
      id: "instant-wins",
      label: "Instant wins",
      badge: instantWinCount > 0 ? String(instantWinCount) : undefined,
    },
    {
      id: "media",
      label: "Media",
      badge:
        (featuredUrl ? 1 : 0) + gallery.length > 0
          ? String((featuredUrl ? 1 : 0) + gallery.length)
          : undefined,
    },
    {
      id: "prizes",
      label: "Main prizes",
      badge: prizes.length > 0 ? String(prizes.length) : undefined,
    },
    {
      id: "discounts",
      label: "Discounts",
      badge: discountTiers.length > 0 ? String(discountTiers.length) : undefined,
    },
    ...(!isCreate ? [{ id: "publish", label: "Go live" }] : []),
  ];

  if (!isCreate && !raffle) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" />
        Loading raffle…
      </div>
    );
  }

  return (
    <OperatorAdminShell
      title={isCreate ? "Create raffle" : raffle?.title ?? "Edit raffle"}
      description={
        isCreate
          ? "Configure everything here, then create. Generate tickets and go live without leaving this page."
          : `Status: ${status}${raffle?.ticket_counts ? ` · ${raffle.ticket_counts.purchased} sold` : ""}`
      }
      branding={{
        name: settings?.name,
        primary_color: settings?.branding?.primary_color,
      }}
      actions={
        !isCreate && raffle ? (
          <AdminStatusBadge status={status} />
        ) : undefined
      }
    >
      <AdminPageHeader
        crumbs={[
          { href: "/admin/raffles", label: "Raffles" },
          { label: isCreate ? "New" : raffle?.title ?? "Edit" },
        ]}
        extra={
          raffle ? (
            <span className="admin-breadcrumb">
              <Link href={`/admin/raffles/${raffle.id}/tickets`}>Inspect tickets</Link>
              {" · "}
              <Link href={`/raffles/${raffle.slug}`} target="_blank">
                Public page
              </Link>
            </span>
          ) : null
        }
      />

      {error && <p className="error">{error}</p>}

      <RaffleWorkflowBanner
        status={status}
        ticketsGenerated={ticketsGenerated}
        hasInstantWins={instantWinCount > 0}
      />

      <AdminTabs active={tab} onChange={setTab} tabs={editorTabs} />

      {tab === "setup" && (
        <div className="admin-tab-panel">
          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">Details</h3>
                <p className="admin-panel__subtitle">Shown on the public raffle page.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <label className="admin-form-grid__full">
                Title
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </label>
              {!isCreate && (
                <label className="admin-form-grid__full">
                  Slug
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} required />
                </label>
              )}
              <label className="admin-form-grid__full">
                Description
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
              </label>
              <label>
                Ticket price (KES)
                <input type="number" min={1} value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} />
              </label>
              <label>
                Max entries
                <input type="number" min={1} value={maxEntries} onChange={(e) => setMaxEntries(e.target.value)} />
              </label>
              <label>
                Min tickets before draw
                <input type="number" min={0} value={minTickets} onChange={(e) => setMinTickets(e.target.value)} />
              </label>
              <label>
                Max tickets per user
                <input
                  type="number"
                  min={1}
                  value={ticketLimitPerUser}
                  onChange={(e) => setTicketLimitPerUser(e.target.value)}
                  placeholder="No limit"
                />
              </label>
              <label>
                Draw type
                <select value={drawType} onChange={(e) => setDrawType(e.target.value)}>
                  <option value="manual">manual</option>
                  <option value="automatic">automatic</option>
                  <option value="scheduled">scheduled</option>
                </select>
              </label>
              <label>
                Number of winners
                <input type="number" min={1} value={numberOfWinners} onChange={(e) => setNumberOfWinners(e.target.value)} />
              </label>
              {drawType === "scheduled" && (
                <label>
                  Scheduled draw at
                  <input type="datetime-local" value={scheduledDrawAt} onChange={(e) => setScheduledDrawAt(e.target.value)} />
                </label>
              )}
              {categories.length > 0 && (
                <label>
                  Category
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                Start date
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label>
                End date
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>
              <label className="admin-form-grid__checkbox">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                Featured on home
              </label>
            </div>
          </div>
        </div>
      )}

      {tab === "instant-wins" && (
        <div className="admin-tab-panel">
          <InstantWinPrizesEditor
            enabled={instantWinEnabled}
            onEnabledChange={(on) => {
              setInstantWinEnabled(on);
              if (on && instantWinRows.length === 0) setInstantWinRows([emptyInstantWinRow(1)]);
            }}
            rows={instantWinRows}
            onRowsChange={(newRows) => {
              const removed = instantWinRows.filter((r) => r.id && !newRows.some((n) => n.key === r.key));
              if (removed.length) {
                setRemovedInstantIds((prev) => [
                  ...prev,
                  ...removed.map((r) => r.id!).filter((id) => !prev.includes(id)),
                ]);
              }
              setInstantWinRows(newRows);
            }}
            groups={groups}
            maxEntries={Number(maxEntries) || 1}
            ticketsGenerated={ticketsGenerated}
          />
        </div>
      )}

      {tab === "media" && (
        <div className="admin-tab-panel">
          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">Featured image</h3>
                <p className="admin-panel__subtitle">Hero and card image.</p>
              </div>
            </div>
            {featuredUrl && <img src={featuredUrl} alt="" className="admin-media-preview" />}
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFeatured(file);
            }} />
          </div>
          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">Gallery</h3>
                <p className="admin-panel__subtitle">Additional photos on the public page.</p>
              </div>
            </div>
            <div className="admin-gallery-grid">
              {gallery.map((img) => (
                <div key={img.id} className="admin-gallery-item">
                  <img src={img.image_url} alt="" />
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) addGallery(file);
            }} />
          </div>
        </div>
      )}

      {tab === "prizes" && (
        <div className="admin-tab-panel">
          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">Main prizes</h3>
                <p className="admin-panel__subtitle">Awarded at the end-of-raffle draw.</p>
              </div>
            </div>
            {prizes.map((p) => (
              <div key={p.key} className="admin-form-grid" style={{ marginBottom: 12 }}>
                <label>
                  Name
                  <input value={p.name} onChange={(e) => setPrizes((rows) => rows.map((r) => r.key === p.key ? { ...r, name: e.target.value } : r))} />
                </label>
                <label>
                  Type
                  <select value={p.prize_type} onChange={(e) => setPrizes((rows) => rows.map((r) => r.key === p.key ? { ...r, prize_type: e.target.value } : r))}>
                    <option value="physical">physical</option>
                    <option value="cash">cash</option>
                    <option value="site_credit">site_credit</option>
                  </select>
                </label>
                <label>
                  Value (KES)
                  <input type="number" value={p.value_kes} onChange={(e) => setPrizes((rows) => rows.map((r) => r.key === p.key ? { ...r, value_kes: e.target.value } : r))} />
                </label>
              </div>
            ))}
            <form
              className="admin-form-grid"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                setPrizes((prev) => [
                  ...prev,
                  { key: newKey("prize"), name: prizeName, prize_type: prizeType, value_kes: prizeValue },
                ]);
                setPrizeName("");
                setPrizeValue("");
              }}
            >
              <label>
                Prize name
                <input value={prizeName} onChange={(e) => setPrizeName(e.target.value)} required />
              </label>
              <label>
                Type
                <select value={prizeType} onChange={(e) => setPrizeType(e.target.value)}>
                  <option value="physical">physical</option>
                  <option value="cash">cash</option>
                  <option value="site_credit">site_credit</option>
                </select>
              </label>
              <label>
                Value (KES)
                <input type="number" value={prizeValue} onChange={(e) => setPrizeValue(e.target.value)} />
              </label>
              <div className="admin-form-grid__full admin-form-actions">
                <button type="submit" className="btn btn-secondary">Add prize</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === "discounts" && (
        <div className="admin-tab-panel">
          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">Quantity discounts</h3>
                <p className="admin-panel__subtitle">Applied automatically in the cart.</p>
              </div>
            </div>
            {discountTiers.map((t) => (
              <p key={t.key} className="muted">
                {t.min_quantity}+ tickets · {t.discount_type} {t.discount_value}
              </p>
            ))}
            <form
              className="admin-form-grid"
              onSubmit={(e) => {
                e.preventDefault();
                setDiscountTiers((prev) => [
                  ...prev,
                  {
                    key: newKey("tier"),
                    min_quantity: Number(tierMinQty),
                    discount_type: tierType,
                    discount_value: Number(tierValue),
                  },
                ]);
              }}
            >
              <label>
                Min quantity
                <input type="number" value={tierMinQty} onChange={(e) => setTierMinQty(e.target.value)} />
              </label>
              <label>
                Type
                <select value={tierType} onChange={(e) => setTierType(e.target.value)}>
                  <option value="percent">percent</option>
                  <option value="fixed">fixed</option>
                </select>
              </label>
              <label>
                Value
                <input type="number" value={tierValue} onChange={(e) => setTierValue(e.target.value)} />
              </label>
              <div className="admin-form-grid__full admin-form-actions">
                <button type="submit" className="btn btn-secondary">Add tier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === "publish" && raffle && raffleId && (
        <div className="admin-tab-panel">
          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">Go live</h3>
                <p className="admin-panel__subtitle">
                  Generate the ticket pool, then publish. One click can do both.
                </p>
              </div>
            </div>
            {raffle.ticket_counts && (
              <p className="muted">
                Tickets — available {raffle.ticket_counts.available}, reserved {raffle.ticket_counts.reserved},
                purchased {raffle.ticket_counts.purchased}, total {raffle.ticket_counts.total}
              </p>
            )}
            <div className="admin-form-actions">
              {!ticketsGenerated && (
                <button type="button" className="btn btn-secondary" disabled={loading} onClick={generateTickets}>
                  Generate tickets only
                </button>
              )}
              {status === "draft" || status === "listed" ? (
                <AdminConfirm
                  title="Go live?"
                  body="This generates the ticket pool if needed and sets the raffle to active so players can buy."
                  confirmLabel="Go live"
                  onConfirm={goLive}
                >
                  {(open) => (
                    <button type="button" className="btn" disabled={loading} onClick={open}>
                      Go live
                    </button>
                  )}
                </AdminConfirm>
              ) : null}
              {ticketsGenerated && status === "draft" && (
                <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => setStatus("listed")}>
                  List without selling
                </button>
              )}
              {(status === "to_be_drawn" || status === "active") && (
                <AdminConfirm
                  title="Run draw now?"
                  body="This cannot be undone."
                  confirmLabel="Run draw"
                  danger
                  onConfirm={async () => {
                    await operatorFetch(`/v1/admin/raffles/${raffleId}/draw`, { method: "POST" });
                    await load(raffleId);
                    toast("Draw complete");
                  }}
                >
                  {(open) => (
                    <button type="button" className="btn" disabled={loading} onClick={open}>
                      Run draw
                    </button>
                  )}
                </AdminConfirm>
              )}
              {status !== "draft" && status !== "cancelled" && status !== "drawn" && (
                <AdminConfirm
                  title="Cancel raffle?"
                  body="Players will no longer be able to buy tickets."
                  confirmLabel="Cancel raffle"
                  danger
                  onConfirm={() => setStatus("cancelled")}
                >
                  {(open) => (
                    <button type="button" className="btn btn-secondary" disabled={loading} onClick={open}>
                      Cancel raffle
                    </button>
                  )}
                </AdminConfirm>
              )}
              {status === "draft" && (
                <AdminConfirm
                  title="Delete draft?"
                  body="This permanently deletes the raffle."
                  confirmLabel="Delete"
                  danger
                  onConfirm={async () => {
                    await operatorFetch(`/v1/admin/raffles/${raffleId}`, { method: "DELETE" });
                    router.push("/admin/raffles");
                  }}
                >
                  {(open) => (
                    <button type="button" className="btn btn-danger" disabled={loading} onClick={open}>
                      Delete draft
                    </button>
                  )}
                </AdminConfirm>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="admin-sticky-footer">
        <button type="button" className="btn" disabled={loading} onClick={saveAll}>
          {loading ? "Saving…" : isCreate ? "Create raffle" : "Save"}
        </button>
        <Link href="/admin/raffles" className="btn btn-secondary">
          Back to raffles
        </Link>
      </div>
    </OperatorAdminShell>
  );
}
