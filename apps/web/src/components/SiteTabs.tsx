"use client";

type Tab = {
  id: string;
  label: string;
  count?: number;
};

export function SiteTabs({
  tabs,
  active,
  onChange,
  ariaLabel,
}: {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="site-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`site-tab${active === tab.id ? " site-tab--active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count != null && tab.count > 0 ? ` (${tab.count})` : ""}
        </button>
      ))}
    </div>
  );
}
