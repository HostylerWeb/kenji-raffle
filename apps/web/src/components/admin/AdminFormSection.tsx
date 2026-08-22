import type { ReactNode } from "react";

export function AdminFormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="admin-form-section">
      <h4 className="admin-form-section__title">{title}</h4>
      {subtitle && <p className="admin-form-section__subtitle">{subtitle}</p>}
      {children}
    </section>
  );
}
