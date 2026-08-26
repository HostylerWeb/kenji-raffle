import Link from "next/link";

type Category = { id: string; name: string; slug: string };

export function CategoryPills({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string | null;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="site-category-rail" role="navigation" aria-label="Categories">
      <Link
        href="/raffles"
        className={`site-category-pill${!activeSlug ? " site-category-pill--active" : ""}`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/raffles?category=${cat.slug}`}
          className={`site-category-pill${activeSlug === cat.slug ? " site-category-pill--active" : ""}`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
