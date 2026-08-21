import Link from "next/link";

export function AdminStatCard({
  label,
  value,
  href,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  href?: string;
  icon?: React.ReactNode;
  tone?: "default" | "accent" | "warning" | "success";
}) {
  const content = (
  <>
      <div className="admin-stat-card__top">
        {icon && <div className={`admin-stat-card__icon admin-stat-card__icon--${tone}`}>{icon}</div>}
      </div>
      <div className="admin-stat-card__label">{label}</div>
      <div className="admin-stat-card__value">{value}</div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`admin-stat-card admin-stat-card--link admin-stat-card--${tone}`}>
        {content}
      </Link>
    );
  }

  return <div className={`admin-stat-card admin-stat-card--${tone}`}>{content}</div>;
}
