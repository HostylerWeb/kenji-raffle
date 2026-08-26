export type SiteThemeColors = {
  accent: string;
  headerBg: string;
  headerText: string;
  headerLink: string;
  footerBg: string;
  footerText: string;
  footerLink: string;
  buttonBg: string;
  buttonText: string;
  linkColor: string;
  linkHover: string;
};

export type SiteThemePresetId =
  | "kenji-green"
  | "ocean-blue"
  | "royal-purple"
  | "sunset-coral"
  | "slate-pro"
  | "midnight-dark"
  | "custom";

export const SITE_THEME_PRESETS: Record<
  Exclude<SiteThemePresetId, "custom">,
  SiteThemeColors & { label: string; description: string }
> = {
  "kenji-green": {
    label: "Kenji Green",
    description: "Clean white header, dark footer, trusted green accent.",
    accent: "#00a551",
    headerBg: "#ffffff",
    headerText: "#0f172a",
    headerLink: "#007a3d",
    footerBg: "linear-gradient(180deg, #0b1220 0%, #0f172a 100%)",
    footerText: "#94a3b8",
    footerLink: "#cbd5e1",
    buttonBg: "#00a551",
    buttonText: "#ffffff",
    linkColor: "#007a3d",
    linkHover: "#00a551",
  },
  "ocean-blue": {
    label: "Ocean Blue",
    description: "Professional navy footer with calm blue highlights.",
    accent: "#0284c7",
    headerBg: "#ffffff",
    headerText: "#0c4a6e",
    headerLink: "#0369a1",
    footerBg: "linear-gradient(180deg, #082f49 0%, #0c4a6e 100%)",
    footerText: "#94a3b8",
    footerLink: "#bae6fd",
    buttonBg: "#0284c7",
    buttonText: "#ffffff",
    linkColor: "#0369a1",
    linkHover: "#0284c7",
  },
  "royal-purple": {
    label: "Royal Purple",
    description: "Premium purple accent with soft lilac header tint.",
    accent: "#7c3aed",
    headerBg: "#faf5ff",
    headerText: "#3b0764",
    headerLink: "#6d28d9",
    footerBg: "linear-gradient(180deg, #2e1065 0%, #1e1b4b 100%)",
    footerText: "#c4b5fd",
    footerLink: "#e9d5ff",
    buttonBg: "#7c3aed",
    buttonText: "#ffffff",
    linkColor: "#6d28d9",
    linkHover: "#7c3aed",
  },
  "sunset-coral": {
    label: "Sunset Coral",
    description: "Warm, energetic palette for lifestyle prizes.",
    accent: "#ea580c",
    headerBg: "#fff7ed",
    headerText: "#431407",
    headerLink: "#c2410c",
    footerBg: "linear-gradient(180deg, #431407 0%, #292524 100%)",
    footerText: "#fdba74",
    footerLink: "#fed7aa",
    buttonBg: "#ea580c",
    buttonText: "#ffffff",
    linkColor: "#c2410c",
    linkHover: "#ea580c",
  },
  "slate-pro": {
    label: "Slate Pro",
    description: "Neutral corporate look — safe for any operator.",
    accent: "#475569",
    headerBg: "#ffffff",
    headerText: "#0f172a",
    headerLink: "#334155",
    footerBg: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
    footerText: "#94a3b8",
    footerLink: "#e2e8f0",
    buttonBg: "#334155",
    buttonText: "#ffffff",
    linkColor: "#475569",
    linkHover: "#1e293b",
  },
  "midnight-dark": {
    label: "Midnight Dark",
    description: "Dark header and footer with bright cyan accent.",
    accent: "#06b6d4",
    headerBg: "#0f172a",
    headerText: "#f8fafc",
    headerLink: "#22d3ee",
    footerBg: "linear-gradient(180deg, #020617 0%, #0f172a 100%)",
    footerText: "#94a3b8",
    footerLink: "#67e8f9",
    buttonBg: "#06b6d4",
    buttonText: "#042f2e",
    linkColor: "#0891b2",
    linkHover: "#06b6d4",
  },
};

const COLOR_KEYS: (keyof SiteThemeColors)[] = [
  "accent",
  "headerBg",
  "headerText",
  "headerLink",
  "footerBg",
  "footerText",
  "footerLink",
  "buttonBg",
  "buttonText",
  "linkColor",
  "linkHover",
];

function isValidHex(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

function isGradient(value: string): boolean {
  return value.includes("gradient(");
}

export function sanitizeThemeColor(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.trim()) return fallback;
  const trimmed = value.trim();
  if (isValidHex(trimmed) || isGradient(trimmed)) return trimmed;
  return fallback;
}

export function resolveSiteTheme(input: {
  themePreset?: string | null;
  primaryColor?: string | null;
  themeConfig?: Record<string, unknown> | null;
}): SiteThemeColors & { preset: SiteThemePresetId } {
  const presetId = (input.themePreset ?? "kenji-green") as SiteThemePresetId;
  const basePreset =
    presetId !== "custom" && presetId in SITE_THEME_PRESETS
      ? SITE_THEME_PRESETS[presetId as Exclude<SiteThemePresetId, "custom">]
      : SITE_THEME_PRESETS["kenji-green"];

  const { label: _l, description: _d, ...base } = basePreset;
  const overrides = input.themeConfig ?? {};
  const resolved: SiteThemeColors = { ...base };

  for (const key of COLOR_KEYS) {
    resolved[key] = sanitizeThemeColor(overrides[key], base[key]);
  }

  if (input.primaryColor && isValidHex(input.primaryColor.trim())) {
    resolved.accent = input.primaryColor.trim();
    if (presetId !== "custom") {
      resolved.buttonBg = input.primaryColor.trim();
      resolved.linkHover = input.primaryColor.trim();
    }
  }

  if (presetId === "custom") {
    for (const key of COLOR_KEYS) {
      if (overrides[key] != null) {
        resolved[key] = sanitizeThemeColor(overrides[key], resolved[key]);
      }
    }
  }

  return { ...resolved, preset: presetId };
}

export function themeToCssVariables(
  theme: SiteThemeColors,
): Record<string, string> {
  return {
    "--tenant-accent": theme.accent,
    "--site-header-bg": theme.headerBg,
    "--site-header-text": theme.headerText,
    "--site-header-link": theme.headerLink,
    "--site-footer-bg": theme.footerBg,
    "--site-footer-text": theme.footerText,
    "--site-footer-link": theme.footerLink,
    "--site-button-bg": theme.buttonBg,
    "--site-button-text": theme.buttonText,
    "--site-link-color": theme.linkColor,
    "--site-link-hover": theme.linkHover,
  };
}

export function extractThemeConfig(
  colors: SiteThemeColors,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of COLOR_KEYS) {
    out[key] = colors[key];
  }
  return out;
}
