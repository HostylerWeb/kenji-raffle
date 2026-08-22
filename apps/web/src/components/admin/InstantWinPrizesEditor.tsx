"use client";

import {
  emptyInstantWinRow,
  type InstantWinGroup,
  type InstantWinPrizeRow,
} from "./raffle-form-types";

type Props = {
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  rows: InstantWinPrizeRow[];
  onRowsChange: (rows: InstantWinPrizeRow[]) => void;
  groups: InstantWinGroup[];
  maxEntries: number;
  ticketsGenerated?: boolean;
  readOnly?: boolean;
};

const PRIZE_TYPES: { value: InstantWinPrizeRow["prize_type"]; label: string }[] = [
  { value: "site_credit", label: "Site credit (auto-credited)" },
  { value: "cash", label: "Cash (player claims & withdraws)" },
  { value: "physical", label: "Physical prize (shipping claim)" },
];

export function InstantWinPrizesEditor({
  enabled,
  onEnabledChange,
  rows,
  onRowsChange,
  groups,
  maxEntries,
  ticketsGenerated = false,
  readOnly = false,
}: Props) {
  function updateRow(key: string, patch: Partial<InstantWinPrizeRow>) {
    onRowsChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    onRowsChange(rows.filter((r) => r.key !== key));
  }

  function addRow() {
    onRowsChange([...rows, emptyInstantWinRow(rows.length + 1)]);
  }

  function ensureEnabledWithRow() {
    if (!enabled) onEnabledChange(true);
    if (rows.length === 0) onRowsChange([emptyInstantWinRow(1)]);
  }

  return (
    <div className="admin-panel admin-iw-section">
      <div className="admin-panel__header">
        <div>
          <h3 className="admin-panel__title">Instant win prizes</h3>
          <p className="admin-panel__subtitle">
            Optional prizes players can win immediately when buying tickets — configure
            before generating the ticket pool.
          </p>
        </div>
        <label className="admin-toggle">
          <input
            type="checkbox"
            checked={enabled}
            disabled={readOnly}
            onChange={(e) => {
              const on = e.target.checked;
              onEnabledChange(on);
              if (on && rows.length === 0) onRowsChange([emptyInstantWinRow(1)]);
              if (!on) onRowsChange([]);
            }}
          />
          <span>Enable instant wins</span>
        </label>
      </div>

      {ticketsGenerated && (
        <div className="admin-alert admin-alert--warning" style={{ marginBottom: 16 }}>
          <div>
            <div className="admin-alert__title">Ticket pool already generated</div>
            <div className="admin-alert__body">
              Instant win slots are fixed at generation time. You can pause prizes or edit
              names, but frequency and win counts only apply to a new pool (delete draft and
              recreate, or create a new raffle).
            </div>
          </div>
        </div>
      )}

      {enabled && (
        <div
          className={`admin-iw-capacity${
            rows.some((r) => {
              const last = Number(r.win_frequency) * Number(r.total_available);
              return Boolean(r.name.trim()) && last > maxEntries;
            })
              ? " admin-iw-capacity--warn"
              : ""
          }`}
        >
          <div>
            <strong>{maxEntries.toLocaleString()}</strong>
            Ticket pool
          </div>
          <div>
            <strong>
              {rows
                .filter((r) => r.name.trim())
                .reduce((sum, r) => sum + (Number(r.total_available) || 0), 0)
                .toLocaleString()}
            </strong>
            Instant wins
          </div>
          <div>
            <strong>
              {Math.max(
                0,
                ...rows
                  .filter((r) => r.name.trim())
                  .map((r) => Number(r.win_frequency) * Number(r.total_available) || 0),
              ).toLocaleString()}
            </strong>
            Last win ticket
          </div>
        </div>
      )}

      {!ticketsGenerated && enabled && (
        <div className="admin-iw-help">
          <strong>How it works:</strong> Each prize wins on ticket numbers that are multiples
          of <em>Every N tickets</em> (e.g. N=10 → tickets 10, 20, 30…) until{" "}
          <em>Number of wins</em> is reached. Max pool size: {maxEntries.toLocaleString()}{" "}
          tickets.
        </div>
      )}

      {enabled && (
        <>
          <div className="admin-iw-list">
            {rows.map((row, index) => (
              <div key={row.key} className="admin-iw-card">
                <div className="admin-iw-card__header">
                  <span>Prize group {index + 1}</span>
                  {!readOnly && rows.length > 1 && (
                    <button
                      type="button"
                      className="admin-iw-card__remove"
                      onClick={() => removeRow(row.key)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="admin-iw-card__body">
                  <label className="admin-iw-field admin-iw-field--wide">
                    Prize name
                    <input
                      value={row.name}
                      disabled={readOnly}
                      placeholder="e.g. KES 500 site credit"
                      onChange={(e) => updateRow(row.key, { name: e.target.value })}
                    />
                  </label>
                  <label className="admin-iw-field">
                    Prize type
                    <select
                      value={row.prize_type}
                      disabled={readOnly}
                      onChange={(e) =>
                        updateRow(row.key, {
                          prize_type: e.target.value as InstantWinPrizeRow["prize_type"],
                        })
                      }
                    >
                      {PRIZE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-iw-field">
                    Value (KES)
                    <input
                      type="number"
                      min={0}
                      value={row.prize_value}
                      disabled={readOnly}
                      onChange={(e) => updateRow(row.key, { prize_value: e.target.value })}
                    />
                  </label>
                  <label className="admin-iw-field">
                    Every N tickets
                    <input
                      type="number"
                      min={1}
                      value={row.win_frequency}
                      disabled={readOnly || ticketsGenerated}
                      title="Win on ticket N, 2N, 3N…"
                      onChange={(e) =>
                        updateRow(row.key, { win_frequency: e.target.value })
                      }
                    />
                    <span className="admin-iw-hint">Win on N, 2N, 3N…</span>
                  </label>
                  <label className="admin-iw-field">
                    Number of wins
                    <input
                      type="number"
                      min={1}
                      value={row.total_available}
                      disabled={readOnly || ticketsGenerated}
                      onChange={(e) =>
                        updateRow(row.key, { total_available: e.target.value })
                      }
                    />
                    <span className="admin-iw-hint">Max times this prize can be won</span>
                  </label>
                  <label className="admin-iw-field">
                    Group (optional)
                    <select
                      value={row.group_id}
                      disabled={readOnly || ticketsGenerated}
                      onChange={(e) =>
                        updateRow(row.key, {
                          group_id: e.target.value,
                          new_group_name: e.target.value ? "" : row.new_group_name,
                        })
                      }
                    >
                      <option value="">— No group —</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {!row.group_id && !ticketsGenerated && (
                    <label className="admin-iw-field">
                      Or new group name
                      <input
                        value={row.new_group_name}
                        disabled={readOnly}
                        placeholder="Competing prizes share a group"
                        onChange={(e) =>
                          updateRow(row.key, { new_group_name: e.target.value })
                        }
                      />
                    </label>
                  )}
                  {row.id && (
                    <label className="admin-iw-field">
                      Status
                      <select
                        value={row.status}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateRow(row.key, {
                            status: e.target.value as InstantWinPrizeRow["status"],
                          })
                        }
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                      </select>
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!readOnly && (
            <div className="admin-iw-actions">
              <button type="button" className="btn btn-secondary" onClick={addRow}>
                + Add another prize
              </button>
            </div>
          )}
        </>
      )}

      {!enabled && (
        <p className="muted" style={{ margin: 0 }}>
          Turn on instant wins to add prize groups and configure how they are drawn on
          this raffle.
        </p>
      )}

      {!enabled && !readOnly && (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: 12 }}
          onClick={ensureEnabledWithRow}
        >
          Enable instant wins
        </button>
      )}
    </div>
  );
}
