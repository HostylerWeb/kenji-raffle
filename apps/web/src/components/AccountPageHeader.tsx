"use client";

type AccountPageHeaderProps = {
  title: string;
  description?: string;
};

export function AccountPageHeader({ title, description }: AccountPageHeaderProps) {
  return (
    <header className="site-account-page-header">
      <h1 className="site-page-title">{title}</h1>
      {description && <p className="site-lead site-account-page-header__lead">{description}</p>}
    </header>
  );
}
