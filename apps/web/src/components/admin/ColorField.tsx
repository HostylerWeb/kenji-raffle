"use client";

import {
  buildFooterGradient,
  isValidHexColor,
  parseFooterGradient,
} from "@kenji-raffle/shared/site-theme";

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  gradient?: boolean;
};

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const h = trimmed.slice(1);
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  return trimmed;
}

function SolidColorField({
  label,
  value,
  onChange,
}: Omit<ColorFieldProps, "gradient">) {
  const hex = isValidHexColor(value) ? value : "#000000";

  return (
    <div className="admin-color-field">
      <span className="admin-color-field__label">{label}</span>
      <div className="admin-color-field__row">
        <span
          className="admin-color-field__swatch"
          style={{ background: hex }}
          aria-hidden
        />
        <input
          type="color"
          className="admin-color-field__picker"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} colour picker`}
        />
        <input
          type="text"
          className="admin-color-field__text"
          value={value.startsWith("#") ? value : hex}
          onChange={(e) => {
            const next = normalizeHex(e.target.value);
            if (isValidHexColor(next)) onChange(next);
          }}
          placeholder="#000000"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function GradientColorField({
  label,
  value,
  onChange,
}: Omit<ColorFieldProps, "gradient">) {
  const { top, bottom } = parseFooterGradient(value);

  function updateTop(next: string) {
    onChange(buildFooterGradient(next, bottom));
  }

  function updateBottom(next: string) {
    onChange(buildFooterGradient(top, next));
  }

  return (
    <div className="admin-color-field admin-color-field--gradient">
      <span className="admin-color-field__label">{label}</span>
      <div className="admin-color-field__gradient-preview" style={{ background: value }} />
      <div className="admin-color-field__gradient-pickers">
        <SolidColorField label="Top colour" value={top} onChange={updateTop} />
        <SolidColorField label="Bottom colour" value={bottom} onChange={updateBottom} />
      </div>
    </div>
  );
}

export function ColorField({ label, value, onChange, gradient }: ColorFieldProps) {
  if (gradient) {
    return <GradientColorField label={label} value={value} onChange={onChange} />;
  }
  return <SolidColorField label={label} value={value} onChange={onChange} />;
}
