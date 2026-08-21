"use client";

export type AdminTab = {
  id: string;
  label: string;
  badge?: string;
};

export function AdminTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: AdminTab[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="admin-tabs">
      <div className="admin-tabs__list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={`admin-tabs__trigger${
              active === tab.id ? " admin-tabs__trigger--active" : ""
            }`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {tab.badge ? <span className="admin-tabs__badge">{tab.badge}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
