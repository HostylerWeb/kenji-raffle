"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlatformShell } from "../../components/PlatformShell";
import { PlatformAccountSecurity } from "../../components/PlatformAccountSecurity";
import {
  isAuthenticated,
  platformFetch,
} from "../../lib/api";
import { usePlatformSession } from "../../lib/use-platform-session";

type Settings = {
  tenant_base_domain: string;
  alert_email: string | null;
  rollup_schedule: string;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");
  const { isAdmin: admin, ready } = usePlatformSession();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    if (!ready || !admin) return;
    platformFetch<Settings>("/v1/platform/system/settings")
      .then(setSettings)
      .catch(() => undefined);
  }, [router, admin, ready]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setMessage("");
    try {
      const updated = await platformFetch<Settings>(
        "/v1/platform/system/settings",
        {
          method: "PATCH",
          body: JSON.stringify(settings),
        },
      );
      setSettings(updated);
      setMessage("Settings saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <PlatformShell title="Settings">
      <PlatformAccountSecurity />

      {ready && admin && (
        <section className="card" style={{ marginTop: 24 }}>
          <h2>Platform configuration</h2>
          <p className="muted">
            Global defaults for tenant hostnames, alerts, and rollups.
          </p>
          {!settings ? (
            <p className="muted">Loading platform settings…</p>
          ) : (
            <form className="form" onSubmit={onSave}>
              <label>
                Tenant base domain
                <input
                  value={settings.tenant_base_domain}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tenant_base_domain: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Alert email
                <input
                  type="email"
                  value={settings.alert_email ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      alert_email: e.target.value || null,
                    })
                  }
                />
              </label>
              <label>
                Rollup schedule (cron)
                <input
                  value={settings.rollup_schedule}
                  onChange={(e) =>
                    setSettings({ ...settings, rollup_schedule: e.target.value })
                  }
                />
              </label>
              <label>
                SMTP host
                <input
                  value={settings.smtp_host ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      smtp_host: e.target.value || null,
                    })
                  }
                />
              </label>
              <label>
                SMTP port
                <input
                  type="number"
                  value={settings.smtp_port ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      smtp_port: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </label>
              <label>
                SMTP user
                <input
                  value={settings.smtp_user ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      smtp_user: e.target.value || null,
                    })
                  }
                />
              </label>
              <button type="submit" className="btn">Save platform settings</button>
              {message && <p className="muted">{message}</p>}
            </form>
          )}
        </section>
      )}
    </PlatformShell>
  );
}
