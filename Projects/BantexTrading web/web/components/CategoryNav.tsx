import { categoryBySlug, type CategorySlug } from "@/lib/site";

// Data-driven category/subcategory pills. Always shows "All items"; configured
// subcategories append automatically. Server-rendered (no filtering yet).
export default function CategoryNav({ categorySlug }: { categorySlug: CategorySlug }) {
  const category = categoryBySlug(categorySlug);
  const subcategories = category?.subcategories ?? [];

  return (
    <nav className="cat-pills" aria-label={`${category?.name ?? "Category"} filters`}>
      <span className="cat-pill active">All items</span>
      {subcategories.map((sub) => (
        <span key={sub.slug} className="cat-pill">
          {sub.name}
        </span>
      ))}
    </nav>
  );
}
