"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  listSiteCopyKeysForPage,
  resolveSiteCopy,
  resolveSiteCopyValue,
  type SiteCopyKey,
  type SiteCopyOverrides,
  type SiteCopyVars,
} from "@kenji-raffle/shared/site-copy-defaults";
import { operatorFetch } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

type SiteCopyEditorContextValue = {
  active: boolean;
  overrides: SiteCopyOverrides;
  vars: SiteCopyVars;
  saving: SiteCopyKey | null;
  editingKey: SiteCopyKey | null;
  setEditingKey: (key: SiteCopyKey | null) => void;
  getText: (key: SiteCopyKey) => string;
  getRawOverride: (key: SiteCopyKey) => string | undefined;
  saveKey: (key: SiteCopyKey, value: string) => Promise<void>;
  resetKey: (key: SiteCopyKey) => Promise<void>;
  resetPage: (page: string) => Promise<void>;
};

const SiteCopyEditorContext = createContext<SiteCopyEditorContextValue | null>(
  null,
);

export function useSiteCopyEditor(): SiteCopyEditorContextValue | null {
  return useContext(SiteCopyEditorContext);
}

export function useSiteCopyText(key: SiteCopyKey): string {
  const editor = useSiteCopyEditor();
  if (editor) {
    return editor.getText(key);
  }
  return resolveSiteCopyValue(key, {}, {});
}

export function SiteCopyEditorProvider({
  active,
  initialOverrides,
  vars,
  children,
}: {
  active: boolean;
  initialOverrides: SiteCopyOverrides;
  vars: SiteCopyVars;
  children: ReactNode;
}) {
  const { toast } = useToast();
  const [overrides, setOverrides] = useState<SiteCopyOverrides>(initialOverrides);
  const [saving, setSaving] = useState<SiteCopyKey | null>(null);
  const [editingKey, setEditingKey] = useState<SiteCopyKey | null>(null);

  const resolved = useMemo(
    () => resolveSiteCopy(overrides, vars),
    [overrides, vars],
  );

  const getText = useCallback(
    (key: SiteCopyKey) => resolved[key],
    [resolved],
  );

  const getRawOverride = useCallback(
    (key: SiteCopyKey) => overrides[key],
    [overrides],
  );

  const persistUpdates = useCallback(
    async (updates: Record<string, string | null>) => {
      const result = await operatorFetch<{ site_copy: SiteCopyOverrides }>(
        "/v1/admin/site-copy",
        {
          method: "PATCH",
          body: JSON.stringify({ updates }),
        },
      );
      setOverrides(result.site_copy ?? {});
    },
    [],
  );

  const saveKey = useCallback(
    async (key: SiteCopyKey, value: string) => {
      setSaving(key);
      try {
        await persistUpdates({ [key]: value });
        toast("Text saved", "success");
      } catch {
        toast("Could not save text", "error");
      } finally {
        setSaving(null);
      }
    },
    [persistUpdates, toast],
  );

  const resetKey = useCallback(
    async (key: SiteCopyKey) => {
      setSaving(key);
      try {
        await persistUpdates({ [key]: null });
        toast("Reset to default", "success");
      } catch {
        toast("Could not reset text", "error");
      } finally {
        setSaving(null);
      }
    },
    [persistUpdates, toast],
  );

  const resetPage = useCallback(
    async (page: string) => {
      const keys = listSiteCopyKeysForPage(page);
      if (keys.length === 0) return;
      const updates = Object.fromEntries(keys.map((key) => [key, null]));
      setSaving(keys[0] ?? null);
      try {
        await persistUpdates(updates);
        toast("Page reset to defaults", "success");
      } catch {
        toast("Could not reset page", "error");
      } finally {
        setSaving(null);
      }
    },
    [persistUpdates, toast],
  );

  const value = useMemo(
    (): SiteCopyEditorContextValue => ({
      active,
      overrides,
      vars,
      saving,
      editingKey,
      setEditingKey,
      getText,
      getRawOverride,
      saveKey,
      resetKey,
      resetPage,
    }),
    [
      active,
      overrides,
      vars,
      saving,
      editingKey,
      getText,
      getRawOverride,
      saveKey,
      resetKey,
      resetPage,
    ],
  );

  return (
    <SiteCopyEditorContext.Provider value={value}>
      {children}
    </SiteCopyEditorContext.Provider>
  );
}
